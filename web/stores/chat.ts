import { defineStore } from 'pinia'

type ChatMessage = {
  id: string
  from: 'self' | 'friend'
  text: string
  createdAt: string
}

type ChatFriend = {
  id: string
  nickname?: string | null
  avatarUrl?: string | null
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    threads: {} as Record<string, ChatMessage[]>
  }),

  getters: {
    getThread: (state) => (friendId: string) => state.threads[friendId] || []
  },

  actions: {
    ensureThread(friend: ChatFriend) {
      if (!friend?.id) return
      if (this.threads[friend.id]) return
      this.threads[friend.id] = []
    },

    sendSelf(friendId: string, text: string) {
      const clean = text.trim()
      if (!friendId || !clean) return
      if (!this.threads[friendId]) this.threads[friendId] = []
      this.threads[friendId].push({
        id: `${friendId}-self-${Date.now()}`,
        from: 'self',
        text: clean,
        createdAt: new Date().toISOString()
      })
    },

    enqueueAutoReply() {
      // 真实聊天功能暂未接入后端
    }
  }
})
