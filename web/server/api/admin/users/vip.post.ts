import { defineEventHandler, readBody, createError } from 'h3'
import { db, users } from '../../../db'
import { requireAdmin } from '../../../utils/admin'
import { writeAdminAudit } from '../../../utils/audit'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const auth = await requireAdmin(event)

  const body = await readBody(event)
  const userId = String(body?.userId || '').trim()
  const isPro = body?.isPro
  const proUntil = body?.proUntil

  if (!userId || typeof isPro !== 'boolean') {
    throw createError({ statusCode: 400, message: '参数不正确' })
  }
  if (auth.userId === userId && !isPro) {
    throw createError({ statusCode: 400, message: '不能取消自己的 VIP' })
  }

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).get()
  if (!existing) throw createError({ statusCode: 404, message: '用户不存在' })

  let nextProUntil: string | null = null
  if (typeof proUntil === 'string' && proUntil.trim()) {
    const d = new Date(proUntil.trim())
    if (!Number.isNaN(d.getTime())) nextProUntil = d.toISOString()
  }

  const now = new Date().toISOString()
  await db
    .update(users)
    .set({
      isPro,
      proUntil: isPro ? nextProUntil : null,
      updatedAt: now
    })
    .where(eq(users.id, userId))

  await writeAdminAudit(event, {
    action: 'USER_VIP_UPDATE',
    entityType: 'user',
    entityId: userId,
    detail: { isPro, proUntil: isPro ? nextProUntil : null }
  })

  return { success: true, message: 'VIP 已更新' }
})

