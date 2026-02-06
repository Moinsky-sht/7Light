import { defineEventHandler, createError } from 'h3'
import { db, appSettings } from '../../../db'
import { requireAdmin } from '../../../utils/admin'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  try {
    const rows = await db
      .select({
        key: appSettings.key,
        value: appSettings.value,
        valueType: appSettings.valueType,
        description: appSettings.description,
        updatedAt: appSettings.updatedAt
      })
      .from(appSettings)
      .orderBy(asc(appSettings.key))
      .all()

    return { success: true, data: { settings: rows } }
  } catch (error: any) {
    console.error('Get app settings error:', error)
    throw createError({ statusCode: 500, message: '获取系统设置失败' })
  }
})

