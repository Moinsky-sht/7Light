import { defineEventHandler, createError } from 'h3'
import { db, users, userProfiles, checkinStats, lampStatus, checkinLogs, promptRuns, healthReports, socialConnections, socialInteractions } from '../../../../db'
import { requireAdmin } from '../../../../utils/admin'
import { eq, or, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const userId = (event.context.params as any)?.id
  if (!userId) throw createError({ statusCode: 400, message: '缺少用户 ID' })

  const user = await db.select().from(users).where(eq(users.id, userId)).get()
  if (!user) throw createError({ statusCode: 404, message: '用户不存在' })

  const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).get()
  const stats = await db.select().from(checkinStats).where(eq(checkinStats.userId, userId)).get()
  const lamps = await db.select().from(lampStatus).where(eq(lampStatus.userId, userId)).all()
  const checkins = await db.select().from(checkinLogs).where(eq(checkinLogs.userId, userId)).orderBy(desc(checkinLogs.createdAt)).limit(1000).all()
  const runs = await db.select().from(promptRuns).where(eq(promptRuns.userId, userId)).orderBy(desc(promptRuns.createdAt)).limit(500).all()
  const reports = await db.select().from(healthReports).where(eq(healthReports.userId, userId)).orderBy(desc(healthReports.createdAt)).all()
  const connections = await db.select().from(socialConnections).where(or(eq(socialConnections.userId, userId), eq(socialConnections.friendId, userId))).all()
  const interactions = await db.select().from(socialInteractions).where(or(eq(socialInteractions.fromUserId, userId), eq(socialInteractions.toUserId, userId))).orderBy(desc(socialInteractions.createdAt)).limit(1000).all()

  return {
    success: true,
    data: {
      exportedAt: new Date().toISOString(),
      user,
      profile,
      stats,
      lampStatus: lamps,
      checkinLogs: checkins,
      promptRuns: runs,
      healthReports: reports,
      socialConnections: connections,
      socialInteractions: interactions
    }
  }
})
