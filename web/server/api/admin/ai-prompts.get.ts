import { defineEventHandler, createError } from 'h3'
import { db, promptBundles } from '../../db'
import { requireAdmin } from '../../utils/admin'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  try {
    const rows = await db
      .select({
        key: promptBundles.key,
        name: promptBundles.name,
        status: promptBundles.status,
        version: promptBundles.version,
        systemTemplate: promptBundles.systemTemplate,
        userTemplate: promptBundles.userTemplate,
        notes: promptBundles.notes,
        updatedAt: promptBundles.updatedAt
      })
      .from(promptBundles)
      .orderBy(asc(promptBundles.key))
      .all()

    return { success: true, data: { total: rows.length, bundles: rows } }
  } catch (error: any) {
    console.error('Get ai prompts error:', error)
    throw createError({ statusCode: 500, message: '获取 AI 提示词失败' })
  }
})

