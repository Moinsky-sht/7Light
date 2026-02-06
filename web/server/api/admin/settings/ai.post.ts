/**
 * 更新 AI 提供商配置
 * POST /api/admin/settings/ai
 */
import { defineEventHandler, readBody, createError } from 'h3'
import { db, aiProviders, initDatabase } from '../../../db'
import { requireAdmin } from '../../../utils/admin'
import { writeAdminAudit } from '../../../utils/audit'
import { clearProviderCache } from '../../../services/ai'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const { providers } = body || {}

  if (!Array.isArray(providers)) {
    throw createError({
      statusCode: 400,
      message: '参数不正确'
    })
  }

  try {
    initDatabase()
    const now = new Date().toISOString()
    const changed: Array<{ id: string; enabled: boolean; baseUrl: string; model: string; timeoutMs: number; apiKeyChanged: boolean }> = []

    for (const item of providers) {
      if (!item?.id) continue
      const existing = await db.select().from(aiProviders).where(eq(aiProviders.id, item.id)).get()
      if (!existing) {
        throw createError({
          statusCode: 404,
          message: `未知的提供商: ${item.id}`
        })
      }

      const timeoutMs = typeof item.timeoutMs === 'number' && item.timeoutMs > 1000
        ? Math.min(item.timeoutMs, 60000)
        : existing.timeoutMs || 15000

      const nextApiKey = typeof item.apiKey === 'string'
        ? (item.apiKey.trim() ? item.apiKey.trim() : null)
        : existing.apiKey

      const baseUrl = (item.baseUrl || existing.baseUrl || '').trim()
      if (!baseUrl) {
        throw createError({
          statusCode: 400,
          message: 'Base URL 不能为空'
        })
      }

      await db.update(aiProviders)
        .set({
          baseUrl,
          model: (item.model ?? existing.model) || '',
          apiKey: nextApiKey,
          enabled: Boolean(item.enabled),
          timeoutMs,
          updatedAt: now
        })
        .where(eq(aiProviders.id, item.id))

      changed.push({
        id: item.id,
        enabled: Boolean(item.enabled),
        baseUrl,
        model: (item.model ?? existing.model) || '',
        timeoutMs,
        apiKeyChanged: typeof item.apiKey === 'string'
      })
    }

    clearProviderCache()

    await writeAdminAudit(event, {
      action: 'AI_PROVIDERS_UPDATE',
      entityType: 'ai_providers',
      detail: changed
    })

    return {
      success: true,
      message: 'AI配置已更新'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Update AI settings error:', error)
    throw createError({
      statusCode: 500,
      message: '更新AI配置失败'
    })
  }
})
