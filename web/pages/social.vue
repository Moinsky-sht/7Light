<template>
  <div class="social-page">
    <!-- 加载状态 -->
    <div v-if="isPageLoading" class="page-loading">
      <div class="loading-content">
        <div class="star-loader"></div>
        <p>正在连接星海...</p>
      </div>
    </div>

    <!-- 3D 星海视图（默认全屏） -->
    <div class="starfield-fullscreen">
      <StarField3D 
        :stars="starfieldData.stars" 
        :summary="starfieldData.summary"
        @boost="handleStarBoost"
        @select="handleStarSelect"
        @message="openFeed"
      />
    </div>

    <!-- 顶部标题栏 -->
    <header class="page-header">
      <h1 class="page-title">灯友星海 烛照众生</h1>
      <div class="header-actions">
        <!-- 好友列表按钮 -->
        <button class="action-btn" @click="showFriendsList = true">
          <span class="btn-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </span>
          <span class="btn-badge" v-if="friends.length">{{ friends.length }}</span>
        </button>
        <!-- 朋友动态按钮 -->
        <button class="action-btn" @click="openFeed">
          <span class="btn-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </span>
          <span v-if="unreadCount" class="btn-badge unread">{{ unreadCount }}</span>
        </button>
      </div>
    </header>

    <!-- 好友列表侧边栏 -->
    <transition name="slide-right">
      <div v-if="showFriendsList" class="friends-sidebar">
        <div class="sidebar-header">
          <button v-if="showChat" class="close-btn" @click="closeChat" aria-label="返回">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <h2>{{ showChat ? (chatFriend?.nickname || '聊天') : '我的灯友' }}</h2>
          <button class="close-btn" @click="closeFriendsSidebar" aria-label="关闭">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div v-if="showChat" class="chat-pane">
          <div ref="chatListEl" class="chat-messages">
            <div v-for="m in currentChatMessages" :key="m.id" class="chat-row" :class="{ self: m.from === 'self' }">
              <div v-if="m.from !== 'self'" class="chat-avatar">
                <img :src="chatFriend?.avatarUrl || getAvatarUrl(chatFriend?.id)" class="chat-avatar-img" />
              </div>
              <div class="chat-bubble">
                <div class="chat-text">{{ m.text }}</div>
                <div class="chat-time">{{ formatTime(m.createdAt) }}</div>
              </div>
            </div>
          </div>
          <div class="chat-inputbar">
            <input
              v-model="chatInput"
              type="text"
              class="chat-input"
              :placeholder="chatFriend?.nickname ? `给 ${chatFriend.nickname} 说点什么...` : '说点什么...'"
              @keyup.enter="sendChat"
            />
            <button class="chat-send" @click="sendChat" :disabled="!chatInput.trim()">发送</button>
          </div>
        </div>
        
        <template v-else>
          <!-- 添加好友 -->
          <div class="add-friend-box">
            <input 
              v-model="friendCode" 
              type="text" 
              placeholder="输入手机号或用户ID"
              class="friend-input"
            />
            <button 
              class="add-btn"
              @click="addFriend"
              :disabled="!friendCode.trim() || isAdding"
            >
              {{ isAdding ? '...' : '添加' }}
            </button>
          </div>
          <div class="my-code-box">
            <p class="my-code-label">我的邀请码</p>
            <div class="code-display" @click="copyMyCode">
              <span class="code">{{ myCode }}</span>
              <span class="copy-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </span>
            </div>
          </div>

          <!-- 好友列表 -->
          <div class="friends-list">
            <div v-if="isLoading" class="loading-state">
              <div class="loading-spinner"></div>
            </div>
            <div v-else-if="friends.length === 0" class="empty-state">
              <p>还没有灯友</p>
            </div>
            <div 
              v-else
              v-for="friend in friends" 
              :key="friend.id"
              class="friend-item"
              @click="openChat(friend)"
            >
              <div class="friend-avatar">
                <img :src="friend.avatarUrl || getAvatarUrl(friend.id)" class="avatar-img" />
              </div>
              <div class="friend-info">
                <span class="friend-name">{{ friend.nickname || '灯友' }}</span>
                <span class="friend-stats">
                  {{ friend.streak || 0 }}天 · {{ friend.litLamps || 0 }}灯
                </span>
              </div>
              <button class="boost-btn-small" @click.stop="handleStarBoost({ id: friend.id, isSelf: false })" title="借火">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
              </button>
            </div>
          </div>
        </template>
      </div>
    </transition>

    <!-- 朋友动态面板 -->
    <transition name="slide-up">
      <div v-if="showFeed" class="messages-panel">
        <div class="panel-header">
          <h2>朋友动态</h2>
          <button class="close-btn" @click="showFeed = false">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="messages-list">
          <div v-if="feedItems.length === 0" class="empty-state">
            <p>暂无动态</p>
          </div>
          <div 
            v-else
            v-for="item in feedItems" 
            :key="item.id"
            class="message-item"
            :class="{ unread: !item.isRead }"
          >
            <div class="msg-avatar" :style="!item.avatarUrl ? { background: item.color } : {}">
              <img v-if="item.avatarUrl" :src="item.avatarUrl" class="avatar-img" />
              <span v-else>{{ item.fromNickname?.charAt(0) || '灯' }}</span>
            </div>
            <div class="msg-content">
              <div class="msg-header">
                <span class="msg-from">{{ item.fromNickname }}</span>
                <span class="msg-time">{{ formatTime(item.createdAt) }}</span>
              </div>
              <p class="msg-text">{{ item.content }}</p>
            </div>
          </div>
        </div>

      </div>
    </transition>

    <!-- 遮罩层 -->
    <transition name="overlay-fade">
      <div 
        v-if="showFriendsList || showFeed" 
        class="overlay"
        @click="closeFriendsSidebar(); showFeed = false"
      ></div>
    </transition>

    <transition name="overlay-fade">
      <div v-if="showInfoModal" class="modal-overlay" @click="closeInfoModal"></div>
    </transition>
    <transition name="slide-up">
      <div v-if="showInfoModal" class="modal-card" role="dialog" aria-modal="true">
        <div class="modal-title">{{ infoModalTitle }}</div>
        <div class="modal-text">{{ infoModalMessage }}</div>
        <div class="modal-actions">
          <button class="modal-btn" @click="closeInfoModal">知道了</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import StarField3D from '~/components/ui/StarField3D.vue'
