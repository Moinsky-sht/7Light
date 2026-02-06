/**
 * 排行榜 API
 * GET /api/social/leaderboard
 * 
 * 支持多种排行榜类型：
 * -续命天数 (life_days)
 * -连续打卡 (streak)
 * -点亮星灯 (lamps)
 * -累计打卡 (total_days)
 */

import { defineEventHandler, createError, getQuery } from 'h3'
import { db, users, checkinStats, lampStatus, socialConnections } from '../../db'
import { getUserFromEvent } from '../../utils/jwt'
import { eq, sql, desc, and, or } from 'drizzle-orm'

type LeaderboardType = 'life_days' | 'streak' | 'lamps' | 'total_days' | 'friends'

const SVG_ICONS: Record<LeaderboardType, string> = {
  life_days: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z',
  streak: 'M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z',
  lamps: 'M12 2l-5.5 9h11z M17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z M3 21.5h8v-8H3v8zm2-6h4v4H5v-4z',
  total_days: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z',
  friends: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'
}

const LEADERBOARD_CONFIG: Record<LeaderboardType, { 
  title: string
  iconSvg: string
  orderBy: string
  description: string
}> = {
  life_days: {
    title: '续命天数',
    iconSvg: SVG_ICONS.life_days,
    orderBy: 'life_seconds',
    description: '累计续命时长'
  },
  streak: {
    title: '连续打卡',
    iconSvg: SVG_ICONS.streak,
    orderBy: 'current_streak',
    description: '连续不间断打卡'
  },
  lamps: {
    title: '点亮星灯',
    iconSvg: SVG_ICONS.lamps,
    orderBy: 'lamps',
    description: '已点亮的星灯数量'
  },
  total_days: {
    title: '累计打卡',
    iconSvg: SVG_ICONS.total_days,
    orderBy: 'total_days',
    description: '历史累计打卡天数'
  },
  friends: {
    title: '灯友数量',
    iconSvg: SVG_ICONS.friends,
    orderBy: 'friends',
    description: '志同道合的灯友'
  }
}

