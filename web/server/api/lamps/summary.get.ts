
import { defineEventHandler, getQuery, createError } from 'h3'
import { db, checkinLogs, userProfiles, lampStatus } from '../../db'
import { getUserFromEvent } from '../../utils/jwt'
import { eq, and, desc, sql } from 'drizzle-orm'
import { generateLampSummary } from '../../services/ai'

export default defineEventHandler(async (event) => {
  const auth = getUserFromEvent(event)
  if (!auth) {
    throw createError({ statusCode: 401, message: '未登录' })
  }

  const query = getQuery(event)
  const dimId = parseInt(query.dimId as string)

  if (!dimId) {
    throw createError({ statusCode: 400, message: '缺少维度ID' })
  }

  try {
    // 1. 获取维度基本信息
    const lamp = await db.select()
      .from(lampStatus)
      .where(and(
        eq(lampStatus.userId, auth.userId),
        eq(lampStatus.dimensionId, dimId)
      ))
      .limit(1)
      .get()

    // 2. 获取最近打卡记录 (最近10条)
    const logs = await db.select()
      .from(checkinLogs)
      .where(and(
        eq(checkinLogs.userId, auth.userId),
        eq(checkinLogs.dimensionId, dimId),
        eq(checkinLogs.isValid, true)
      ))
      .orderBy(desc(checkinLogs.createdAt))
      .limit(10)
      .all()

    // 3. 获取用户画像
    const profile = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, auth.userId))
      .get()

    // 4. 生成AI总结
    // 只有当有记录时才生成，否则返回空状态
    let aiSummary = {
      summary: '暂无足够数据生成总结',
      suggestions: ['请先完成该维度的打卡']
    }

    if (logs.length > 0) {
      // 维度名称映射
      const dimNames = ['未知', '天枢', '天璇', '天玑', '天权', '玉衡', '开阳', '摇光']
      const dimName = dimNames[dimId] || '未知'
      
      aiSummary = await generateLampSummary(dimId, dimName, logs, profile)
    }

    return {
      success: true,
      data: {
        lamp,
        logs,
        aiSummary
      }
    }

  } catch (error: any) {
    console.error('Get lamp summary error:', error)
    throw createError({
      statusCode: 500,
      message: '获取总结失败'
    })
  }
})
