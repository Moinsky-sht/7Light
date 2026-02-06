/**
 * 获取当前用户信息 API
 * GET /api/auth/me
 */

import { defineEventHandler, createError } from 'h3'
import { db, users, userProfiles, checkinStats } from '../../db'
import { getUserFromEvent } from '../../utils/jwt'
import { eq } from 'drizzle-orm'

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

    const proUntil = (user as any).proUntil as string | null | undefined
    const isProFlag = Boolean((user as any).isPro)
    let isPro = isProFlag
    if (isProFlag && proUntil) {
      const d = new Date(proUntil)
      if (!Number.isNaN(d.getTime())) {
        isPro = d.getTime() > Date.now()
      }
    }
    if (user.phone === 'admin') isPro = true

    // 获取用户资料
    const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, auth.userId)).get()

    // 获取打卡统计
    const stats = await db.select().from(checkinStats).where(eq(checkinStats.userId, auth.userId)).get()

    return {
      success: true,
      data: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        isPro,
        proUntil: proUntil || null,
        createdAt: user.createdAt,
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
          waterIntake: (profile as any).waterIntake || null,
          workType: (profile as any).workType || null,
          lateNight: Boolean((profile as any).lateNight),
          regularMeals: Boolean((profile as any).regularMeals),
          healthConcerns: safeJson<string[]>((profile as any).healthConcerns, []),
          smokeDrink: safeJson(profile.smokeDrink, null),
          occupation: profile.occupation,
          notificationSettings: safeJson(profile.notificationSettings, null),
          settings: safeJson((profile as any).settings, null),
          privacySettings: safeJson((profile as any).privacySettings, null),
          connectedDevices: safeJson((profile as any).connectedDevices, [])
        } : null,
        stats: stats ? {
          totalDays: stats.totalDays,
          currentStreak: stats.currentStreak,
          maxStreak: stats.maxStreak,
          lifeSeconds: stats.lifeSeconds,
          todayAnswered: stats.todayAnswered
        } : null
      }
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Get user error:', error)
    throw createError({
      statusCode: 500,
      message: '获取用户信息失败'
    })
  }
})
