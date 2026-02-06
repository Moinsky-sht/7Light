import { defineEventHandler, readBody, createError } from 'h3'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { db, users } from '../../../db'
import { requireAdmin } from '../../../utils/admin'
import { writeAdminAudit } from '../../../utils/audit'
import { eq } from 'drizzle-orm'

function genPassword() {
  return crypto.randomBytes(9).toString('base64url')
}

export default defineEventHandler(async (event) => {
  const auth = await requireAdmin(event)

  const body = await readBody(event)
  const { userId, password } = body || {}
  if (!userId) throw createError({ statusCode: 400, message: '缺少 userId' })
  if (auth.userId === userId) throw createError({ statusCode: 400, message: '不能重置自己的密码' })

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).get()
  if (!existing) throw createError({ statusCode: 404, message: '用户不存在' })

  const nextPassword = typeof password === 'string' && password.trim() ? password.trim() : genPassword()
  const passwordHash = bcrypt.hashSync(nextPassword, 10)
  const now = new Date().toISOString()

  await db
    .update(users)
    .set({
      passwordHash,
      failedLoginCount: 0 as any,
      lockedUntil: null as any,
      updatedAt: now
    } as any)
    .where(eq(users.id, userId))

  await writeAdminAudit(event, {
    action: 'USER_PASSWORD_RESET',
    entityType: 'user',
    entityId: userId
  })

  return {
    success: true,
    message: '密码已重置',
    data: { password: nextPassword }
  }
})

