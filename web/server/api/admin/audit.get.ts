import { defineEventHandler, getQuery, createError } from 'h3'
import { db, adminAuditLogs, users } from '../../db'
import { requireAdmin } from '../../utils/admin'
import { and, desc, eq, like, or, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const q = (query.q as string | undefined)?.trim()
  const actorUserId = (query.actorUserId as string | undefined)?.trim()
  const action = (query.action as string | undefined)?.trim()
  const entityType = (query.entityType as string | undefined)?.trim()
  const limit = Math.min(parseInt(query.limit as string) || 50, 200)
  const offset = Math.max(parseInt(query.offset as string) || 0, 0)

  try {
    const conditions = []
    if (q) {
      const keyword = `%${q}%`
      conditions.push(or(
        like(adminAuditLogs.action, keyword),
        like(adminAuditLogs.entityType, keyword),
        like(adminAuditLogs.entityId, keyword),
        like(adminAuditLogs.detail, keyword),
        like(users.phone, keyword),
        like(users.nickname, keyword)
      ))
    }
    if (actorUserId) conditions.push(eq(adminAuditLogs.actorUserId, actorUserId))
    if (action) conditions.push(eq(adminAuditLogs.action, action))
    if (entityType) conditions.push(eq(adminAuditLogs.entityType, entityType))

    const whereExpr = conditions.length ? and(...conditions) : undefined

    const totalRow = await db
      .select({ count: sql<number>`count(*)` })
      .from(adminAuditLogs)
      .$dynamic()
      .where(whereExpr ? whereExpr : sql`1=1`)
      .get()

    const rows = await db
      .select({
        id: adminAuditLogs.id,
        actorUserId: adminAuditLogs.actorUserId,
        action: adminAuditLogs.action,
        entityType: adminAuditLogs.entityType,
        entityId: adminAuditLogs.entityId,
        detail: adminAuditLogs.detail,
        ip: adminAuditLogs.ip,
        userAgent: adminAuditLogs.userAgent,
        createdAt: adminAuditLogs.createdAt,
        actorPhone: users.phone,
        actorNickname: users.nickname
      })
      .from(adminAuditLogs)
      .leftJoin(users, eq(adminAuditLogs.actorUserId, users.id))
      .$dynamic()
      .where(whereExpr ? whereExpr : sql`1=1`)
      .orderBy(desc(adminAuditLogs.createdAt))
      .limit(limit)
      .offset(offset)
      .all()

    return {
      success: true,
      data: { total: totalRow?.count || 0, logs: rows }
    }
  } catch (error: any) {
    console.error('Get audit logs error:', error)
    throw createError({ statusCode: 500, message: '获取审计日志失败' })
  }
})

