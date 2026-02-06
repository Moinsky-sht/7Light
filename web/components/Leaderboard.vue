<template>
  <div class="leaderboard-container">
    <!-- 顶部标题 -->
    <div class="header-section">
      <h2 class="section-title">排行榜</h2>
      <p class="section-subtitle">{{ data?.description || '群雄逐鹿·榜上有名' }}</p>
    </div>

    <!-- 类型切换标签 - 纯SVG图标 -->
    <div class="type-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.type"
        class="type-tab"
        :class="{ active: leaderboardStore.currentType === tab.type }"
        @click="leaderboardStore.setType(tab.type)"
      >
        <div class="tab-icon">
          <svg viewBox="0 0 48 48" v-html="tab.svg" style="width: 100%; height: 100%;"></svg>
        </div>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- 我的排名卡片 -->
    <div v-if="myRank" class="my-rank-card">
      <div class="my-rank-content">
        <div class="my-rank-left">
          <div class="rank-badge-mini">
            {{ myRank.rank }}
          </div>
          <span class="my-rank-label">我的排名</span>
        </div>
        <div class="my-rank-right">
          <span class="my-rank-value">{{ formatNumber(myRank.value) }}</span>
          <span class="my-rank-unit">{{ unit }}</span>
        </div>
      </div>
    </div>

    <!-- 排行榜列表 -->
    <div class="leaderboard-list">
      <div v-if="leaderboardStore.isLoading" class="loading-state">
        <svg viewBox="0 0 100 100" class="loading-svg">
          <circle cx="50" cy="50" r="40" fill="none" stroke="url(#goldGrad)" stroke-width="4" stroke-dasharray="60 40" stroke-linecap="round"/>
          <circle cx="50" cy="50" r="30" fill="none" stroke="#A83232" stroke-width="2" stroke-dasharray="30 70" stroke-linecap="round" opacity="0.5"/>
        </svg>
        <p class="loading-text">群雄正在集结...</p>
      </div>

      <div v-else-if="leaderboardStore.error" class="error-state">
        <svg viewBox="0 0 60 60" class="error-svg">
          <circle cx="30" cy="30" r="25" fill="none" stroke="#A83232" stroke-width="2"/>
          <circle cx="30" cy="22" r="4" fill="#A83232"/>
          <line x1="30" y1="30" x2="30" y2="42" stroke="#A83232" stroke-width="3" stroke-linecap="round"/>
        </svg>
        <p class="error-text">{{ leaderboardStore.error }}</p>
        <button class="retry-btn" @click="leaderboardStore.fetchLeaderboard(leaderboardStore.currentType)">
          <svg viewBox="0 0 24 24" class="retry-icon">
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M21 3v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          重新获取
        </button>
      </div>

      <template v-else>
        <div class="list-content">
          <TransitionGroup name="rank">
            <div 
              v-for="(item, index) in leaderboardList" 
              :key="item.userId"
              class="rank-item"
              :class="{ 
                'is-me': item.userId === userStore.user?.id,
                'top1': item.rank === 1,
                'top2': item.rank === 2,
                'top3': item.rank === 3
              }"
            >
              <!-- 排名徽章 -->
              <div class="rank-badge" :class="'rank-' + item.rank">
                <span class="rank-number">{{ item.rank }}</span>
              </div>

              <!-- 用户区域 -->
              <div class="user-section">
                <div class="avatar-frame">
                  <div class="avatar-img-wrapper">
                    <img 
                      v-if="item.avatarUrl" 
                      :src="item.avatarUrl" 
                      :alt="item.nickname"
                      class="avatar-img"
                    />
                    <svg v-else viewBox="0 0 50 50" class="avatar-placeholder">
                      <circle cx="25" cy="25" r="25" fill="#f5f5f5"/>
                      <path d="M10,42 Q25,52 40,42" fill="none" stroke="#ddd" stroke-width="3" stroke-linecap="round"/>
                    </svg>
                  </div>
                </div>
                
                <div class="user-info">
                  <span class="nickname" :class="{ 'is-me': item.userId === userStore.user?.id }">
                    {{ item.nickname }}
                    <svg v-if="item.userId === userStore.user?.id" viewBox="0 0 20 20" class="me-badge">
                      <circle cx="10" cy="10" r="9" fill="url(#goldGrad)"/>
                      <path d="M6,10 L9,13 L14,7" fill="none" stroke="#2C241B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <span class="user-title">{{ getTitleByRank(item.rank) }}</span>
                </div>
              </div>

              <!-- 数值展示 -->
              <div class="value-section">
                <span class="value-text">{{ formatNumber(item.value) }}</span>
                <span class="value-unit">{{ unit }}</span>
              </div>
            </div>
          </TransitionGroup>

          <!-- 空状态 -->
          <div v-if="leaderboardList.length === 0" class="empty-state">
            <svg viewBox="0 0 120 120" class="empty-svg">
              <circle cx="60" cy="60" r="40" fill="none" stroke="#ddd" stroke-width="2" stroke-dasharray="8,8"/>
              <text x="60" y="65" text-anchor="middle" font-size="14" fill="#999">暂无数据</text>
            </svg>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useLeaderboardStore, type LeaderboardType } from '~/stores/leaderboard'