import { useUserStore } from '~/stores/user'

definePageMeta({
  middleware: 'auth',
  keepalive: true
})

const userStore = useUserStore()

// UI状态
const showFriendsList = ref(false)
const showFeed = ref(false)
const isPageLoading = ref(true)

// 数据
const friends = ref<any[]>([])
const friendCode = ref('')
const myCode = ref('')
const isLoading = ref(true)
const isAdding = ref(false)
const isBoosting = ref(false)

const showInfoModal = ref(false)
const infoModalTitle = ref('提示')
const infoModalMessage = ref('')

const showChat = ref(false)
const chatFriend = ref<any>(null)
const chatInput = ref('')
const chatListEl = ref<HTMLElement | null>(null)
const chatThreads = ref<Record<string, Array<{ id: string; from: 'self' | 'friend'; text: string; createdAt: string }>>>({})

const feedItems = ref<Array<{
  id: string
  fromNickname: string
  avatarUrl?: string | null
  content: string
  createdAt: string
  isRead: boolean
  color: string
}>>([])

const unreadCount = computed(() => feedItems.value.filter(i => !i.isRead).length)

const currentChatMessages = computed(() => {
  const friendId = chatFriend.value?.id
  if (!friendId) return []
  return chatThreads.value[friendId] || []
})

// 星海数据
const starfieldData = reactive({
  stars: [] as any[],
  summary: {
    totalStars: 0,
    checkedInToday: 0,
    notCheckedIn: 0,
    checkedInPercentage: 0
  }
})

// 获取头像 URL
const getAvatarUrl = (id: string | undefined) => {
  if (!id) return '/avatars/sanguo_avatars/01.jpg'
  let sum = 0
  for (let i = 0; i < id.length; i++) {
    sum += id.charCodeAt(i)
  }
  const index = (sum % 50) + 1
  return `/avatars/sanguo_avatars/${index.toString().padStart(2, '0')}.jpg`
}

// 格式化时间
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

