/**
 * 打卡答题 API
 * POST /api/checkin/answer
 * 
 * 接收用户回答，调用 AI 解析，更新灯状态
 */

import { defineEventHandler, readBody, createError } from 'h3'
import { v4 as uuidv4 } from 'uuid'
import { db, checkinLogs, checkinStats, lampStatus, userProfiles } from '../../db'
import { getUserFromEvent } from '../../utils/jwt'
import { eq, and } from 'drizzle-orm'
import { parseAnswerWithAI, type AIParseResult } from '../../services/ai'

/**
 * 基础回答有效性验证
 * 在调用 AI 之前过滤明显无效的回答
 */
function validateAnswerBasic(answer: string, question?: string): { valid: boolean; reply: string } {
  // 1. 长度检查：太短的回答通常无意义
  if (answer.length < 2) {
    return { valid: false, reply: '施主，请详细描述一下。' }
  }

  // 2. 纯数字/符号检查（除非问题明确需要数字）
  if (/^[\d\s\.\,\-\+]+$/.test(answer) && answer.length < 5) {
    // 允许类似 "8000步"、"7小时" 这样的回答
    if (!/步|小时|分钟|杯|次|个|克|斤|公里|米/.test(answer)) {
      return { valid: false, reply: '施主，请说明具体情况。' }
    }
  }

  // 3. 无意义内容检查
  const meaninglessPatterns = [
    /^[啊哦嗯呃额哈呵嘿哼唉]+$/,           // 纯语气词
    /^[a-zA-Z]+$/,                          // 纯英文字母（非单词）
    /^(测试|test|asdf|qwer|1234|abcd)+$/i,  // 测试内容
    /^(.)\1{2,}$/,                          // 重复字符如 "啊啊啊"
    /^[？?!！。，,\.]+$/,                   // 纯标点
    /^(不知道|不清楚|随便|算了|没有|无|略|pass)$/i,  // 敷衍回答
  ]

  for (const pattern of meaninglessPatterns) {
    if (pattern.test(answer)) {
      return { valid: false, reply: '施主，请认真回答，方能续命。' }
    }
  }

  // 4. 检查是否与问题相关（简单关键词匹配）
  if (question) {
    const questionLower = question.toLowerCase()
    const answerLower = answer.toLowerCase()
    
    // 健康相关问题的关键词
    const healthKeywords = {
      '蔬果': ['吃', '没吃', '有', '没有', '种', '个', '苹果', '香蕉', '蔬菜', '水果', '是', '否', '对', '不'],
      '运动': ['走', '跑', '步', '运动', '锻炼', '没', '有', '分钟', '小时', '次'],
      '睡眠': ['睡', '醒', '小时', '点', '早', '晚', '好', '差', '失眠'],
      '喝水': ['喝', '杯', '升', '毫升', '水', '没', '有'],
      '情绪': ['好', '不好', '开心', '难过', '焦虑', '平静', '还行', '一般'],
    }

    // 检查问题类型并验证回答是否包含相关词
    let hasRelevantContent = false
    
    for (const [topic, keywords] of Object.entries(healthKeywords)) {
      if (questionLower.includes(topic) || keywords.some(k => questionLower.includes(k))) {
        // 问题涉及这个主题，检查回答是否相关
        if (keywords.some(k => answerLower.includes(k))) {
          hasRelevantContent = true
          break
        }
      }
    }

    // 如果问题有明确主题但回答完全不相关
    // 这里放宽一些，因为用户可能用不同的表达方式
    // 只有当回答非常短且不包含任何健康相关词时才拒绝
    if (!hasRelevantContent && answer.length < 5) {
      // 检查是否包含任何肯定/否定词
      const basicResponses = ['是', '否', '有', '没', '对', '不', '好', '行', '可以', '做了', '吃了', '喝了']
      if (!basicResponses.some(r => answerLower.includes(r))) {
        return { valid: false, reply: '施主，请针对问题作答。' }
      }
    }
  }

  // 5. 通过基础验证
  return { valid: true, reply: '' }
}

