import { defineEventHandler, readBody, createError } from 'h3'
import { db, dimensions, dimensionSubItems } from '../../db'
import { requireAdmin } from '../../utils/admin'
import { writeAdminAudit } from '../../utils/audit'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const list = body?.dimensions
  if (!Array.isArray(list)) throw createError({ statusCode: 400, message: '参数格式错误' })

  const now = new Date().toISOString()
  try {
    for (const d of list) {
      const id = Number(d?.id)
      if (!id || id < 1 || id > 7) continue
      const key = String(d?.key || '').trim()
      const name = String(d?.name || '').trim()
      const label = String(d?.label || '').trim()
      const category = String(d?.category || '').trim()
      if (!key || !name || !label || !category) continue

      await db
        .update(dimensions)
        .set({
          key,
          name,
          label,
          category,
          sortOrder: typeof d?.sortOrder === 'number' ? d.sortOrder : id,
          updatedAt: now
        })
        .where(eq(dimensions.id, id))

      const subs = Array.isArray(d?.subItems) ? d.subItems : []
      for (const s of subs) {
        const subId = Number(s?.subId)
        if (!subId || subId < 1 || subId > 7) continue
        const subName = String(s?.name || '').trim()
        if (!subName) continue
        const subRowId = `${id}:${subId}`
        await db
          .insert(dimensionSubItems)
          .values({
            id: subRowId,
            dimensionId: id,
            subId,
            name: subName,
            sortOrder: typeof s?.sortOrder === 'number' ? s.sortOrder : subId,
            updatedAt: now
          })
          .onConflictDoUpdate({
            target: dimensionSubItems.id,
            set: { name: subName, sortOrder: typeof s?.sortOrder === 'number' ? s.sortOrder : subId, updatedAt: now }
          })
      }
    }

    await writeAdminAudit(event, {
      action: 'DIMENSIONS_UPDATE',
      entityType: 'dimensions',
      detail: { updatedAt: now }
    })

    return { success: true, message: '已保存' }
  } catch (error: any) {
    console.error('Save dimensions error:', error)
    throw createError({ statusCode: 500, message: '保存维度数据失败' })
  }
})

