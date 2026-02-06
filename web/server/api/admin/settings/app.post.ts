import { defineEventHandler, readBody, createError } from 'h3'
import { db, appSettings } from '../../../db'
import { requireAdmin } from '../../../utils/admin'
import { writeAdminAudit } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const settings = body?.settings
  if (!Array.isArray(settings)) {
    throw createError({ statusCode: 400, message: '参数格式错误' })
  }

  const now = new Date().toISOString()
  try {
    for (const s of settings) {
      const key = String(s?.key || '').trim()
      if (!key) continue
      const valueType = String(s?.valueType || 'STRING').toUpperCase()
      const allowed = ['STRING', 'NUMBER', 'BOOLEAN', 'JSON']
      const vt = allowed.includes(valueType) ? valueType : 'STRING'
      const value = s?.value === undefined ? null : String(s.value)
      const description = s?.description === undefined ? null : String(s.description)

      await db
        .insert(appSettings)
        .values({
          key,
          value,
          valueType: vt,
          description,
          updatedAt: now
        })
        .onConflictDoUpdate({
          target: appSettings.key,
          set: {
            value,
            valueType: vt,
            description,
            updatedAt: now
          }
        })
    }

    await writeAdminAudit(event, {
      action: 'APP_SETTINGS_UPDATE',
      entityType: 'app_settings'
    })

    return { success: true, message: '系统设置已保存' }
  } catch (error: any) {
    console.error('Update app settings error:', error)
    throw createError({ statusCode: 500, message: '保存系统设置失败' })
  }
})

