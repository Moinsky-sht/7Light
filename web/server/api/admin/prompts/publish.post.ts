import { defineEventHandler, readBody, createError } from 'h3'
import { db, promptTemplates } from '../../../db'
import { requireAdmin } from '../../../utils/admin'
import { writeAdminAudit } from '../../../utils/audit'
import { and, eq, ne } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const id = String(body?.id || '').trim()
  if (!id) throw createError({ statusCode: 400, message: '缺少 id' })

  const prompt = await db.select().from(promptTemplates).where(eq(promptTemplates.id, id)).get()
  if (!prompt) throw createError({ statusCode: 404, message: '提示词不存在' })

  const now = new Date().toISOString()

  await db
    .update(promptTemplates)
    .set({ status: 'ACTIVE', updatedAt: now })
    .where(eq(promptTemplates.id, id))

  await db
    .update(promptTemplates)
    .set({ status: 'DEPRECATED', updatedAt: now })
    .where(
      and(
        eq(promptTemplates.type, prompt.type),
        prompt.dimensionId === null ? eq(promptTemplates.dimensionId, null as any) : eq(promptTemplates.dimensionId, prompt.dimensionId as any),
        prompt.subItemId === null ? eq(promptTemplates.subItemId, null as any) : eq(promptTemplates.subItemId, prompt.subItemId as any),
        ne(promptTemplates.id, id)
      )
    )

  await writeAdminAudit(event, {
    action: 'PROMPT_PUBLISH',
    entityType: 'prompt',
    entityId: id,
    detail: { type: prompt.type, dimensionId: prompt.dimensionId, subItemId: prompt.subItemId, version: prompt.version }
  })

  return { success: true, message: '已发布为 ACTIVE' }
})

