<template>
  <div class="chat-page">
    <header class="chat-header">
      <button class="back-btn" @click="goBack" aria-label="返回">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <div class="chat-title">
        <div class="chat-name">{{ friend.nickname || '灯友' }}</div>
        <div class="chat-sub">在线 · 星海</div>
      </div>
      <div class="chat-header-spacer"></div>
    </header>

    <main ref="listEl" class="chat-body">
      <div v-for="m in messages" :key="m.id" class="msg-row" :class="{ self: m.from === 'self' }">
        <div v-if="m.from !== 'self'" class="msg-avatar">
          <img :src="friend.avatarUrl || getAvatarUrl(friend.id)" class="msg-avatar-img" alt="avatar" />
        </div>
        <div class="msg-bubble">
          <div class="msg-text">{{ m.text }}</div>
          <div class="msg-time">{{ formatTime(m.createdAt) }}</div>
        </div>
      </div>
    </main>

    <footer class="chat-inputbar">
      <input
        v-model="input"
        type="text"
        class="chat-input"
        :placeholder="friend.nickname ? `给 ${friend.nickname} 说点什么...` : '说点什么...'"
        @keyup.enter="send"
      />
      <button class="chat-send" @click="send" :disabled="!input.trim()">发送</button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '~/stores/chat'

definePageMeta({
  middleware: 'auth',
  keepalive: true,
  layout: 'mobile'
})

const route = useRoute()
const chatStore = useChatStore()

const friend = reactive({
  id: route.params.id as string,
  nickname: (route.query.name as string) || '',
  avatarUrl: (route.query.avatar as string) || ''
})

const input = ref('')
const listEl = ref<HTMLElement | null>(null)

const messages = computed(() => chatStore.getThread(friend.id))

const getAvatarUrl = (id: string | undefined) => {
  if (!id) return '/avatars/sanguo_avatars/01.jpg'
  let sum = 0
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i)
  const index = (sum % 50) + 1
  return `/avatars/sanguo_avatars/${index.toString().padStart(2, '0')}.jpg`
}

const formatTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return date.toLocaleDateString()
}

const scrollToBottom = async () => {
  await nextTick()
  const el = listEl.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

const send = async () => {
  const text = input.value.trim()
  if (!text) return
  chatStore.sendSelf(friend.id, text)
  input.value = ''
  await scrollToBottom()
  // 真实聊天功能暂未接入后端
  await scrollToBottom()
}

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back()
    return
  }
  navigateTo('/social')
}

onMounted(async () => {
  chatStore.ensureThread(friend)
  await scrollToBottom()
})
</script>

<style scoped>
.chat-page {
  height: 100%;
  min-height: 100%;
  background: linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0d1b2a 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 14px;
  background: rgba(10, 10, 26, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(212, 175, 55, 0.12);
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid rgba(212, 175, 55, 0.18);
  background: rgba(245, 230, 211, 0.06);
  color: #f5e6d3;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.chat-title {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.chat-name {
  font-size: 15px;
  font-weight: 800;
  color: #f5e6d3;
}

.chat-sub {
  font-size: 11px;
  color: rgba(245, 230, 211, 0.5);
}

.chat-header-spacer {
  flex: 1;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px 14px 10px;
}

.msg-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 10px;
}

.msg-row.self {
  justify-content: flex-end;
}

.msg-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.26);
  flex-shrink: 0;
}

.msg-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.msg-bubble {
  max-width: 76%;
  border-radius: 14px;
  padding: 10px 12px 8px;
  background: rgba(245, 230, 211, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.12);
}

.msg-row.self .msg-bubble {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(168, 50, 50, 0.18) 100%);
  border-color: rgba(212, 175, 55, 0.18);
}

.msg-text {
  font-size: 13px;
  color: rgba(245, 230, 211, 0.92);
  line-height: 1.45;
  word-break: break-word;
}

.msg-time {
  margin-top: 6px;
  font-size: 10px;
  color: rgba(245, 230, 211, 0.42);
}

.chat-inputbar {
  display: flex;
  gap: 8px;
  padding: 10px 14px calc(14px + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(212, 175, 55, 0.1);
  background: rgba(10, 10, 26, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.chat-input {
  flex: 1;
  padding: 10px 12px;
  background: rgba(245, 230, 211, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  font-size: 13px;
  color: #f5e6d3;
}

.chat-input:focus {
  outline: none;
  border-color: #D4AF37;
}

.chat-send {
  padding: 10px 14px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #D4AF37 0%, #A83232 100%);
  color: #0a0a1a;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.chat-send:disabled {
  opacity: 0.45;
}
</style>
