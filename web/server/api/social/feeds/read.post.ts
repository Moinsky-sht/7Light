/**
 * 标记动态已读
 * POST /api/social/feeds/read
 */
import { defineEventHandler, createError } from 'h3'
import { db, socialInteractions } from '../../../db'
import { getUserFromEvent } from '../../../utils/jwt'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const auth = getUserFromEvent(event)

  if (!auth) {
    throw createError({
      statusCode: 401,
      message: '未登录'
    })
  }

  try {
    await db.update(socialInteractions)
      .set({ isRead: true })
      .where(eq(socialInteractions.toUserId, auth.userId))

    return { success: true }
  } catch (error: any) {
    console.error('Mark feeds read error:', error)
    throw createError({
      statusCode: 500,
      message: '更新动态状态失败'
    })
  }
})
