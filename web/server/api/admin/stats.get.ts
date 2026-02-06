/**
 * 管理后台统计
 * GET /api/admin/stats
 */
import { defineEventHandler, createError } from 'h3'
import { db, users, promptTemplates, aiProviders } from '../../db'
import { requireAdmin } from '../../utils/admin'
import { sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  try {
    const usersCount = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .get()

    const promptsCount = await db.select({ count: sql<number>`count(*)` })
      .from(promptTemplates)
      .get()

    const providersCount = await db.select({
      total: sql<number>`count(*)`,
      enabled: sql<number>`sum(case when enabled = 1 then 1 else 0 end)`
    })
      .from(aiProviders)
      .get()

    return {
      success: true,
      data: {
        users: usersCount?.count || 0,
        prompts: promptsCount?.count || 0,
        providers: providersCount?.total || 0,
        providersEnabled: providersCount?.enabled || 0
      }
    }
  } catch (error: any) {
    console.error('Get admin stats error:', error)
    throw createError({
      statusCode: 500,
      message: '获取后台统计失败'
    })
  }
})
