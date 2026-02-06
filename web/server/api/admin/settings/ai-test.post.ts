/**
 * 测试 AI 提供商连接
 * POST /api/admin/settings/ai-test
 */
import { defineEventHandler, readBody, createError } from 'h3'
import { requireAdmin } from '../../../utils/admin'
import { testAIProvider } from '../../../services/ai'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const { provider } = body || {}

  try {
    const result = await testAIProvider(provider)
    return {
      success: true,
      data: result
    }
  } catch (error: any) {
    console.error('Test AI provider error:', error)
    throw createError({
      statusCode: 500,
      message: '测试AI连接失败'
    })
  }
})
