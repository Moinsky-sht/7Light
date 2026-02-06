/**
 * 获取打卡记录 API
 * GET /api/checkin/history
 */

import { defineEventHandler, createError } from 'h3'
import { db } from '../../db'
import { checkinLogs } from '../../db/schema'
import { getUserFromEvent } from '../../utils/jwt'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const auth = getUserFromEvent(event)
  
  if (!auth) {
    throw createError({
      statusCode: 401,
      message: '未登录'
    })
  }

  try {
    // 获取用户的打卡记录，按时间倒序，最多50条
    const logs = await db.select()
      .from(checkinLogs)
      .where(eq(checkinLogs.userId, auth.userId))
      .orderBy(desc(checkinLogs.createdAt))
      .limit(50)

    // 如果没有真实记录，返回空数据
    if (logs.length === 0) {
      return {
        success: true,
        data: []
      }
    }

    return {
      success: true,
      data: logs
    }
  } catch (error: any) {
    console.error('获取打卡记录失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取打卡记录失败'
    })
  }
})
