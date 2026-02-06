import { defineEventHandler, createError } from 'h3'
import { db, promptTemplates } from '../../../db'
import { requireAdmin } from '../../../utils/admin'
import { writeAdminAudit } from '../../../utils/audit'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = (event.context.params as any)?.id
  if (!id) throw createError({ statusCode: 400, message: '缺少 id' })

  const existing = await db.select({ id: promptTemplates.id }).from(promptTemplates).where(eq(promptTemplates.id, id)).get()
  if (!existing) throw createError({ statusCode: 404, message: '提示词不存在' })

  await db.delete(promptTemplates).where(eq(promptTemplates.id, id))

  await writeAdminAudit(event, {
    action: 'PROMPT_DELETE',
    entityType: 'prompt',
    entityId: id
  })

  return { success: true, message: '已删除' }
})

