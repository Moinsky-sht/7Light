import { defineEventHandler, createError } from 'h3'
import { db, dimensions, dimensionSubItems } from '../../db'
import { requireAdmin } from '../../utils/admin'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  try {
    const dims = await db
      .select({
        id: dimensions.id,
        key: dimensions.key,
        name: dimensions.name,
        label: dimensions.label,
        category: dimensions.category,
        sortOrder: dimensions.sortOrder,
        updatedAt: dimensions.updatedAt
      })
      .from(dimensions)
      .orderBy(asc(dimensions.id))
      .all()

    const subs = await db
      .select({
        id: dimensionSubItems.id,
        dimensionId: dimensionSubItems.dimensionId,
        subId: dimensionSubItems.subId,
        name: dimensionSubItems.name,
        sortOrder: dimensionSubItems.sortOrder,
        updatedAt: dimensionSubItems.updatedAt
      })
      .from(dimensionSubItems)
      .orderBy(asc(dimensionSubItems.dimensionId), asc(dimensionSubItems.subId))
      .all()

    const byDim = new Map<number, any[]>()
    for (const s of subs) {
      const list = byDim.get(s.dimensionId) || []
      list.push(s)
      byDim.set(s.dimensionId, list)
    }

    return {
      success: true,
      data: {
        dimensions: dims.map((d) => ({ ...d, subItems: byDim.get(d.id) || [] }))
      }
    }
  } catch (error: any) {
    console.error('Get dimensions error:', error)
    throw createError({ statusCode: 500, message: '获取维度数据失败' })
  }
})

