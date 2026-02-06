import { defineEventHandler, createError } from 'h3'
import { db, promptTemplates } from '../../../db'
import { requireAdmin } from '../../../utils/admin'
import { desc, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  try {
    const rows = await db
      .select({
        type: promptTemplates.type,
        count: sql<number>`count(*)`
      })
      .from(promptTemplates)
      .groupBy(promptTemplates.type)
      .orderBy(desc(sql`count(*)`))
      .all()

    return { success: true, data: { types: rows } }
  } catch (error: any) {
    console.error('Get prompt types error:', error)
    throw createError({ statusCode: 500, message: '获取提示词类型失败' })
  }
})

