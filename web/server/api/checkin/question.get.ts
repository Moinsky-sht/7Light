/**
 * 获取今日问题 API
 * GET /api/checkin/question
 * 
 * 根据用户画像和灯状态，智能选择需要补充的维度生成问题
 */

import { defineEventHandler, createError } from 'h3'
import { v4 as uuidv4 } from 'uuid'
import { db, userProfiles, lampStatus, promptTemplates, dimensions, dimensionSubItems } from '../../db'
import { getUserFromEvent } from '../../utils/jwt'
import { eq, asc, and, sql } from 'drizzle-orm'
import { generateQuestionWithAI } from '../../services/ai'
import { QUESTION_TEMPLATES } from '../../constants/questionTemplates'

// 维度定义
const DIMENSIONS = {
  1: { name: '天枢', label: '命火', category: '打卡' },
  2: { name: '天璇', label: '谷神', category: '饮食' },
  3: { name: '天玑', label: '动静', category: '运动' },
  4: { name: '天权', label: '归根', category: '睡眠' },
  5: { name: '玉衡', label: '调息', category: '心理' },
  6: { name: '开阳', label: '营卫', category: '体征' },
  7: { name: '摇光', label: '固表', category: '环境' }
}

// 子项定义
const SUB_ITEMS = {
  2: ['碳水', '蔬果', '蛋白', '油盐', '饮水', '节律', '知止'],
  3: ['步数', '心肺', '肌力', '破坐', '拉伸', '姿态', '户外'],
  4: ['入睡', '时长', '效率', '连续', '醒感', '仪式', '午憩'],
  5: ['稳定', '压力', '专注', '社交', '愉悦', '冥想', '截断'],
  6: ['排泄', '皮肤', '痛感', '体温', '视疲', '呼吸', '指标'],
  7: ['光磁', '清气', '节气', '离屏', '噪音', '光合', '温湿']
}

export default defineEventHandler(async (event) => {
  const auth = getUserFromEvent(event)
  
  if (!auth) {
    throw createError({
      statusCode: 401,
      message: '未登录'
    })
  }

  try {
    // 获取用户资料（用于个性化）
    const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, auth.userId)).get()

    // 获取用户灯状态，找出最暗/最久未更新的维度
    const lamps = await db.select()
      .from(lampStatus)
      .where(eq(lampStatus.userId, auth.userId))
      .orderBy(asc(lampStatus.brightness), asc(lampStatus.updatedAt))
      .all()

    // 排除天枢（打卡维度，由系统自动处理）
    const candidateLamps = lamps.filter(l => l.dimensionId !== 1)

    // 目标维度优先级映射
    const GOAL_DIMENSIONS: Record<string, number[]> = {
      '减肥瘦身': [2, 3], // 饮食、运动
      '改善睡眠': [4],    // 睡眠
      '缓解压力': [5],    // 心理
      '增强体质': [3, 6], // 运动、体征
      '慢病管理': [2, 6]  // 饮食、体征
    }

    let prioritizedDims: number[] = []
    if (profile && profile.goals) {
      try {
        const goals = JSON.parse(profile.goals) as string[]
        goals.forEach(goal => {
          if (GOAL_DIMENSIONS[goal]) {
            prioritizedDims.push(...GOAL_DIMENSIONS[goal])
          }
        })
      } catch (e) {
        // ignore json parse error
      }
    }

    // 选择最需要补充的灯
    let selectedDim = 2 // 默认饮食
    let selectedSub = 1
    
    if (candidateLamps.length > 0) {
      // 1. 优先选择用户目标相关的未亮灯
      const goalOffLamps = candidateLamps.filter(l => l.state === 'OFF' && prioritizedDims.includes(l.dimensionId))
      
      // 2. 其次选择任意未亮的灯
      const anyOffLamps = candidateLamps.filter(l => l.state === 'OFF')
      
      // 3. 确定候选池
      let targetPool = []
      
      if (goalOffLamps.length > 0) {
        targetPool = goalOffLamps
      } else if (anyOffLamps.length > 0) {
        targetPool = anyOffLamps
      } else {
        // 如果都亮了，取亮度最低/最久未更新的前5个作为候选，增加随机性
        targetPool = candidateLamps.slice(0, 5)
      }

      // 4. 从候选池中随机选择一个
      const targetLamp = targetPool.length > 0 
        ? targetPool[Math.floor(Math.random() * targetPool.length)]
        : { dimensionId: 2, subItemId: 1 } // Fallback
                         
      selectedDim = targetLamp.dimensionId
      selectedSub = targetLamp.subItemId
    }

    const dimRow = await db.select().from(dimensions).where(eq(dimensions.id, selectedDim)).get()
    const subRow = await db.select().from(dimensionSubItems).where(eq(dimensionSubItems.id, `${selectedDim}:${selectedSub}`)).get()

    const fallbackTemplates = QUESTION_TEMPLATES[selectedDim]?.[selectedSub] || [
      `关于${dimRow?.category || DIMENSIONS[selectedDim as keyof typeof DIMENSIONS]?.category || '健康'}，今天情况如何？`
    ]

    let question = fallbackTemplates[Math.floor(Math.random() * fallbackTemplates.length)]

    try {
      const rows = await db
        .select({ template: promptTemplates.template })
        .from(promptTemplates)
        .where(
          and(
            eq(promptTemplates.type, 'QUESTION'),
            eq(promptTemplates.status, 'ACTIVE'),
            eq(promptTemplates.dimensionId, selectedDim),
            eq(promptTemplates.subItemId, selectedSub)
          )
        )
        .orderBy(sql`RANDOM()`)
        .limit(1)
        .all()

      if (rows?.[0]?.template) {
        question = rows[0].template
      }
    } catch {}

    // 尝试使用 AI 生成更个性化的问题
    try {
      const dimName = dimRow?.name || DIMENSIONS[selectedDim as keyof typeof DIMENSIONS]?.name || '未知'
      const subName = subRow?.name || SUB_ITEMS[selectedDim as keyof typeof SUB_ITEMS]?.[selectedSub - 1] || '未知'
      
      const aiQuestion = await generateQuestionWithAI(
        selectedDim, 
        selectedSub, 
        dimName, 
        subName, 
        profile
      )
      
      if (aiQuestion) {
        question = aiQuestion
      }
    } catch (e) {
      console.error('AI generate question failed, fallback to template:', e)
    }

    // 生成问题ID
    const questionId = uuidv4()

    return {
      success: true,
      data: {
        questionId,
        dimensionId: selectedDim,
        subItemId: selectedSub,
        dimensionName: dimRow?.name || DIMENSIONS[selectedDim as keyof typeof DIMENSIONS]?.name || '未知',
        dimensionLabel: dimRow?.label || DIMENSIONS[selectedDim as keyof typeof DIMENSIONS]?.label || '未知',
        subItemName: subRow?.name || SUB_ITEMS[selectedDim as keyof typeof SUB_ITEMS]?.[selectedSub - 1] || '未知',
        question
      }
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Get question error:', error)
    throw createError({
      statusCode: 500,
      message: '获取问题失败'
    })
  }
})
