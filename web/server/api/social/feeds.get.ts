/**
 * 获取社交动态
 * GET /api/social/feeds
 */
import { defineEventHandler, createError, getQuery } from 'h3'
import { db, socialInteractions, users } from '../../db'
import { getUserFromEvent } from '../../utils/jwt'
import { desc, eq, inArray } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const auth = getUserFromEvent(event)

  if (!auth) {
    throw createError({
      statusCode: 401,
      message: '未登录'
    })
  }

  const query = getQuery(event)
  const limit = Math.min(parseInt(query.limit as string) || 50, 100)

  try {
    const items = await db.select()
      .from(socialInteractions)
      .where(eq(socialInteractions.toUserId, auth.userId))
      .orderBy(desc(socialInteractions.createdAt))
      .limit(limit)
      .all()

    if (items.length === 0) {
      return { success: true, data: { items: [] } }
    }

    const fromIds = Array.from(new Set(items.map(i => i.fromUserId)))
    const userRows = await db.select({
      id: users.id,
      nickname: users.nickname,
      avatarUrl: users.avatarUrl
    })
      .from(users)
      .where(inArray(users.id, fromIds))
      .all()

    const userMap = new Map(userRows.map(u => [u.id, u]))

    return {
      success: true,
      data: {
        items: items.map(item => {
          const sender = userMap.get(item.fromUserId)
          return {
            id: item.id,
            fromNickname: sender?.nickname || '灯友',
            avatarUrl: sender?.avatarUrl || null,
            content: item.content || '',
            createdAt: item.createdAt,
            isRead: Boolean(item.isRead),
            type: item.type
          }
        })
      }
    }
  } catch (error: any) {
    console.error('Get feeds error:', error)
    throw createError({
      statusCode: 500,
      message: '获取动态失败'
    })
  }
})
