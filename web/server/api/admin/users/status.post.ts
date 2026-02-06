import { defineEventHandler, readBody, createError } from 'h3'
import { db, users } from '../../../db'
import { requireAdmin } from '../../../utils/admin'
import { writeAdminAudit } from '../../../utils/audit'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const auth = await requireAdmin(event)

  const body = await readBody(event)
  const { userId, status } = body || {}

  if (!userId || !status) {
    throw createError({ statusCode: 400, message: '缺少必要参数' })
  }
  if (!['ACTIVE', 'DISABLED'].includes(status)) {
    throw createError({ statusCode: 400, message: '无效状态' })
  }
  if (auth.userId === userId && status !== 'ACTIVE') {
    throw createError({ statusCode: 400, message: '不能禁用自己的账号' })
  }

  const existing = await db.select({ id: users.id, status: users.status }).from(users).where(eq(users.id, userId)).get()
  if (!existing) {
    throw createError({ statusCode: 404, message: '用户不存在' })
  }

  const now = new Date().toISOString()
  await db
    .update(users)
    .set({
      status,
      disabledAt: status === 'DISABLED' ? now : null,
      updatedAt: now
    })
    .where(eq(users.id, userId))

  await writeAdminAudit(event, {
    action: 'USER_STATUS_UPDATE',
    entityType: 'user',
    entityId: userId,
    detail: { status }
  })

  return { success: true, message: '用户状态已更新' }
})

