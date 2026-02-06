/**
 * 获取49盏灯状态 API
 * GET /api/lamps/status
 */

import { defineEventHandler, createError } from 'h3'
import { db, lampStatus } from '../../db'
import { getUserFromEvent } from '../../utils/jwt'
import { eq, asc } from 'drizzle-orm'

// 维度定义
const DIMENSIONS = [
  { id: 1, name: '天枢', label: '命火', category: '打卡', subs: ['第一天', '第二天', '第三天', '第四天', '第五天', '第六天', '第七天'] },
  { id: 2, name: '天璇', label: '谷神', category: '饮食', subs: ['碳水', '蔬果', '蛋白', '油盐', '饮水', '节律', '知止'] },
  { id: 3, name: '天玑', label: '动静', category: '运动', subs: ['步数', '心肺', '肌力', '破坐', '拉伸', '姿态', '户外'] },
  { id: 4, name: '天权', label: '归根', category: '睡眠', subs: ['入睡', '时长', '效率', '连续', '醒感', '仪式', '午憩'] },
  { id: 5, name: '玉衡', label: '调息', category: '心理', subs: ['稳定', '压力', '专注', '社交', '愉悦', '冥想', '截断'] },
  { id: 6, name: '开阳', label: '营卫', category: '体征', subs: ['排泄', '皮肤', '痛感', '体温', '视疲', '呼吸', '指标'] },
  { id: 7, name: '摇光', label: '固表', category: '环境', subs: ['光磁', '清气', '节气', '离屏', '噪音', '光合', '温湿'] }
]

// 维度ID映射
const DIMENSION_IDS = ['TIANSHU', 'TIANXUAN', 'TIANJI', 'TIANQUAN', 'YUHENG', 'KAIYANG', 'YAOGUANG']

export default defineEventHandler(async (event) => {
  const auth = getUserFromEvent(event)
  
  if (!auth) {
    throw createError({
      statusCode: 401,
      message: '未登录'
    })
  }

  try {
    // 获取所有灯状态
    const lamps = await db.select()
      .from(lampStatus)
      .where(eq(lampStatus.userId, auth.userId))
      .orderBy(asc(lampStatus.dimensionId), asc(lampStatus.subItemId))
      .all()

    // 按维度分组
    const dimensionMap = new Map<number, any[]>()
    for (const lamp of lamps) {
      if (!dimensionMap.has(lamp.dimensionId)) {
        dimensionMap.set(lamp.dimensionId, [])
      }
      dimensionMap.get(lamp.dimensionId)!.push({
        subItemId: lamp.subItemId,
        state: lamp.state,
        brightness: lamp.brightness,
        color: lamp.color,
        lastValue: lamp.lastValue,
        updatedAt: lamp.updatedAt
      })
    }

    // 构建返回数据
    const grid = DIMENSIONS.map((dim, idx) => {
      const subLamps = dimensionMap.get(dim.id) || []
      const litCount = subLamps.filter(l => l.state === 'ON').length
      const totalBrightness = subLamps.reduce((sum, l) => sum + (l.brightness || 0), 0)
      
      // 找出最近更新时间
      let lastUpdate = null
      if (subLamps.length > 0) {
        const sorted = [...subLamps].sort((a, b) => {
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
        })
        lastUpdate = sorted[0].updatedAt
      }
      
      return {
        dimensionId: dim.id,
        dimensionKey: DIMENSION_IDS[idx],
        name: dim.name,
        label: dim.label,
        category: dim.category,
        isLit: litCount > 0,
        litCount,
        totalBrightness,
        avgBrightness: subLamps.length > 0 ? Math.round(totalBrightness / subLamps.length * 10) / 10 : 0,
        updatedAt: lastUpdate,
        subItems: dim.subs.map((subName, subIdx) => {
          const subLamp = subLamps.find(l => l.subItemId === subIdx + 1)
          return {
            subItemId: subIdx + 1,
            name: subName,
            state: subLamp?.state || 'OFF',
            brightness: subLamp?.brightness || 0,
            color: subLamp?.color || 'GRAY',
            lastValue: subLamp?.lastValue || null,
            updatedAt: subLamp?.updatedAt || null
          }
        })
      }
    })

    // 统计总体数据
    const totalLit = lamps.filter(l => l.state === 'ON').length
    const totalBrightness = lamps.reduce((sum, l) => sum + (l.brightness || 0), 0)

    return {
      success: true,
      data: {
        updatedAt: new Date().toISOString(),
        summary: {
          totalLamps: 49,
          litLamps: totalLit,
          litPercentage: Math.round((totalLit / 49) * 100),
          totalBrightness,
          avgBrightness: Math.round(totalBrightness / 49 * 10) / 10
        },
        grid
      }
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Get lamps status error:', error)
    throw createError({
      statusCode: 500,
      message: '获取灯状态失败'
    })
  }
})