import { useUserStore } from '~/stores/user'

const leaderboardStore = useLeaderboardStore()
const userStore = useUserStore()

// 纯SVG图标配置
const tabs: { type: LeaderboardType; label: string; svg: string }[] = [
  {
    type: 'life_days',
    label: '续命',
    svg: `<path d="M24,6 L24,42 M16,42 L32,42 M18,16 C18,16 16,22 16,28 C16,34 18,36 24,36 C30,36 32,34 32,28 C32,22 30,16 30,16 L18,16 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
  },
  {
    type: 'streak',
    label: '连胜',
    svg: `<path d="M24,44 C18,44 14,38 14,30 C14,20 22,14 24,4 C26,14 34,20 34,30 C34,38 30,44 24,44 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`
  },
  {
    type: 'lamps',
    label: '星灯',
    svg: `<path d="M24,8 L28,18 L39,18 L30,24 L34,34 L24,28 L14,34 L18,24 L9,18 L20,18 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`
  },
  {
    type: 'total_days',
    label: '累计',
    svg: `<rect x="10" y="8" width="28" height="32" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10,16 L38,16 M18,6 L18,10 M30,6 L30,10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`
  },
  {
    type: 'friends',
    label: '灯友',
    svg: `<circle cx="24" cy="18" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14,40 C14,32 18,28 24,28 C30,28 34,32 34,40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`
  }
]

const currentTitle = computed(() => leaderboardStore.currentTitle)
const leaderboardList = computed(() => leaderboardStore.leaderboardList)
const myRank = computed(() => leaderboardStore.myRank)
const data = computed(() => leaderboardStore.data)

const maxValue = computed(() => {
  if (leaderboardList.value.length === 0) return 1
  return Math.max(...leaderboardList.value.map(item => item.value), 1)
})

const unit = computed(() => {
  switch (leaderboardStore.currentType) {
    case 'life_days': return '天'
    case 'streak': return '天'
    case 'lamps': return '盏'
    case 'total_days': return '天'
    case 'friends': return '位'
    default: return ''
  }
})

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const getAvatarBorderColor = (rank: number) => {
  switch (rank) {
    case 1: return '#FFD700'
    case 2: return '#C0C0C0'
    case 3: return '#CD7F32'
    default: return '#D4AF37'
  }
}

const getTitleByRank = (rank: number) => {
  const titles: Record<number, string> = {
    1: '天下无双',
    2: '绝世英雄',
    3: '勇冠三军',
    4: '名列前茅',
    5: '后起之秀'
  }
  return titles[rank] || '渐入佳境'
}

onMounted(() => {
  leaderboardStore.fetchLeaderboard('lamps')
})
</script>

<style scoped>
.leaderboard-container {
  background: #f8f9fa;
  min-height: 400px;
  border-radius: 16px;
}

/* 顶部标题 */
.header-section {
  padding: 20px 24px 12px;
  text-align: center;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px;
}

.section-subtitle {
  font-size: 12px;
  color: #999;
}

