/**
 * 用户列表（管理员）
 * GET /api/admin/users
 */
import { defineEventHandler, createError, getQuery } from 'h3'
import { db, users } from '../../db'
import { requireAdmin } from '../../utils/admin'
import { and, asc, like, or, sql, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const q = (query.q as string | undefined)?.trim()
  const role = (query.role as string | undefined)?.trim()
  const status = (query.status as string | undefined)?.trim()
  const isPro = (query.isPro as string | undefined)?.trim()
  const limit = Math.min(parseInt(query.limit as string) || 50, 200)
  const offset = Math.max(parseInt(query.offset as string) || 0, 0)

  try {
    const conditions = []
    if (q) {
      const keyword = `%${q}%`
      conditions.push(or(
        like(users.phone, keyword),
        like(users.nickname, keyword),
        like(users.email, keyword)
      ))
    }
    if (role) {
      conditions.push(eq(users.role, role))
    }
    if (status) {
      conditions.push(eq(users.status, status))
    }
    if (isPro === 'true') {
      conditions.push(eq(users.isPro, true))
    }
    if (isPro === 'false') {
      conditions.push(eq(users.isPro, false))
    }

    let queryBuilder = db.select({
      id: users.id,
      phone: users.phone,
      email: users.email,
      role: users.role,
      status: users.status,
      isPro: users.isPro,
      proUntil: users.proUntil,
      lastLoginAt: users.lastLoginAt,
      nickname: users.nickname,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
      .from(users)
      .$dynamic()

    const whereExpr = conditions.length ? and(...conditions) : undefined
    if (whereExpr) queryBuilder = queryBuilder.where(whereExpr)

    const totalRow = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .$dynamic()
      .where(whereExpr ? whereExpr : sql`1=1`)
      .get()

    const rows = await queryBuilder
      .orderBy(asc(users.createdAt))
      .limit(limit)
      .offset(offset)
      .all()

    return {
      success: true,
      data: {
        total: totalRow?.count || 0,
        users: rows
      }
    }
  } catch (error: any) {
    console.error('Get users error:', error)
    throw createError({
      statusCode: 500,
      message: '获取用户列表失败'
    })
  }
})
