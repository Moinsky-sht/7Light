/**
 * 获取提示词列表 API
 * GET /api/admin/prompts
 */

import { defineEventHandler, createError, getQuery } from 'h3'
import { db, promptTemplates } from '../../../db'
import { requireAdmin } from '../../../utils/admin'
import { eq, and, desc } from 'drizzle-orm'

const safeJson = (value: string | null | undefined) => {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const { type, dimensionId, subItemId, status } = query

  try {
    let conditions = []
    
    if (type) {
      conditions.push(eq(promptTemplates.type, type as string))
    }
    if (dimensionId) {
      conditions.push(eq(promptTemplates.dimensionId, Number(dimensionId)))
    }
    if (subItemId) {
      conditions.push(eq(promptTemplates.subItemId, Number(subItemId)))
    }
    if (status) {
      conditions.push(eq(promptTemplates.status, status as string))
    }

    let prompts
    if (conditions.length > 0) {
      prompts = await db.select()
        .from(promptTemplates)
        .where(and(...conditions))
        .orderBy(desc(promptTemplates.updatedAt))
        .all()
    } else {
      prompts = await db.select()
        .from(promptTemplates)
        .orderBy(desc(promptTemplates.updatedAt))
        .all()
    }

    return {
      success: true,
      data: {
        total: prompts.length,
        prompts: prompts.map(p => ({
          id: p.id,
          type: p.type,
          dimensionId: p.dimensionId,
          subItemId: p.subItemId,
          version: p.version,
          status: p.status,
          template: p.template,
          jsonSchema: safeJson(p.jsonSchema),
          notes: p.notes,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
        }))
      }
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Get prompts error:', error)
    throw createError({
      statusCode: 500,
      message: '获取提示词列表失败'
    })
  }
})
