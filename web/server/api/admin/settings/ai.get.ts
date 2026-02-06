/**
 * 获取 AI 提供商配置
 * GET /api/admin/settings/ai
 */
import { defineEventHandler, createError } from 'h3'
import { db, aiProviders, initDatabase } from '../../../db'
import { requireAdmin } from '../../../utils/admin'
import { asc } from 'drizzle-orm'

const maskKey = (key: string) => {
  if (!key) return ''
  if (key.length <= 6) return '*'.repeat(key.length)
  return `${'*'.repeat(Math.max(0, key.length - 4))}${key.slice(-4)}`
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  try {
    initDatabase()

    const rows = await db.select()
      .from(aiProviders)
      .orderBy(asc(aiProviders.name))
      .all()

    return {
      success: true,
      data: {
        providers: rows.map(row => ({
          id: row.id,
          name: row.name,
          displayName: row.displayName,
          baseUrl: row.baseUrl,
          model: row.model,
          enabled: !!row.enabled,
          timeoutMs: row.timeoutMs || 15000,
          apiKeyMasked: row.apiKey ? maskKey(row.apiKey) : '',
          hasApiKey: !!row.apiKey,
          updatedAt: row.updatedAt
        }))
      }
    }
  } catch (error: any) {
    console.error('Get AI settings error:', error)
    throw createError({
      statusCode: 500,
      message: '获取AI配置失败'
    })
  }
})
