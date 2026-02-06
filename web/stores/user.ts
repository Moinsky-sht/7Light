/**
 * 用户状态管理
 */
import { defineStore } from 'pinia'

interface UserInfo {
  id: string
  phone: string | null
  nickname: string | null
  avatarUrl: string | null
  role?: string | null
}

interface UserProfile {
  userId?: string
  gender: string | null
  birthDate: string | null
  heightCm: number | null
  weightKg: number | null
  bmi: number | null
  goals: string[]
  chronicDiseases: string[]
  allergies: string[]
  sleepPattern: string | null
  dietHabit: string | null
  exerciseFreq: string | null
  waterIntake?: string | null
  workType?: string | null
  lateNight?: boolean
  regularMeals?: boolean
  healthConcerns?: string[]
  smokeDrink: { smoke: boolean, drink: boolean } | null
  occupation: string | null
  notificationSettings: {
    checkin: boolean
    dimensions: Record<string, boolean>
  } | null
  settings?: any
  privacySettings?: any
  connectedDevices?: any[]
  updatedAt?: string | null
}

interface UserStats {
  totalDays: number
  currentStreak: number
  maxStreak: number
  lifeSeconds: number
  todayAnswered: number
}

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    token: null as string | null,
    user: null as UserInfo | null,
    profile: null as UserProfile | null,
    stats: null as UserStats | null,
    lampsLit: 0,
    lampsTotal: 49,
    friendsCount: 0,
    isPro: false,
    loading: false
  }),

  getters: {
    lifeDays: (state) => state.stats ? state.stats.totalDays : 0,
    displayName: (state) => state.user?.nickname || '灯友',
    isUserPro: (state) => state.isPro || state.user?.phone === 'admin' // admin default pro
  },

  actions: {
    // 初始化：检查本地存储的 token 和 PRO 状态
    async init() {
      const token = localStorage.getItem('sevenstar_token')
      const isPro = localStorage.getItem('sevenstar_is_pro')
      if (isPro === 'true') {
        this.isPro = true
      }
      
      if (token) {
        this.token = token
        await this.fetchCurrentUser()
      }
    },

    // 升级会员
    upgradePro() {
      this.isPro = true
      localStorage.setItem('sevenstar_is_pro', 'true')
    },
    
    // 取消会员 (仅测试用)
    cancelPro() {
      this.isPro = false
      localStorage.removeItem('sevenstar_is_pro')
    },

    // 更新用户资料
    async updateProfile(profileData: Partial<UserProfile> & { nickname?: string, avatarUrl?: string }) {
      try {
        const headers: Record<string, string> = {}
        if (this.token) headers.Authorization = `Bearer ${this.token}`
        const result = await $fetch('/api/user/profile', {
          method: 'POST',
          body: profileData,
          headers
        }) as any

        if (result?.success) {
          // 提取用户和profile数据
          const { user, profile } = result.data || {}
          
          // 1. 更新 user (nickname, avatarUrl)
          if (user) {
            if (this.user) {
              this.user.nickname = user.nickname || this.user.nickname
              this.user.avatarUrl = user.avatar_url || this.user.avatarUrl
            } else if (profileData.nickname || profileData.avatarUrl) {
              this.user = {
                id: '',
                phone: null,
                nickname: profileData.nickname || null,
                avatarUrl: profileData.avatarUrl || null,
                role: null
              }
            }
          }
          
          // 2. 更新 profile
          if (profile) {
            // 处理从数据库返回的 snake_case 字段
            const parseJson = (val: string | undefined, fallback: any) => {
              if (!val) return fallback
              try {
                return typeof val === 'string' ? JSON.parse(val) : val
              } catch {
                return fallback
              }
            }
            
            this.profile = {
              userId: profile.user_id || this.profile?.userId || '',
              gender: profile.gender || this.profile?.gender || null,
              birthDate: profile.birth_date || this.profile?.birthDate || null,
              heightCm: profile.height_cm || this.profile?.heightCm || null,
              weightKg: profile.weight_kg || this.profile?.weightKg || null,
              bmi: profile.bmi || this.profile?.bmi || null,
              goals: parseJson(profile.goals, this.profile?.goals || []),
              chronicDiseases: parseJson(profile.chronic_diseases, this.profile?.chronicDiseases || []),
              allergies: parseJson(profile.allergies, this.profile?.allergies || []),
              sleepPattern: profile.sleep_pattern || this.profile?.sleepPattern || null,
              dietHabit: profile.diet_habit || this.profile?.dietHabit || null,
              exerciseFreq: profile.exercise_freq || this.profile?.exerciseFreq || null,
              waterIntake: profile.water_intake || (this.profile as any)?.waterIntake || null,
              workType: profile.work_type || (this.profile as any)?.workType || null,
              lateNight: Boolean(profile.late_night),
              regularMeals: Boolean(profile.regular_meals),
              healthConcerns: parseJson(profile.health_concerns, (this.profile as any)?.healthConcerns || []),
              smokeDrink: parseJson(profile.smoke_drink, this.profile?.smokeDrink || null),
              occupation: profile.occupation || this.profile?.occupation || null,
              notificationSettings: parseJson(profile.notification_settings, this.profile?.notificationSettings || null),
              settings: parseJson(profile.settings, (this.profile as any)?.settings || null),
              privacySettings: parseJson(profile.privacy_settings, (this.profile as any)?.privacySettings || null),
              connectedDevices: parseJson(profile.connected_devices, (this.profile as any)?.connectedDevices || []),
              updatedAt: profile.updated_at || this.profile?.updatedAt || null,
            }
          }
          
          return { success: true, message: result.message }
        }
        return { success: false, message: result?.message || '更新失败' }
      } catch (e: any) {
        console.error('Update profile error:', e)
        return { success: false, message: e.message || '更新失败' }
      }
    },

    // 登录
    async login(phone: string, password: string) {
      this.loading = true
      try {
        const result = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { phone, password }
        }) as any

        if (result?.success) {
          this.token = result.data.token
          this.user = {
            id: result.data.userId,
            phone: result.data.phone,
            nickname: result.data.nickname,
            avatarUrl: result.data.avatarUrl,
            role: result.data.role || null
          }
          this.isLoggedIn = true
          this.isPro = Boolean(result.data.isPro)
          if (this.isPro) localStorage.setItem('sevenstar_is_pro', 'true')
          else localStorage.removeItem('sevenstar_is_pro')
          localStorage.setItem('sevenstar_token', result.data.token)
          return { success: true }
        }
        throw new Error(result?.message || '登录失败')
      } catch (e: any) {
        return { success: false, message: e.message || '登录失败' }
      } finally {
        this.loading = false
      }
    },

    // 注册
    async register(phone: string, password: string, nickname?: string) {
      this.loading = true
      try {
        const result = await $fetch('/api/auth/register', {
          method: 'POST',
          body: { phone, password, nickname }
        }) as any

        if (result?.success) {
          this.token = result.data.token
          this.user = {
            id: result.data.userId,
            phone: result.data.phone,
            nickname: result.data.nickname,
            avatarUrl: null,
            role: result.data.role || null
          }
          this.isLoggedIn = true
          localStorage.setItem('sevenstar_token', result.data.token)
          return { success: true }
        }
        throw new Error(result?.message || '注册失败')
      } catch (e: any) {
        return { success: false, message: e.message || '注册失败' }
      } finally {
        this.loading = false
      }
    },

    // 获取当前用户信息
    async fetchCurrentUser() {
      try {
        const headers: Record<string, string> = {}
        if (this.token) headers.Authorization = `Bearer ${this.token}`
        const result = await $fetch('/api/auth/me', { headers }) as any

        if (result?.success) {
          this.user = {
            id: result.data.id,
            phone: result.data.phone,
            nickname: result.data.nickname,
            avatarUrl: result.data.avatarUrl,
            role: result.data.role || null
          }
          this.profile = result.data.profile
          this.stats = result.data.stats
          this.isPro = Boolean(result.data.isPro)
          if (this.isPro) localStorage.setItem('sevenstar_is_pro', 'true')
          else localStorage.removeItem('sevenstar_is_pro')
          this.isLoggedIn = true
          return true
        }
        return false
      } catch (e) {
        this.logout()
        return false
      }
    },

    // 获取首页数据
    async fetchHomeData() {
      try {
        const headers: Record<string, string> = {}
        if (this.token) headers.Authorization = `Bearer ${this.token}`
        const result = await $fetch('/api/user/home', { headers }) as any
        if (result?.success) {
          this.stats = {
            totalDays: result.data.totalDays,
            currentStreak: result.data.currentStreak,
            maxStreak: result.data.maxStreak,
            lifeSeconds: result.data.lifeSeconds,
            todayAnswered: result.data.todayProgress?.answered || 0
          }
          this.lampsLit = result.data.lampsLit ?? 0
          this.lampsTotal = result.data.lampsTotal ?? 49
          this.friendsCount = result.data.friendsCount ?? 0
          return result.data
        }
        return null
      } catch (e) {
        return null
      }
    },

    // 登出
    logout() {
      this.isLoggedIn = false
      this.token = null
      this.user = null
      this.profile = null
      this.stats = null
      this.lampsLit = 0
      this.lampsTotal = 49
      this.friendsCount = 0
      this.isPro = false
      localStorage.removeItem('sevenstar_token')
      localStorage.removeItem('sevenstar_is_pro')
    }
  }
})
