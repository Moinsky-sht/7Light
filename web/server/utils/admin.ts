/**
 * 管理员权限校验
 */
import { createError, type H3Event } from 'h3'
import { db, users } from '../db'
import { getUserFromEvent } from './jwt'
import { eq } from 'drizzle-orm'

export async function requireAdmin(event: H3Event) {
  const auth = getUserFromEvent(event)
  if (!auth) {
    throw createError({
      statusCode: 401,
      message: '未登录'
    })
  }

  const user = await db
    .select({ role: users.role, status: users.status })
    .from(users)
    .where(eq(users.id, auth.userId))
    .get()

  if (!user || user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: '需要管理员权限'
    })
  }

  if (user.status && user.status !== 'ACTIVE') {
    throw createError({
      statusCode: 403,
      message: '账号已被禁用'
    })
  }

  return auth
}
