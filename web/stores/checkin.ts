/**
 * 打卡状态管理
 */
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

interface Question {
  questionId: string
  dimensionId: number
  subItemId: number
  dimensionName: string
  dimensionLabel: string
  subItemName: string
  question: string
}

interface AnswerResult {
  valid: boolean
  reply: string
  dimensionId: number
  subItemId: number
  metricName: string
  score: number
}

export const useCheckinStore = defineStore('checkin', {
  state: () => ({
    currentQuestion: null as Question | null,
    lastAnswer: null as AnswerResult | null,
    todayAnswered: 0,
    brightness: 0,
    isLoading: false,
    isSubmitting: false,
    changeCount: 0
  }),

  getters: {
    isLit: (state) => state.todayAnswered >= 10,
    // 测试模式：不限制每日打卡次数
    canAnswer: () => true,
    progress: (state) => Math.min(state.todayAnswered / 10, 1)
  },

  actions: {
    // 获取今日问题
    async fetchQuestion() {
      this.isLoading = true
      try {
        const result = await $fetch('/api/checkin/question') as any
        if (result?.success) {
          this.currentQuestion = result.data
          return result.data
        }
        return null
      } catch (e) {
        console.error('获取问题失败:', e)
        return null
      } finally {
        this.isLoading = false
      }
    },

    // 换题
    async changeQuestion() {
      if (this.changeCount >= 10) return null
      this.changeCount++
      return await this.fetchQuestion()
    },

    // 提交回答
    async submitAnswer(answerText: string) {
      if (!this.currentQuestion || this.isSubmitting || !this.canAnswer) {
        return null
      }

      this.isSubmitting = true
      try {
        const requestId = uuidv4()
        const result = await $fetch('/api/checkin/answer', {
          method: 'POST',
          body: {
            requestId,
            questionId: this.currentQuestion.questionId,
            question: this.currentQuestion.question,
            answerText,
            dimensionId: this.currentQuestion.dimensionId,
            subItemId: this.currentQuestion.subItemId
          }
        }) as any

        if (result?.success) {
          this.lastAnswer = result.data
          if (result.data.valid) {
            this.todayAnswered++
            this.brightness = Math.min(100, this.todayAnswered * 10)
          }
          return result.data
        }
        return null
      } catch (e: any) {
        console.error('提交回答失败:', e)
        return { valid: false, reply: '云游未归，稍后再试。' }
      } finally {
        this.isSubmitting = false
      }
    },

    // 重置今日状态
    resetToday() {
      this.todayAnswered = 0
      this.brightness = 0
      this.changeCount = 0
      this.lastAnswer = null
    },

    // 从首页数据同步状态
    syncFromHomeData(homeData: any) {
      if (homeData?.todayProgress) {
        this.todayAnswered = homeData.todayProgress.answered || 0
        this.brightness = homeData.todayProgress.brightness || 0
      }
    }
  }
})
