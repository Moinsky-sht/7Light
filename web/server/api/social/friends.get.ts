/**
 * 获取灯友列表 API
 * GET /api/social/friends
 */

import { defineEventHandler, createError, getQuery } from 'h3'
import { db, users, socialConnections, checkinStats, lampStatus } from '../../db'
import { getUserFromEvent } from '../../utils/jwt'
import { eq, and, or, sql, inArray } from 'drizzle-orm'

// 辅助函数：根据ID获取头像
const getAvatarUrl = (id: string) => {
  let sum = 0
  for (let i = 0; i < id.length; i++) {
    sum += id.charCodeAt(i)
  }
  const index = (sum % 50) + 1
  return `/avatars/sanguo_avatars/${index.toString().padStart(2, '0')}.jpg`
}

export default defineEventHandler(async (event) => {
  const auth = getUserFromEvent(event)
  
  if (!auth) {
    throw createError({
      statusCode: 401,
      message: '未登录'
    })
  }

  const query = getQuery(event)
  const status = query.status as string || 'ACCEPTED' // PENDING/ACCEPTED/ALL

  try {
    // 获取好友关系
    let connections
    if (status === 'ALL') {
      connections = await db.select()
        .from(socialConnections)
        .where(or(
          eq(socialConnections.userId, auth.userId),
          eq(socialConnections.friendId, auth.userId)
        ))
        .all()
    } else {
      connections = await db.select()
        .from(socialConnections)
        .where(and(
          or(
            eq(socialConnections.userId, auth.userId),
            eq(socialConnections.friendId, auth.userId)
          ),
          eq(socialConnections.status, status)
        ))
        .all()
    }

    // 获取好友ID列表
    const friendIds = connections.map(c =>
      c.userId === auth.userId ? c.friendId : c.userId
    )

    if (friendIds.length === 0) {
      return {
        success: true,
        data: {
          total: 0,
          friends: [],
          myCode: 'QXD' + auth.userId.substring(0, 6).toUpperCase()
        }
      }
    }

    // 批量获取好友信息
    const uniqueFriendIds = Array.from(new Set(friendIds))
    const [userRows, statsRows, litRows] = await Promise.all([
      db.select().from(users).where(inArray(users.id, uniqueFriendIds)).all(),
      db.select().from(checkinStats).where(inArray(checkinStats.userId, uniqueFriendIds)).all(),
      db.select({
        userId: lampStatus.userId,
        count: sql<number>`count(*)`.mapWith(Number)
      })
        .from(lampStatus)
        .where(and(
          inArray(lampStatus.userId, uniqueFriendIds),
          eq(lampStatus.state, 'ON')
        ))
        .groupBy(lampStatus.userId)
        .all()
    ])

    const userMap = new Map(userRows.map(u => [u.id, u]))
    const statsMap = new Map(statsRows.map(s => [s.userId, s]))
    const litMap = new Map(litRows.map(l => [l.userId, l.count]))

    const today = new Date().toISOString().split('T')[0]
    const friends = uniqueFriendIds
      .map(friendId => {
        const user = userMap.get(friendId)
        if (!user) return null
        const stats = statsMap.get(friendId)
        const connection = connections.find(c =>
          (c.userId === auth.userId && c.friendId === friendId) ||
          (c.friendId === auth.userId && c.userId === friendId)
        )

        return {
          id: user.id,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl || getAvatarUrl(user.id),
          streak: stats?.currentStreak || 0,
          currentStreak: stats?.currentStreak || 0,
          totalDays: stats?.totalDays || 0,
          todayCheckedIn: stats?.lastCheckinDate === today,
          litLamps: litMap.get(friendId) || 0,
          connectionStatus: connection?.status,
          connectionId: connection?.id,
          isRequester: connection?.userId === auth.userId
        }
      })
      .filter(Boolean)

    return {
      success: true,
      data: {
        total: friends.length,
        friends,
        myCode: 'QXD' + auth.userId.substring(0, 6).toUpperCase()
      }
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Get friends error:', error)
    throw createError({
      statusCode: 500,
      message: '获取灯友列表失败'
    })
  }
})
