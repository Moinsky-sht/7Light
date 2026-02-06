import { defineEventHandler, readBody, createError } from 'h3'
import { db, promptBundles } from '../../db'
import { requireAdmin } from '../../utils/admin'
import { writeAdminAudit } from '../../utils/audit'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const key = String(body?.key || '').trim().toUpperCase()
  const name = String(body?.name || '').trim()
  const status = body?.status ? String(body.status).trim().toUpperCase() : 'ACTIVE'
  const version = body?.version ? String(body.version).trim() : 'v1.0.0'
  const systemTemplate = body?.systemTemplate === undefined ? null : String(body.systemTemplate)
  const userTemplate = body?.userTemplate === undefined ? null : String(body.userTemplate)
  const notes = body?.notes === undefined ? null : String(body.notes)

  if (!key || !/^[A-Z0-9_]{2,64}$/.test(key)) throw createError({ statusCode: 400, message: 'key 不合法' })
  if (!name) throw createError({ statusCode: 400, message: '名称不能为空' })
  if (!['DRAFT', 'ACTIVE'].includes(status)) throw createError({ statusCode: 400, message: '状态不合法' })

  const now = new Date().toISOString()
  try {
    await db
      .insert(promptBundles)
      .values({
        key,
        name,
        status,
        version,
        systemTemplate,
        userTemplate,
        notes,
        updatedAt: now
      })
      .onConflictDoUpdate({
        target: promptBundles.key,
        set: { name, status, version, systemTemplate, userTemplate, notes, updatedAt: now }
      })

    await writeAdminAudit(event, {
      action: 'AI_PROMPT_UPDATE',
      entityType: 'prompt_bundle',
      entityId: key,
      detail: { name, status, version }
    })

    return { success: true, message: '已保存' }
  } catch (error: any) {
    console.error('Save ai prompts error:', error)
    throw createError({ statusCode: 500, message: '保存 AI 提示词失败' })
  }
})