const getAvatarColor = (text: string) => {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 60%, 45%)`
}


// 获取星海数据
const fetchStarfield = async () => {
  try {
    const { data } = await useFetch('/api/social/starfield')
    const result = data.value as any
    if (result?.success) {
      starfieldData.stars = result.data.stars || []
      starfieldData.summary = result.data.summary || {
        totalStars: 0,
        checkedInToday: 0,
        notCheckedIn: 0,
        checkedInPercentage: 0
      }
    }
  } catch (e) {
    console.error('获取星海数据失败:', e)
    starfieldData.stars = []
    starfieldData.summary = {
      totalStars: 0,
      checkedInToday: 0,
      notCheckedIn: 0,
      checkedInPercentage: 0
    }
  }
}

// 获取好友列表
const fetchFriends = async () => {
  isLoading.value = true
  try {
    const { data } = await useFetch('/api/social/friends')
    const result = data.value as any
    if (result?.success) {
      friends.value = result.data.friends || []
      myCode.value = result.data.myCode || (userStore.user?.id ? `QXD${userStore.user.id.substring(0, 6).toUpperCase()}` : '')
    }
  } catch (e) {
    console.error('获取好友列表失败:', e)
  } finally {
    isLoading.value = false
  }
}

const fetchFeeds = async () => {
  try {
    const { data } = await useFetch('/api/social/feeds')
    const result = data.value as any
    if (result?.success) {
      feedItems.value = (result.data.items || []).map((item: any) => ({
        id: item.id,
        fromNickname: item.fromNickname,
        avatarUrl: item.avatarUrl,
        content: item.content,
        createdAt: item.createdAt,
        isRead: item.isRead,
        color: getAvatarColor(item.fromNickname || '灯')
      }))
    }
  } catch (e) {
    console.error('获取动态失败:', e)
  }
}

const markFeedsRead = async () => {
  try {
    await $fetch('/api/social/feeds/read', { method: 'POST' })
  } catch (e) {
    console.error('更新动态状态失败:', e)
  }
}

// 复制邀请码
const copyMyCode = async () => {
  try {
    await navigator.clipboard.writeText(myCode.value)
    infoModalTitle.value = '提示'
    infoModalMessage.value = '邀请码已复制'
    showInfoModal.value = true
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 添加好友
const addFriend = async () => {
  if (!friendCode.value.trim() || isAdding.value) return
  
  isAdding.value = true
  try {
    const code = friendCode.value.trim()
    const payload: any = /^\d{11}$/.test(code) ? { phone: code } : { friendId: code }
    const { data } = await useFetch('/api/social/add', {
      method: 'POST',
      body: payload
    })
    
    const result = data.value as any
    if (result?.success) {
      friendCode.value = ''
      await fetchFriends()
      await fetchStarfield()
      infoModalTitle.value = '成功'
      infoModalMessage.value = '添加成功！'
      showInfoModal.value = true
    } else {
      infoModalTitle.value = '提示'
      infoModalMessage.value = result?.message || '添加失败'
      showInfoModal.value = true
    }
  } catch (e: any) {
    infoModalTitle.value = '提示'
    infoModalMessage.value = e.message || '添加失败'
    showInfoModal.value = true
  } finally {
    isAdding.value = false
  }
}

const openFeed = async () => {
  showFeed.value = true
  feedItems.value = feedItems.value.map(i => ({ ...i, isRead: true }))
  await markFeedsRead()
  await fetchFeeds()
}

const closeFriendsSidebar = () => {
  showFriendsList.value = false
  closeChat()
}

const scrollChatToBottom = async () => {
  await nextTick()
  const el = chatListEl.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

const ensureChatThread = (friend: any) => {
  const friendId = friend?.id
  if (!friendId) return
  if (chatThreads.value[friendId]) return
  chatThreads.value[friendId] = []
}

const openChat = async (friend: any) => {
  chatFriend.value = friend
  showChat.value = true
  ensureChatThread(friend)
  await scrollChatToBottom()
}

const closeChat = () => {
  showChat.value = false
  chatFriend.value = null
  chatInput.value = ''
}

const sendChat = async () => {
  const text = chatInput.value.trim()
  const friendId = chatFriend.value?.id
  if (!text || !friendId) return

  const now = new Date().toISOString()
  if (!chatThreads.value[friendId]) chatThreads.value[friendId] = []
  chatThreads.value[friendId].push({
    id: `${friendId}-self-${Date.now()}`,
    from: 'self',
    text,
    createdAt: now
  })
  chatInput.value = ''
  await scrollChatToBottom()

  // 真实聊天功能暂未接入后端
}

const closeInfoModal = () => {
  showInfoModal.value = false
}

// 星海中选中星星
const handleStarSelect = (star: any) => {
  if (!star.isSelf) return
}

// 星海中借火
const handleStarBoost = async (star: any) => {
  if (star.isSelf || isBoosting.value) return
  
  isBoosting.value = true
  try {
    const { data } = await useFetch('/api/social/boost', {
      method: 'POST',
      body: { friendId: star.id }
    })
    
    const result = data.value as any
    if (result?.success) {
      await fetchStarfield()
      infoModalTitle.value = '助力成功'
      infoModalMessage.value = '助力成功，灯友已接收通知。'
      showInfoModal.value = true
    } else {
      infoModalTitle.value = '助力失败'
      infoModalMessage.value = result?.message || '助力失败'
      showInfoModal.value = true
    }
  } catch (e: any) {
    infoModalTitle.value = '助力失败'
    infoModalMessage.value = e.message || '助力失败'
    showInfoModal.value = true
  } finally {
    isBoosting.value = false
  }
}

onMounted(async () => {
  await userStore.init()
  if (!userStore.isLoggedIn) {
    navigateTo('/login')
    return
  }
  if (!myCode.value && userStore.user?.id) {
    myCode.value = `QXD${userStore.user.id.substring(0, 6).toUpperCase()}`
  }
  
  try {
    // 优先加载星海数据
    await fetchStarfield()
    // 延迟加载好友列表
    fetchFriends()
    fetchFeeds()
  } finally {
    isPageLoading.value = false
  }
})
</script>

<style scoped>
.social-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0d1b2a 100%);
  padding-bottom: 80px;
}

/* 页面加载状态 */
.page-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #0a0a1a;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.loading-content {
  text-align: center;
  color: #D4AF37;
}

.star-loader {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-top-color: #D4AF37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 星海全屏 */
.starfield-fullscreen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* 顶部标题栏 */
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 50px 20px 16px;
  background: linear-gradient(180deg, rgba(10, 10, 26, 0.9) 0%, transparent 100%);
}

.page-title {
  font-size: 20px;
  font-weight: 900;
  color: #f5e6d3;
  letter-spacing: 4px;
  font-family: "Noto Serif SC", serif;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  position: relative;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(245, 230, 211, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(212, 175, 55, 0.2);
  transform: scale(1.05);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f5e6d3;
}

.btn-icon svg {
  width: 20px;
  height: 20px;
  stroke: #f5e6d3;
}

.btn-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #D4AF37;
  border-radius: 9px;
  font-size: 10px;
  font-weight: 700;
  color: #0a0a1a;
  padding: 0 4px;
}

.btn-badge.unread {
  background: #A83232;
  color: #f5e6d3;
}

/* 遮罩层 */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.5);
}

/* 好友列表侧边栏 */
.friends-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 300px;
  max-width: 85vw;
  z-index: 300;
  background: linear-gradient(180deg, #1a1a2e 0%, #0d1b2a 100%);
  border-left: 1px solid rgba(212, 175, 55, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 50px 16px 16px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.sidebar-header h2 {
  font-size: 16px;
  font-weight: 700;
  color: #f5e6d3;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(245, 230, 211, 0.1);
  border: none;
  border-radius: 50%;
  color: #f5e6d3;
  font-size: 14px;
  cursor: pointer;
}

/* 添加好友 */
.add-friend-box {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
}

.friend-input {
  flex: 1;
  padding: 10px 12px;
  background: rgba(245, 230, 211, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
  font-size: 13px;
  color: #f5e6d3;
}

.friend-input:focus {
  outline: none;
  border-color: #D4AF37;
}

.add-btn {
  padding: 10px 16px;
  background: linear-gradient(135deg, #A83232 0%, #8A2525 100%);
  border: none;
  border-radius: 10px;
  color: #f5e6d3;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.add-btn:disabled {
  opacity: 0.5;
}

/* 邀请码显示 */
.my-code-box {
  padding: 0 16px 16px;
}

.my-code-label {
  font-size: 11px;
  color: rgba(245, 230, 211, 0.5);
  margin-bottom: 6px;
}

.code-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(245, 230, 211, 0.05);
  border: 1px dashed rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.code-display:hover {
  background: rgba(245, 230, 211, 0.1);
  border-color: #D4AF37;
}

.code-display .code {
  font-family: monospace;
  font-size: 14px;
  color: #D4AF37;
  font-weight: 700;
  letter-spacing: 1px;
}

.copy-icon {
  color: rgba(245, 230, 211, 0.5);
  display: flex;
  align-items: center;
}

/* 好友列表 */
.friends-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
}

.loading-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: rgba(245, 230, 211, 0.5);
  font-size: 13px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(212, 175, 55, 0.2);
  border-top-color: #D4AF37;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.friend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.friend-item:hover {
  background: rgba(245, 230, 211, 0.05);
}

.friend-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.friend-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.friend-name {
  font-size: 14px;
  font-weight: 600;
  color: #f5e6d3;
}

.friend-stats {
  font-size: 11px;
  color: rgba(245, 230, 211, 0.5);
}

.friend-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(245, 230, 211, 0.3);
}

.chat-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px 12px 10px;
}

.chat-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 10px;
}

.chat-row.self {
  justify-content: flex-end;
}

.chat-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.26);
  flex-shrink: 0;
}

.chat-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.chat-bubble {
  max-width: 76%;
  border-radius: 14px;
  padding: 10px 12px 8px;
  background: rgba(245, 230, 211, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.12);
}

.chat-row.self .chat-bubble {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(168, 50, 50, 0.18) 100%);
  border-color: rgba(212, 175, 55, 0.18);
}

.chat-text {
  font-size: 13px;
  color: rgba(245, 230, 211, 0.92);
  line-height: 1.45;
  word-break: break-word;
}

.chat-time {
  margin-top: 6px;
  font-size: 10px;
  color: rgba(245, 230, 211, 0.42);
}

.chat-inputbar {
  display: flex;
  gap: 8px;
  padding: 10px 12px 12px;
  border-top: 1px solid rgba(212, 175, 55, 0.1);
  background: rgba(10, 10, 26, 0.4);
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

.friend-status.online {
  background: #4ECDC4;
}

.boost-btn-small {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 50%;
  color: #D4AF37;
  cursor: pointer;
  transition: all 0.2s;
}

.boost-btn-small:hover {
  background: #D4AF37;
  color: #0a0a1a;
  transform: scale(1.1);
}

/* 消息面板 */
.messages-panel {
  position: fixed;
  bottom: 80px;
  left: 16px;
  right: 16px;
  max-height: 60vh;
  z-index: 300;
  background: linear-gradient(180deg, #1a1a2e 0%, #0d1b2a 100%);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.panel-header h2 {
  font-size: 16px;
  font-weight: 700;
  color: #f5e6d3;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  max-height: 300px;
}

.message-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  margin-bottom: 8px;
}

.message-item.unread {
  background: rgba(212, 175, 55, 0.1);
}

.msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgba(212, 175, 55, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.msg-content {
  flex: 1;
}

.msg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.msg-from {
  font-size: 13px;
  font-weight: 600;
  color: #f5e6d3;
}

.msg-time {
  font-size: 10px;
  color: rgba(245, 230, 211, 0.4);
}

.msg-text {
  font-size: 13px;
  color: rgba(245, 230, 211, 0.8);
  line-height: 1.4;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 2200;
}

.modal-card {
  position: fixed;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  width: min(420px, calc(100vw - 28px));
  border-radius: 16px;
  background: rgba(10, 10, 26, 0.9);
  border: 1px solid rgba(212, 175, 55, 0.18);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
  padding: 14px 14px 12px;
  z-index: 2201;
}

.modal-title {
  font-size: 14px;
  font-weight: 800;
  color: #f5e6d3;
  margin-bottom: 6px;
}

.modal-text {
  font-size: 13px;
  color: rgba(245, 230, 211, 0.85);
  line-height: 1.45;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.modal-btn {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(212, 175, 55, 0.24);
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.85) 0%, rgba(168, 50, 50, 0.85) 100%);
  color: #0a0a1a;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.modal-btn:active {
  transform: translateY(1px);
}

/* 发送消息 */
.send-message-box {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid rgba(212, 175, 55, 0.1);
}

.message-input {
  flex: 1;
  padding: 10px 14px;
  background: rgba(245, 230, 211, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 20px;
  font-size: 13px;
  color: #f5e6d3;
}

.message-input:focus {
  outline: none;
  border-color: #D4AF37;
}

.send-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #D4AF37 0%, #A83232 100%);
  border: none;
  border-radius: 20px;
  color: #0a0a1a;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.send-btn:disabled {
  opacity: 0.5;
}

/* 过渡动画 */
.slide-right-enter-active {
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-right-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
}

.slide-right-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(15%);
  opacity: 0.8;
}

.slide-up-enter-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(15%);
  opacity: 0;
}

/* 遮罩层过渡动画 */
.overlay-fade-enter-active {
  transition: opacity 0.3s ease;
}

.overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
</style>
