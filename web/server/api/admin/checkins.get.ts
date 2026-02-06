import { defineEventHandler, getQuery, createError } from 'h3'
import { db, checkinLogs, users } from '../../db'
import { requireAdmin } from '../../utils/admin'
import { and, desc, eq, like, or, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const q = (query.q as string | undefined)?.trim()
  const userId = (query.userId as string | undefined)?.trim()
  const isValid = (query.isValid as string | undefined)?.trim()
  const dimensionId = (query.dimensionId as string | undefined)?.trim()
  const subItemId = (query.subItemId as string | undefined)?.trim()
  const inputType = (query.inputType as string | undefined)?.trim()
  const from = (query.from as string | undefined)?.trim()
  const to = (query.to as string | undefined)?.trim()
  const limit = Math.min(parseInt(query.limit as string) || 50, 200)
  const offset = Math.max(parseInt(query.offset as string) || 0, 0)

  try {
    const conditions = []
    if (q) {
      const keyword = `%${q}%`
      conditions.push(or(
        like(checkinLogs.question, keyword),
        like(checkinLogs.answerText, keyword),
        like(checkinLogs.metricName, keyword),
        like(users.phone, keyword),
        like(users.nickname, keyword)
      ))
    }
    if (userId) conditions.push(eq(checkinLogs.userId, userId))
    if (isValid === 'true') conditions.push(eq(checkinLogs.isValid, true))
    if (isValid === 'false') conditions.push(eq(checkinLogs.isValid, false))
    if (dimensionId) conditions.push(eq(checkinLogs.dimensionId, Number(dimensionId)))
    if (subItemId) conditions.push(eq(checkinLogs.subItemId, Number(subItemId)))
    if (inputType) conditions.push(eq(checkinLogs.inputType, inputType))
    if (from) conditions.push(sql`${checkinLogs.createdAt} >= ${from}`)
    if (to) conditions.push(sql`${checkinLogs.createdAt} <= ${to}`)

    const whereExpr = conditions.length ? and(...conditions) : undefined

    const totalRow = await db
      .select({ count: sql<number>`count(*)` })
      .from(checkinLogs)
      .$dynamic()
      .where(whereExpr ? whereExpr : sql`1=1`)
      .get()

    const rows = await db
      .select({
        id: checkinLogs.id,
        userId: checkinLogs.userId,
        question: checkinLogs.question,
        answerText: checkinLogs.answerText,
        inputType: checkinLogs.inputType,
        metricName: checkinLogs.metricName,
        score: checkinLogs.score,
        isValid: checkinLogs.isValid,
        dimensionId: checkinLogs.dimensionId,
        subItemId: checkinLogs.subItemId,
        createdAt: checkinLogs.createdAt,
        userPhone: users.phone,
        userNickname: users.nickname
      })
      .from(checkinLogs)
      .leftJoin(users, eq(checkinLogs.userId, users.id))
      .$dynamic()
      .where(whereExpr ? whereExpr : sql`1=1`)
      .orderBy(desc(checkinLogs.createdAt))
      .limit(limit)
      .offset(offset)
      .all()

    return { success: true, data: { total: totalRow?.count || 0, logs: rows } }
  } catch (error: any) {
    console.error('Get checkin logs error:', error)
    throw createError({ statusCode: 500, message: '获取打卡记录失败' })
  }
})