export default defineEventHandler(async (event) => {
  const auth = getUserFromEvent(event)
  const query = getQuery(event)
  
  const type = (query.type as LeaderboardType) || 'life_days'
  const limit = Math.min(parseInt(query.limit as string) || 20, 100)
  
  if (!LEADERBOARD_CONFIG[type]) {
    throw createError({
      statusCode: 400,
      message: '无效的排行榜类型'
    })
  }

  try {
    let leaderboardData: any[] = []

    // 仅使用真实数据库查询
    switch (type) {
        case 'life_days':
        case 'streak':
        case 'total_days': {
          const orderColumn =
            type === 'life_days'
              ? checkinStats.lifeSeconds
              : type === 'streak'
                ? checkinStats.currentStreak
                : checkinStats.totalDays

          const statsData = await db.select({
            userId: checkinStats.userId,
            lifeSeconds: checkinStats.lifeSeconds,
            currentStreak: checkinStats.currentStreak,
            totalDays: checkinStats.totalDays
          })
            .from(checkinStats)
            .orderBy(desc(orderColumn))
            .limit(limit)
            .all()

          if (statsData.length === 0) break;

          const userIds = statsData.map(s => s.userId)
          const userDetails = await db.select({
            id: users.id,
            nickname: users.nickname,
            avatarUrl: users.avatarUrl
          })
            .from(users)
            .where(sql`${users.id} IN ${userIds}`)
            .all()

          const userMap = new Map(userDetails.map(u => [u.id, u]))
          
          leaderboardData = statsData.map((stat, index) => {
            const user = userMap.get(stat.userId)
            return {
              rank: index + 1,
              userId: stat.userId,
              nickname: user?.nickname || '匿名灯友',
              avatarUrl: user?.avatarUrl || null,
              value: type === 'life_days' 
                ? Math.floor((stat.lifeSeconds || 0) / 86400)
                : type === 'streak'
                ? stat.currentStreak || 0
                : stat.totalDays || 0,
              title: getRankTitle(index + 1)
            }
          })
          break
        }

        case 'lamps': {
          const lampCounts = await db.select({
            userId: lampStatus.userId,
            count: sql<number>`count(*)`.mapWith(Number)
          })
            .from(lampStatus)
            .where(eq(lampStatus.state, 'ON'))
            .groupBy(lampStatus.userId)
            .orderBy(desc(sql<number>`count(*)`))
            .limit(limit)
            .all()

          if (lampCounts.length === 0) break;

          const lampUserIds = lampCounts.map(l => l.userId)
          const userDetails = await db.select({
            id: users.id,
            nickname: users.nickname,
            avatarUrl: users.avatarUrl
          })
            .from(users)
            .where(sql`${users.id} IN ${lampUserIds}`)
            .all()

          const userMap = new Map(userDetails.map(u => [u.id, u]))
          
          leaderboardData = lampCounts.map((lamp, index) => {
            const user = userMap.get(lamp.userId)
            return {
              rank: index + 1,
              userId: lamp.userId,
              nickname: user?.nickname || '匿名灯友',
              avatarUrl: user?.avatarUrl || null,
              value: lamp.count,
              title: getRankTitle(index + 1)
            }
          })
          break
        }

        case 'friends': {
          const allUsers = await db.select({
            id: users.id,
            nickname: users.nickname,
            avatarUrl: users.avatarUrl
          })
            .from(users)
            .limit(limit * 2)
            .all()

          const friendCounts = await Promise.all(
            allUsers.map(async (user) => {
              const count = await db.select({ count: sql<number>`count(*)` })
                .from(socialConnections)
                .where(and(
                  eq(socialConnections.status, 'ACCEPTED'),
                  or(
                    eq(socialConnections.userId, user.id),
                    eq(socialConnections.friendId, user.id)
                  )
                ))
                .get()
              return {
                userId: user.id,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl,
                count: count?.count || 0
              }
            })
          )

          friendCounts.sort((a, b) => b.count - a.count)
          
          leaderboardData = friendCounts.slice(0, limit).map((item, index) => ({
            rank: index + 1,
            userId: item.userId,
            nickname: item.nickname || '匿名灯友',
            avatarUrl: item.avatarUrl || null,
            value: item.count,
            title: getRankTitle(index + 1)
          }))
          break
        }
    }

    let currentUserRank: { rank: number; value: number } | null = null
    if (auth) {
      const myRank = leaderboardData.findIndex(item => item.userId === auth.userId)
      if (myRank !== -1) {
        currentUserRank = {
          rank: myRank + 1,
          value: leaderboardData[myRank].value
        }
      }
    }

    const formattedData = leaderboardData.map((item, index) => ({
      ...item,
      isTop3: item.rank <= 3,
      medal: item.rank === 1 ? 'gold' : item.rank === 2 ? 'silver' : item.rank === 3 ? 'bronze' : null
    }))

    return {
      success: true,
      data: {
        type,
        title: LEADERBOARD_CONFIG[type].title,
        iconSvg: LEADERBOARD_CONFIG[type].iconSvg,
        description: LEADERBOARD_CONFIG[type].description,
        leaderboard: formattedData,
        currentUserRank,
        totalCount: formattedData.length
      }
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Get leaderboard error:', error)
    throw createError({
      statusCode: 500,
      message: '获取排行榜失败'
    })
  }
})

function getRankTitle(rank: number): string {
  const titles: Record<number, string> = {
    1: '天下无双',
    2: '绝世英雄',
    3: '威震华夏',
    4: '勇冠三军',
    5: '忠肝义胆',
    6: '智勇双全',
    7: '义薄云天',
    8: '乱世豪杰',
    9: '人中吕布',
    10: '一代枭雄'
  }
  return titles[rank] || ''
}
