/**
 * 星阵数据 API（灯友星空）
 * GET /api/social/starfield
 */

import { defineEventHandler, createError } from 'h3'
import { db, users, socialConnections, checkinStats, lampStatus } from '../../db'
import { getUserFromEvent } from '../../utils/jwt'
import { eq, and, or, sql, inArray } from 'drizzle-orm'

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

  try {
    // 获取当前用户信息
    const currentUser = await db.select().from(users).where(eq(users.id, auth.userId)).get()
    const currentStats = await db.select().from(checkinStats).where(eq(checkinStats.userId, auth.userId)).get()
    const currentLitLamps = await db.select({ count: sql<number>`count(*)` })
      .from(lampStatus)
      .where(and(
        eq(lampStatus.userId, auth.userId),
        eq(lampStatus.state, 'ON')
      ))
      .get()

    // 获取所有已接受的好友关系
    const connections = await db.select()
      .from(socialConnections)
      .where(and(
        or(
          eq(socialConnections.userId, auth.userId),
          eq(socialConnections.friendId, auth.userId)
        ),
        eq(socialConnections.status, 'ACCEPTED')
      ))
      .all()

    // 获取好友ID列表
    const friendIds = connections.map(c => 
      c.userId === auth.userId ? c.friendId : c.userId
    )

    // 构建星阵数据
    const today = new Date().toISOString().split('T')[0]
    const stars = []

    // 添加当前用户（中心星）
    stars.push({
      id: auth.userId,
      nickname: currentUser?.nickname || '我',
      avatarUrl: currentUser?.avatarUrl,
      isSelf: true,
      // 位置（中心）
      position: { x: 0, y: 0, z: 0 },
      // 亮度（根据打卡状态）
      brightness: currentStats?.lastCheckinDate === today ? 1.0 : 0.3,
      // 打卡状态
      todayCheckedIn: currentStats?.lastCheckinDate === today,
      currentStreak: currentStats?.currentStreak || 0,
      totalDays: currentStats?.totalDays || 0,
      // 灯阵状态
      litLamps: currentLitLamps?.count || 0,
      // 星光颜色（根据连续打卡天数）
      starColor: getStarColor(currentStats?.currentStreak || 0)
    })

    if (friendIds.length > 0) {
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

      for (let i = 0; i < uniqueFriendIds.length; i++) {
        const friendId = uniqueFriendIds[i]
        const friend = userMap.get(friendId)
        if (!friend) continue

        const friendStats = statsMap.get(friendId)

        // 计算位置（环绕中心分布）
        const angle = (i / uniqueFriendIds.length) * Math.PI * 2
        const radius = 2 + Math.random() * 3
        const position = {
          x: Math.cos(angle) * radius,
          y: (Math.random() - 0.5) * 2,
          z: Math.sin(angle) * radius
        }

        stars.push({
          id: friendId,
          nickname: friend.nickname,
          avatarUrl: friend.avatarUrl || getAvatarUrl(friendId),
          isSelf: false,
          position,
          brightness: friendStats?.lastCheckinDate === today ? 1.0 : 0.3,
          todayCheckedIn: friendStats?.lastCheckinDate === today,
          currentStreak: friendStats?.currentStreak || 0,
          totalDays: friendStats?.totalDays || 0,
          litLamps: litMap.get(friendId) || 0,
          starColor: getStarColor(friendStats?.currentStreak || 0)
        })
      }
    }

    // 统计数据
    const checkedInCount = stars.filter(s => s.todayCheckedIn).length
    const notCheckedInCount = stars.length - checkedInCount

    return {
      success: true,
      data: {
        updatedAt: new Date().toISOString(),
        summary: {
          totalStars: stars.length,
          checkedInToday: checkedInCount,
          notCheckedIn: notCheckedInCount,
          checkedInPercentage: Math.round((checkedInCount / stars.length) * 100)
        },
        stars
      }
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Get starfield error:', error)
    throw createError({
      statusCode: 500,
      message: '获取星阵数据失败'
    })
  }
})

/**
 * 根据连续打卡天数获取星光颜色
 */
function getStarColor(streak: number): string {
  if (streak >= 30) return '#FFD700' // 金色 - 30天以上
  if (streak >= 14) return '#FFA500' // 橙色 - 14天以上
  if (streak >= 7) return '#FF6B6B'  // 红色 - 7天以上
  if (streak >= 3) return '#4ECDC4'  // 青色 - 3天以上
  return '#FFFFFF' // 白色 - 默认
}
