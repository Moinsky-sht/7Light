<template>
  <nav class="bottom-nav">
    <NuxtLink 
      v-for="item in navItems" 
      :key="item.path"
      :to="item.path"
      class="nav-item"
      :class="{ active: isActive(item.path) }"
      @click="handleNavClick(item.path)"
    >
      <div class="nav-icon-wrapper">
        <div class="nav-icon">
          <component :is="item.icon" />
        </div>
        <!-- 新消息红点提示 -->
        <span 
          v-if="hasNotification(item.path)" 
          class="notification-dot"
        ></span>
      </div>
      <span class="nav-label">{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { useNotificationStore } from '~/stores/notification'

const route = useRoute()
const notificationStore = useNotificationStore()

// 图标组件
const IconHome = () => h('svg', { 
  viewBox: '0 0 24 24', 
  fill: 'none', 
  stroke: 'currentColor', 
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }),
  h('polyline', { points: '9 22 9 12 15 12 15 22' })
])

const IconLamp = () => h('svg', { 
  viewBox: '0 0 24 24', 
  fill: 'none', 
  stroke: 'currentColor', 
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('path', { d: 'M12 2v1' }),
  h('path', { d: 'M12 21v1' }),
  h('path', { d: 'M4.22 4.22l.71.71' }),
  h('path', { d: 'M19.07 4.22l-.71.71' }),
  h('path', { d: 'M2 12h1' }),
  h('path', { d: 'M21 12h1' }),
  h('circle', { cx: '12', cy: '12', r: '5' })
])

const IconFriends = () => h('svg', { 
  viewBox: '0 0 24 24', 
  fill: 'none', 
  stroke: 'currentColor', 
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
  h('circle', { cx: '9', cy: '7', r: '4' }),
  h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
  h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
])

const IconProfile = () => h('svg', { 
  viewBox: '0 0 24 24', 
  fill: 'none', 
  stroke: 'currentColor', 
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
}, [
  h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
  h('circle', { cx: '12', cy: '7', r: '4' })
])

const navItems = [
  { path: '/', label: '点灯', icon: IconHome },
  { path: '/lamps', label: '灯阵', icon: IconLamp },
  { path: '/social', label: '灯友', icon: IconFriends },
  { path: '/profile', label: '我的', icon: IconProfile }
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

// 检查是否有新消息通知
const hasNotification = (path: string) => {
  switch (path) {
    case '/lamps':
      return notificationStore.hasNewLamps
    case '/social':
      return notificationStore.hasNewSocial
    case '/profile':
      return notificationStore.hasNewProfile
    default:
      return false
  }
}

// 点击导航时清除对应的通知
const handleNavClick = (path: string) => {
  switch (path) {
    case '/lamps':
      notificationStore.clearLampsNotification()
      break
    case '/social':
      notificationStore.clearSocialNotification()
      break
    case '/profile':
      notificationStore.clearProfileNotification()
      break
  }
}
</script>

<style scoped>
.bottom-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 70px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(44, 36, 27, 0.08);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  text-decoration: none;
  color: #8C735A;
  transition: all 0.3s ease;
}

.nav-item.active {
  color: #A83232;
}

.nav-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon {
  width: 24px;
  height: 24px;
  transition: transform 0.3s ease;
}

.nav-icon svg {
  width: 100%;
  height: 100%;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

/* 新消息红点提示 */
.notification-dot {
  position: absolute;
  top: -2px;
  right: -6px;
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, #FF4444 0%, #CC0000 100%);
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(255, 68, 68, 0.4);
  animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { 
    transform: scale(1); 
    box-shadow: 0 2px 4px rgba(255, 68, 68, 0.4);
  }
  50% { 
    transform: scale(1.2); 
    box-shadow: 0 2px 8px rgba(255, 68, 68, 0.6);
  }
}

/* 深色主题下的红点 */
:root.dark .notification-dot {
  border-color: rgba(10, 10, 26, 0.95);
}

.nav-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
}

/* 深色主题适配（灯阵页面） */
:root.dark .bottom-nav,
.lamps-page ~ .bottom-nav {
  background: rgba(10, 10, 26, 0.95);
  border-top-color: rgba(212, 175, 55, 0.2);
}

:root.dark .nav-item,
.lamps-page ~ .bottom-nav .nav-item {
  color: rgba(245, 230, 211, 0.5);
}

:root.dark .nav-item.active,
.lamps-page ~ .bottom-nav .nav-item.active {
  color: #D4AF37;
}
</style>