/* 类型切换标签 */
.type-tabs {
  display: flex;
  gap: 8px;
  padding: 0 16px 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.type-tabs::-webkit-scrollbar {
  display: none;
}

.type-tab {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #999;
  transition: all 0.2s ease;
}

.tab-icon {
  width: 32px;
  height: 32px;
  padding: 6px;
  border-radius: 12px;
  background: #f5f5f5;
  color: inherit;
  transition: all 0.2s ease;
}
.type-tab.active .tab-icon {
  background: #2c3e50;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(44, 62, 80, 0.2);
}

.type-tab.active {
  color: #2c3e50;
}

.tab-label {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

/* 我的排名卡片 */
.my-rank-card {
  margin: 0 16px 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #2c3e50, #1a252f);
  border-radius: 12px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(44, 62, 80, 0.2);
}

.my-rank-bg {
  display: none;
}

.my-rank-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.my-rank-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rank-badge-mini {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.rank-badge-mini svg {
  display: none;
}

.my-rank-label {
  font-size: 14px;
  opacity: 0.8;
}

.my-rank-right {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.my-rank-value {
  font-size: 24px;
  font-weight: 600;
  color: #FFD700;
}

.my-rank-unit {
  font-size: 12px;
  opacity: 0.6;
}

/* 排行榜列表 */
.leaderboard-list {
  padding: 0 16px 20px;
  max-height: 350px;
  overflow-y: auto;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 16px;
}

.loading-svg {
  width: 80px;
  height: 80px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #8C735A;
}

.error-svg {
  width: 60px;
  height: 60px;
}

.error-text {
  font-size: 14px;
  color: #A83232;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #D4AF37 0%, #A83232 100%);
  color: #F3E9D2;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
}

.retry-icon {
  width: 18px;
  height: 18px;
}

/* 列表项 */
.list-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.rank-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.rank-item.is-me {
  background: rgba(212, 175, 55, 0.15);
  border-color: #D4AF37;
}

.rank-item.top1 {
  background: linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,255,255,0.9) 50%, rgba(255,215,0,0.1) 100%);
  border-color: #FFD700;
}

.rank-item.top2 {
  background: linear-gradient(135deg, rgba(192,192,192,0.2) 0%, rgba(255,255,255,0.9) 50%, rgba(192,192,192,0.1) 100%);
  border-color: #C0C0C0;
}

.rank-item.top3 {
  background: linear-gradient(135deg, rgba(205,127,50,0.2) 0%, rgba(255,255,255,0.9) 50%, rgba(205,127,50,0.1) 100%);
  border-color: #CD7F32;
}

/* 排名徽章 */
.rank-badge {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: bold;
  font-size: 14px;
  color: #999;
}

.rank-item.top1 .rank-badge { color: #FFD700; font-size: 18px; }
.rank-item.top2 .rank-badge { color: #C0C0C0; font-size: 16px; }
.rank-item.top3 .rank-badge { color: #CD7F32; font-size: 16px; }

.rank-number {
  line-height: 1;
}

/* 用户区域 */
.user-section {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.avatar-frame {
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.avatar-img-wrapper {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1px solid #eee;
  overflow: hidden;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-item.top1 .avatar-img-wrapper { border-color: #FFD700; border-width: 2px; }
.rank-item.top2 .avatar-img-wrapper { border-color: #C0C0C0; border-width: 2px; }
.rank-item.top3 .avatar-img-wrapper { border-color: #CD7F32; border-width: 2px; }

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.nickname {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #2C241B;
  font-family: "Noto Serif SC", serif;
}

.nickname.is-me {
  color: #A83232;
}

.me-badge {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.user-title {
  display: block;
  font-size: 11px;
  color: #8C735A;
  margin-top: 2px;
}

/* 数值展示 */
.value-section {
  display: flex;
  align-items: baseline;
  gap: 4px;
  text-align: right;
}

.value-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  font-family: monospace;
}

.rank-item.top1 .value-text { color: #FFD700; }
.rank-item.top2 .value-text { color: #C0C0C0; }
.rank-item.top3 .value-text { color: #CD7F32; }

.value-unit {
  font-size: 12px;
  color: #999;
}

/* 空状态 */
.empty-svg {
  width: 120px;
  height: 120px;
}

.empty-text {
  font-size: 14px;
  color: #8C735A;
  text-align: center;
}

/* 过渡动画 */
.rank-enter-active,
.rank-leave-active {
  transition: all 0.4s ease;
}

.rank-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.rank-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.rank-move {
  transition: transform 0.4s ease;
}
</style>
