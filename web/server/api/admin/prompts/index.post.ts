/**
 * 创建/更新提示词 API
 * POST /api/admin/prompts
 */

import { defineEventHandler, readBody, createError } from 'h3'
import { v4 as uuidv4 } from 'uuid'
import { db, promptTemplates } from '../../../db'
import { requireAdmin } from '../../../utils/admin'
import { writeAdminAudit } from '../../../utils/audit'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const { id, type, dimensionId, subItemId, version, status, template, jsonSchema, notes } = body

  // 参数校验
  if (!type || !template) {
    throw createError({
      statusCode: 400,
      message: '类型和模板内容不能为空'
    })
  }

  const normalizedType = String(type).trim().toUpperCase()
  if (!/^[A-Z0-9_]{2,64}$/.test(normalizedType)) {
    throw createError({ statusCode: 400, message: '无效的提示词类型' })
  }
  const normalizedStatus = status ? String(status).trim().toUpperCase() : undefined

  try {
    const now = new Date().toISOString()

    if (id) {
      // 更新现有提示词
      const existing = await db.select().from(promptTemplates).where(eq(promptTemplates.id, id)).get()
      if (!existing) {
        throw createError({
          statusCode: 404,
          message: '提示词不存在'
        })
      }

      await db.update(promptTemplates)
        .set({
          type: normalizedType,
          dimensionId: dimensionId ?? null,
          subItemId: subItemId ?? null,
          version: version || existing.version,
          status: normalizedStatus || existing.status,
          template,
          jsonSchema: jsonSchema ? JSON.stringify(jsonSchema) : null,
          notes: notes || null,
          updatedAt: now
        })
        .where(eq(promptTemplates.id, id))

      await writeAdminAudit(event, {
        action: 'PROMPT_UPDATE',
        entityType: 'prompt',
        entityId: id,
        detail: { type: normalizedType, dimensionId: dimensionId ?? null, subItemId: subItemId ?? null, version: version || existing.version, status: normalizedStatus || existing.status }
      })

      return {
        success: true,
        message: '提示词已更新',
        data: { id }
      }

    } else {
      // 创建新提示词
      const newId = uuidv4()
      await db.insert(promptTemplates).values({
        id: newId,
        type: normalizedType,
        dimensionId: dimensionId ?? null,
        subItemId: subItemId ?? null,
        version: version || 'v1.0.0',
        status: normalizedStatus || 'DRAFT',
        template,
        jsonSchema: jsonSchema ? JSON.stringify(jsonSchema) : null,
        notes: notes || null,
        createdAt: now,
        updatedAt: now
      })

      await writeAdminAudit(event, {
        action: 'PROMPT_CREATE',
        entityType: 'prompt',
        entityId: newId,
        detail: { type: normalizedType, dimensionId: dimensionId ?? null, subItemId: subItemId ?? null, version: version || 'v1.0.0', status: normalizedStatus || 'DRAFT' }
      })

      return {
        success: true,
        message: '提示词已创建',
        data: { id: newId }
      }
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Save prompt error:', error)
    throw createError({
      statusCode: 500,
      message: '保存提示词失败'
    })
  }
})
