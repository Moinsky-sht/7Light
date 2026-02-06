import { defineEventHandler, readBody, createError } from 'h3'
import { db, users } from '../../../db'
import { requireAdmin } from '../../../utils/admin'
import { writeAdminAudit } from '../../../utils/audit'
import { eq, and, ne } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const userId = String(body?.userId || '').trim()
  if (!userId) throw createError({ statusCode: 400, message: '缺少 userId' })

  const existing = await db.select().from(users).where(eq(users.id, userId)).get()
  if (!existing) throw createError({ statusCode: 404, message: '用户不存在' })

  const phone = body?.phone === undefined ? undefined : String(body.phone || '').trim()
  const email = body?.email === undefined ? undefined : String(body.email || '').trim()
  const nickname = body?.nickname === undefined ? undefined : String(body.nickname || '').trim()

  if (phone !== undefined && phone && phone !== existing.phone) {
    const dup = await db.select({ id: users.id }).from(users).where(and(eq(users.phone, phone), ne(users.id, userId))).get()
    if (dup) throw createError({ statusCode: 400, message: '手机号已被占用' })
  }

  const now = new Date().toISOString()
  await db
    .update(users)
    .set({
      phone: phone === undefined ? existing.phone : (phone || null),
      email: email === undefined ? existing.email : (email || null),
      nickname: nickname === undefined ? existing.nickname : (nickname || null),
      updatedAt: now
    })
    .where(eq(users.id, userId))

  await writeAdminAudit(event, {
    action: 'USER_UPDATE',
    entityType: 'user',
    entityId: userId,
    detail: { phone: phone === undefined ? undefined : (phone || null), email: email === undefined ? undefined : (email || null), nickname: nickname === undefined ? undefined : (nickname || null) }
  })

  return { success: true, message: '用户信息已更新' }
})
