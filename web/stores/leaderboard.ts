/**
 * 排行榜 Store
 */
import { defineStore } from 'pinia'

export type LeaderboardType = 'life_days' | 'streak' | 'lamps' | 'total_days' | 'friends'

interface LeaderboardItem {
  rank: number
  userId: string
  nickname: string
  avatarUrl: string | null
  value: number
  isTop3: boolean
  medal: 'gold' | 'silver' | 'bronze' | null
}

interface LeaderboardData {
  type: LeaderboardType
  title: string
  icon: string
  description: string
  leaderboard: LeaderboardItem[]
  currentUserRank: { rank: number; value: number } | null
  totalCount: number
}

export const useLeaderboardStore = defineStore('leaderboard', {
  state: () => ({
    currentType: 'life_days' as LeaderboardType,
    data: null as LeaderboardData | null,
    isLoading: false,
    error: null as string | null
  }),

  getters: {
    leaderboardList: (state) => state.data?.leaderboard || [],
    myRank: (state) => state.data?.currentUserRank,
    currentTitle: (state) => state.data?.title || '排行榜',
    currentIcon: (state) => state.data?.icon || '🏆'
  },

  actions: {
    async fetchLeaderboard(type: LeaderboardType) {
      this.isLoading = true
      this.error = null
      this.currentType = type

      try {
        const result = await $fetch('/api/social/leaderboard', {
          query: { type, limit: 50 }
        }) as any

        if (result?.success) {
          this.data = result.data
        } else {
          this.error = result?.message || '获取排行榜失败'
        }
      } catch (e: any) {
        console.error('Fetch leaderboard error:', e)
        this.error = e.message || '获取排行榜失败'
      } finally {
        this.isLoading = false
      }
    },

    setType(type: LeaderboardType) {
      if (type !== this.currentType) {
        this.fetchLeaderboard(type)
      }
    }
  }
})
