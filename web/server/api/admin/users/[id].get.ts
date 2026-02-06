import { defineEventHandler, createError } from 'h3'
import { db, users, userProfiles, checkinStats, checkinLogs } from '../../../db'
import { requireAdmin } from '../../../utils/admin'
import { eq, desc } from 'drizzle-orm'

const safeJson = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const userId = (event.context.params as any)?.id
  if (!userId) throw createError({ statusCode: 400, message: '缺少用户 ID' })

  const user = await db
    .select({
      id: users.id,
      phone: users.phone,
      email: users.email,
      role: users.role,
      status: users.status,
      isPro: users.isPro,
      proUntil: users.proUntil,
      disabledAt: users.disabledAt,
      nickname: users.nickname,
      avatarUrl: users.avatarUrl,
      lastLoginAt: users.lastLoginAt,
      lastLoginIp: users.lastLoginIp,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
    .from(users)
    .where(eq(users.id, userId))
    .get()

  if (!user) throw createError({ statusCode: 404, message: '用户不存在' })

  const profileRaw = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).get()
  const profile = profileRaw ? {
    ...profileRaw,
    goals: safeJson<string[]>(profileRaw.goals, []),
    chronicDiseases: safeJson<string[]>(profileRaw.chronicDiseases, []),
    allergies: safeJson<string[]>(profileRaw.allergies, []),
    smokeDrink: safeJson(profileRaw.smokeDrink, null),
    notificationSettings: safeJson(profileRaw.notificationSettings, null),
    healthConcerns: safeJson<string[]>((profileRaw as any).healthConcerns, []),
    settings: safeJson((profileRaw as any).settings, null),
    privacySettings: safeJson((profileRaw as any).privacySettings, null),
    connectedDevices: safeJson<any[]>((profileRaw as any).connectedDevices, [])
  } : null
  const stats = await db.select().from(checkinStats).where(eq(checkinStats.userId, userId)).get()
  const latestLogs = await db
    .select({
      id: checkinLogs.id,
      question: checkinLogs.question,
      answerText: checkinLogs.answerText,
      inputType: checkinLogs.inputType,
      dimensionId: checkinLogs.dimensionId,
      subItemId: checkinLogs.subItemId,
      metricName: checkinLogs.metricName,
      score: checkinLogs.score,
      isValid: checkinLogs.isValid,
      createdAt: checkinLogs.createdAt
    })
    .from(checkinLogs)
    .where(eq(checkinLogs.userId, userId))
    .orderBy(desc(checkinLogs.createdAt))
    .limit(10)
    .all()

  return {
    success: true,
    data: { user, profile, stats, latestLogs }
  }
})
