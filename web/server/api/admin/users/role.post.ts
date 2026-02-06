/**
 * 更新用户角色（管理员）
 * POST /api/admin/users/role
 */
import { defineEventHandler, readBody, createError } from 'h3'
import { db, users } from '../../../db'
import { requireAdmin } from '../../../utils/admin'
import { writeAdminAudit } from '../../../utils/audit'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const auth = await requireAdmin(event)

  const body = await readBody(event)
  const { userId, role } = body || {}

  if (!userId || !role) {
    throw createError({
      statusCode: 400,
      message: '缺少必要参数'
    })
  }

  const allowedRoles = ['user', 'admin']
  if (!allowedRoles.includes(role)) {
    throw createError({
      statusCode: 400,
      message: '无效角色'
    })
  }

  try {
    if (auth.userId === userId && role !== 'admin') {
      throw createError({
        statusCode: 400,
        message: '不能移除自己的管理员权限'
      })
    }

    const existing = await db.select().from(users).where(eq(users.id, userId)).get()
    if (!existing) {
      throw createError({
        statusCode: 404,
        message: '用户不存在'
      })
    }

    await db.update(users)
      .set({ role, updatedAt: new Date().toISOString() })
      .where(eq(users.id, userId))

    await writeAdminAudit(event, {
      action: 'USER_ROLE_UPDATE',
      entityType: 'user',
      entityId: userId,
      detail: { role }
    })

    return {
      success: true,
      message: '用户角色已更新'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Update user role error:', error)
    throw createError({
      statusCode: 500,
      message: '更新用户角色失败'
    })
  }
})