export default defineEventHandler(async (event) => {
  const auth = getUserFromEvent(event)
  
  if (!auth) {
    throw createError({
      statusCode: 401,
      message: '未登录'
    })
  }

  const body = await readBody(event)
  const { requestId, questionId, question, answerText, dimensionId, subItemId } = body

  // 参数校验
  if (!answerText?.trim()) {
    throw createError({
      statusCode: 400,
      message: '回答内容不能为空'
    })
  }

  const trimmedAnswer = answerText.trim()

  // 基础有效性验证（在调用 AI 之前）
  const validationResult = validateAnswerBasic(trimmedAnswer, question)
  if (!validationResult.valid) {
    return {
      success: true,
      data: {
        valid: false,
        reply: validationResult.reply,
        dimensionId,
        subItemId,
        score: 0
      }
    }
  }

  // 生成请求ID（幂等，按用户隔离）
  const clientRequestId = typeof requestId === 'string' ? requestId.trim() : ''
  const reqId = clientRequestId ? `${auth.userId}:${clientRequestId}` : uuidv4()

  try {
    // 幂等检查
    const existingLog = await db.select()
      .from(checkinLogs)
      .where(and(
        eq(checkinLogs.requestId, reqId),
        eq(checkinLogs.userId, auth.userId)
      ))
      .get()

    if (existingLog) {
      return {
        success: true,
        message: '该请求已处理',
        data: {
          valid: existingLog.isValid,
          reply: existingLog.aiReply,
          dimensionId: existingLog.dimensionId,
          subItemId: existingLog.subItemId
        }
      }
    }

    // 获取用户资料
    const profile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, auth.userId))
      .get()

    // 调用 AI 解析
    const aiResult = await parseAnswerWithAI(
      question || '健康状况如何？',
      answerText,
      dimensionId || 2,
      subItemId || 1,
      profile,
      { userId: auth.userId, requestId: reqId, questionId }
    )

    // 记录打卡日志
    const logId = uuidv4()
    await db.insert(checkinLogs).values({
      id: logId,
      userId: auth.userId,
      requestId: reqId,
      questionId,
      question,
      answerText,
      inputType: 'TEXT',
      aiResult: JSON.stringify(aiResult),
      dimensionId: aiResult.dimension_id,
      subItemId: aiResult.sub_item_id,
      metricName: aiResult.metric_name,
      valueExtracted: String(aiResult.value_extracted),
      score: aiResult.score,
      isValid: aiResult.valid,
      aiReply: aiResult.reply,
      createdAt: new Date().toISOString()
    })

    // 如果有效，更新灯状态和统计
    if (aiResult.valid) {
      const today = new Date().toISOString().split('T')[0]

      // 先获取当前灯状态
      const currentLamp = await db.select()
        .from(lampStatus)
        .where(and(
          eq(lampStatus.userId, auth.userId),
          eq(lampStatus.dimensionId, aiResult.dimension_id),
          eq(lampStatus.subItemId, aiResult.sub_item_id)
        ))
        .get()

      // 更新灯状态
      await db.update(lampStatus)
        .set({
          state: 'ON',
          brightness: Math.min(3, (aiResult.score > 7 ? 3 : aiResult.score > 4 ? 2 : 1)),
          lastValue: String(aiResult.value_extracted),
          litCount: (currentLamp?.litCount || 0) + 1,
          updatedAt: new Date().toISOString()
        })
        .where(and(
          eq(lampStatus.userId, auth.userId),
          eq(lampStatus.dimensionId, aiResult.dimension_id),
          eq(lampStatus.subItemId, aiResult.sub_item_id)
        ))

      // 获取当前统计
      const stats = await db.select()
        .from(checkinStats)
        .where(eq(checkinStats.userId, auth.userId))
        .get()

      if (stats) {
        const isNewDay = stats.lastCheckinDate !== today
        const newTodayAnswered = isNewDay ? 1 : (stats.todayAnswered || 0) + 1
        const isFirstCheckinToday = isNewDay
        
        // 计算连续打卡
        let newStreak = stats.currentStreak || 0
        if (isFirstCheckinToday) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
          if (stats.lastCheckinDate === yesterday) {
            newStreak += 1
          } else {
            newStreak = 1
          }
        }

        // 更新统计
        await db.update(checkinStats)
          .set({
            todayAnswered: newTodayAnswered,
            lastCheckinDate: today,
            currentStreak: newStreak,
            maxStreak: Math.max(stats.maxStreak || 0, newStreak),
            totalDays: isFirstCheckinToday ? (stats.totalDays || 0) + 1 : stats.totalDays,
            lifeSeconds: (stats.lifeSeconds || 0) + 86400 // 每次有效打卡增加1天
          })
          .where(eq(checkinStats.userId, auth.userId))

        // 更新天枢（打卡维度）的灯状态
        const streakSubItem = Math.min(newStreak, 7)
        for (let i = 1; i <= 7; i++) {
          await db.update(lampStatus)
            .set({
              state: i <= streakSubItem ? 'ON' : 'OFF',
              brightness: i <= streakSubItem ? 3 : 0,
              updatedAt: new Date().toISOString()
            })
            .where(and(
              eq(lampStatus.userId, auth.userId),
              eq(lampStatus.dimensionId, 1),
              eq(lampStatus.subItemId, i)
            ))
        }
      }
    }

    return {
      success: true,
      data: {
        valid: aiResult.valid,
        reply: aiResult.reply,
        dimensionId: aiResult.dimension_id,
        subItemId: aiResult.sub_item_id,
        metricName: aiResult.metric_name,
        score: aiResult.score
      }
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Checkin answer error:', error)
    throw createError({
      statusCode: 500,
      message: '处理回答失败，请稍后重试'
    })
  }
})
