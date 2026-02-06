import { defineEventHandler, getQuery, createError } from 'h3'
import { db, promptRuns, promptTemplates, promptBundles, users } from '../../db'
import { requireAdmin } from '../../utils/admin'
import { and, desc, eq, like, or, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const q = (query.q as string | undefined)?.trim()
  const userId = (query.userId as string | undefined)?.trim()
  const templateId = (query.templateId as string | undefined)?.trim()
  const bundleKey = (query.bundleKey as string | undefined)?.trim()
  const limit = Math.min(parseInt(query.limit as string) || 50, 200)
  const offset = Math.max(parseInt(query.offset as string) || 0, 0)

  try {
    const conditions = []
    if (q) {
      const keyword = `%${q}%`
      conditions.push(or(
        like(promptRuns.requestId, keyword),
        like(promptRuns.inputSnapshot, keyword),
        like(promptRuns.rawModelOutput, keyword),
        like(promptRuns.parsedOutput, keyword),
        like(promptTemplates.type, keyword),
        like(promptBundles.name, keyword),
        like(promptBundles.key, keyword),
        like(users.phone, keyword),
        like(users.nickname, keyword)
      ))
    }
    if (userId) conditions.push(eq(promptRuns.userId, userId))
    if (templateId) conditions.push(eq(promptRuns.templateId, templateId))
    if (bundleKey) conditions.push(eq(promptRuns.bundleKey, bundleKey))

    const whereExpr = conditions.length ? and(...conditions) : undefined

    const totalRow = await db
      .select({ count: sql<number>`count(*)` })
      .from(promptRuns)
      .$dynamic()
      .where(whereExpr ? whereExpr : sql`1=1`)
      .get()

    const rows = await db
      .select({
        id: promptRuns.id,
        templateId: promptRuns.templateId,
        bundleKey: promptRuns.bundleKey,
        userId: promptRuns.userId,
        requestId: promptRuns.requestId,
        isValid: promptRuns.isValid,
        latencyMs: promptRuns.latencyMs,
        createdAt: promptRuns.createdAt,
        type: promptTemplates.type,
        bundleName: promptBundles.name,
        userPhone: users.phone,
        userNickname: users.nickname
      })
      .from(promptRuns)
      .leftJoin(promptTemplates, eq(promptRuns.templateId, promptTemplates.id))
      .leftJoin(promptBundles, eq(promptRuns.bundleKey, promptBundles.key))
      .leftJoin(users, eq(promptRuns.userId, users.id))
      .$dynamic()
      .where(whereExpr ? whereExpr : sql`1=1`)
      .orderBy(desc(promptRuns.createdAt))
      .limit(limit)
      .offset(offset)
      .all()

    return { success: true, data: { total: totalRow?.count || 0, runs: rows } }
  } catch (error: any) {
    console.error('Get prompt runs error:', error)
    throw createError({ statusCode: 500, message: '获取提示词运行记录失败' })
  }
})
