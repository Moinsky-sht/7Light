/**
 * 灯阵状态管理
 */
import { defineStore } from 'pinia'

interface SubItem {
  subItemId: number
  name: string
  state: 'ON' | 'OFF'
  brightness: number
  color: string
  lastValue: string | null
  updatedAt: string | null
}

interface Dimension {
  dimensionId: number
  dimensionKey: string
  name: string
  label: string
  category: string
  isLit: boolean
  litCount: number
  totalBrightness: number
  avgBrightness: number
  subItems: SubItem[]
  updatedAt: string | null
}

interface LampsSummary {
  totalLamps: number
  litLamps: number
  litPercentage: number
  totalBrightness: number
  avgBrightness: number
}

export const useLampsStore = defineStore('lamps', {
  state: () => ({
    summary: null as LampsSummary | null,
    grid: [] as Dimension[],
    updatedAt: null as string | null,
    lastViewed: {} as Record<number, number>, // 记录每个维度最后查看的时间戳
    isLoading: false
  }),

  getters: {
    litCount: (state) => state.summary?.litLamps || 0,
    totalCount: (state) => state.summary?.totalLamps || 49,
    litPercentage: (state) => state.summary?.litPercentage || 0,
    
    // 获取指定维度
    getDimension: (state) => (dimId: number) => {
      return state.grid.find(d => d.dimensionId === dimId)
    },
    
    // 检查维度是否有新更新
    hasNewUpdate: (state) => (dimId: number) => {
      const dim = state.grid.find(d => d.dimensionId === dimId)
      if (!dim || !dim.updatedAt) return false
      
      const updateTime = new Date(dim.updatedAt).getTime()
      const lastViewTime = state.lastViewed[dimId] || 0
      
      // 如果更新时间晚于最后查看时间，且在最近24小时内
      return updateTime > lastViewTime && (Date.now() - updateTime < 24 * 3600 * 1000)
    },
    
    // 获取指定灯
    getLamp: (state) => (dimId: number, subId: number) => {
      const dim = state.grid.find(d => d.dimensionId === dimId)
      return dim?.subItems.find(s => s.subItemId === subId)
    }
  },

  actions: {
    // 标记维度已读
    markAsViewed(dimId: number) {
      this.lastViewed[dimId] = Date.now()
    },

    // 获取灯阵状态
    async fetchStatus() {
      this.isLoading = true
      try {
        const result = await $fetch('/api/lamps/status') as any
        if (result?.success) {
          this.summary = result.data.summary
          this.grid = result.data.grid
          this.updatedAt = result.data.updatedAt
          return result.data
        }
        return null
      } catch (e) {
        console.error('获取灯阵状态失败:', e)
        return null
      } finally {
        this.isLoading = false
      }
    },

    // 更新单个灯状态（本地）
    updateLamp(dimId: number, subId: number, updates: Partial<SubItem>) {
      const dim = this.grid.find(d => d.dimensionId === dimId)
      if (dim) {
        const lamp = dim.subItems.find(s => s.subItemId === subId)
        if (lamp) {
          Object.assign(lamp, updates)
          // 重新计算维度统计
          dim.litCount = dim.subItems.filter(s => s.state === 'ON').length
          dim.isLit = dim.litCount > 0
          dim.totalBrightness = dim.subItems.reduce((sum, s) => sum + s.brightness, 0)
          dim.avgBrightness = dim.totalBrightness / 7
        }
      }
      // 重新计算总体统计
      if (this.summary) {
        this.summary.litLamps = this.grid.reduce((sum, d) => sum + d.litCount, 0)
        this.summary.litPercentage = Math.round((this.summary.litLamps / 49) * 100)
        this.summary.totalBrightness = this.grid.reduce((sum, d) => sum + d.totalBrightness, 0)
        this.summary.avgBrightness = this.summary.totalBrightness / 49
      }
    }
  }
})
