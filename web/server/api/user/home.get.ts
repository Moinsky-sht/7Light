/**
 * 首页数据 API
 * GET /api/user/home
 */

import { defineEventHandler, createError } from 'h3'
import { db, users, userProfiles, checkinStats, lampStatus, socialConnections } from '../../db'
import { getUserFromEvent } from '../../utils/jwt'
import { eq, and, or, sql } from 'drizzle-orm'

const safeJson = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
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
    // 获取用户基本信息
    const user = await db.select().from(users).where(eq(users.id, auth.userId)).get()
    
    if (!user) {
      throw createError({
        statusCode: 404,
        message: '用户不存在'
      })
    }

    // 获取用户资料
    const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, auth.userId)).get()

    // 获取打卡统计
    let stats = await db.select().from(checkinStats).where(eq(checkinStats.userId, auth.userId)).get()
    
    // 检查是否需要重置今日答题数（跨天）
    const today = new Date().toISOString().split('T')[0]
    if (stats && stats.lastCheckinDate !== today) {
      // 重置今日答题数
      await db.update(checkinStats)
        .set({ todayAnswered: 0 })
        .where(eq(checkinStats.userId, auth.userId))
      
      stats = { ...stats, todayAnswered: 0 }
    }

    // 获取已亮灯数量
    const litLamps = await db.select({ count: sql<number>`count(*)` })
      .from(lampStatus)
      .where(and(
        eq(lampStatus.userId, auth.userId),
        eq(lampStatus.state, 'ON')
      ))
      .get()

    const friendsAccepted = await db.select({ count: sql<number>`count(*)` })
      .from(socialConnections)
      .where(and(
        eq(socialConnections.status, 'ACCEPTED'),
        or(
          eq(socialConnections.userId, auth.userId),
          eq(socialConnections.friendId, auth.userId)
        )
      ))
      .get()

    const friendsCount = friendsAccepted?.count || 0

    // 计算续命天数（秒转天）
    const lifeDays = stats?.lifeSeconds ? Math.floor(stats.lifeSeconds / 86400) : 0

    // 计算今日是否已点亮主灯（答满3题）
    const todayAnswered = stats?.todayAnswered ?? 0
    const isLit = todayAnswered >= 3

    // 计算当前亮度（每答1题增加10，最高30）
    const brightness = Math.min(todayAnswered * 10, 30)

    return {
      success: true,
      data: {
        // 用户信息
        user: {
          id: user.id,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl
        },
        // 续命时长（天）
        lifeDays,
        lifeSeconds: stats?.lifeSeconds || 0,
        // 打卡统计
        totalDays: stats?.totalDays || 0,
        currentStreak: stats?.currentStreak || 0,
        maxStreak: stats?.maxStreak || 0,
        // 今日进度
        todayProgress: {
          answered: stats?.todayAnswered || 0,
          required: 3,
          isLit,
          brightness
        },
        // 灯阵统计
        lampsLit: litLamps?.count || 0,
        lampsTotal: 49,
        // 社交统计
        friendsCount,
        // Profile Data
        profile: profile ? {
          gender: profile.gender,
          birthDate: profile.birthDate,
          heightCm: profile.heightCm,
          weightKg: profile.weightKg,
          bmi: profile.bmi,
          goals: safeJson<string[]>(profile.goals, []),
          chronicDiseases: safeJson<string[]>(profile.chronicDiseases, []),
          allergies: safeJson<string[]>(profile.allergies, []),
          sleepPattern: profile.sleepPattern,
          dietHabit: profile.dietHabit,
          exerciseFreq: profile.exerciseFreq,
          smokeDrink: safeJson(profile.smokeDrink, null),
          occupation: profile.occupation
        } : null
      }
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Get home data error:', error)
    throw createError({
      statusCode: 500,
      message: '获取首页数据失败'
    })
  }
})
