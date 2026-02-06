import { defineStore } from 'pinia'

// 灯更新信息接口
interface LampUpdate {
  dimensionId: number
  subItemId: number
  metricName: string
  timestamp: number
  question?: string
  answer?: string
}

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    // 各个Tab的新消息提示
    hasNewLamps: false,      // 灯阵有新消息
    hasNewSocial: false,     // 灯友有新消息
    hasNewProfile: false,    // 我的有新消息
    
    // 具体的灯更新列表
    lampUpdates: [] as LampUpdate[],
  }),
  
  getters: {
    // 获取最新的灯更新
    latestLampUpdates: (state) => state.lampUpdates.slice(-10),
    
    // 获取指定维度的更新
    getUpdatesByDimension: (state) => (dimId: number) => {
      return state.lampUpdates.filter(u => u.dimensionId === dimId)
    },
    
    // 检查指定灯是否有更新
    hasLampUpdate: (state) => (dimId: number, subId?: number) => {
      if (subId !== undefined) {
        return state.lampUpdates.some(u => u.dimensionId === dimId && u.subItemId === subId)
      }
      return state.lampUpdates.some(u => u.dimensionId === dimId)
    }
  },
  
  actions: {
    // 设置灯阵新消息提示
    setLampsNotification(value: boolean) {
      this.hasNewLamps = value
    },
    
    // 添加灯更新记录
    addLampUpdate(update: Omit<LampUpdate, 'timestamp'>) {
      this.lampUpdates.push({
        ...update,
        timestamp: Date.now()
      })
      this.hasNewLamps = true
    },
    
    // 清除指定维度的更新
    clearDimensionUpdates(dimId: number) {
      this.lampUpdates = this.lampUpdates.filter(u => u.dimensionId !== dimId)
      if (this.lampUpdates.length === 0) {
        this.hasNewLamps = false
      }
    },
    
    // 清除所有灯更新
    clearLampUpdates() {
      this.lampUpdates = []
      this.hasNewLamps = false
    },
    
    // 设置灯友新消息提示
    setSocialNotification(value: boolean) {
      this.hasNewSocial = value
    },
    
    // 设置我的新消息提示
    setProfileNotification(value: boolean) {
      this.hasNewProfile = value
    },
    
    // 清除灯阵通知
    clearLampsNotification() {
      this.hasNewLamps = false
    },
    
    // 清除灯友通知
    clearSocialNotification() {
      this.hasNewSocial = false
    },
    
    // 清除我的通知
    clearProfileNotification() {
      this.hasNewProfile = false
    },
    
    // 清除所有通知
    clearAll() {
      this.hasNewLamps = false
      this.hasNewSocial = false
      this.hasNewProfile = false
    }
  }
})
