<template>
  <div class="lamp-detail-page">
    <!-- 背景 -->
    <div class="page-bg">
      <div class="bg-gradient"></div>
      <div class="bg-particles">
        <div v-for="n in 30" :key="'p-'+n" 
          class="particle"
          :style="{
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animationDelay: (Math.random() * 5) + 's'
          }"
        ></div>
      </div>
    </div>

    <!-- 顶部导航 -->
    <header class="page-header">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">‹</span>
      </button>
      <div class="header-title">
        <h1 class="lamp-name">{{ currentLamp.name }}</h1>
        <span class="lamp-subtitle">{{ currentLamp.label }}</span>
      </div>
      <button class="history-btn">
        <span class="history-icon">史</span>
      </button>
    </header>

    <!-- 状态徽章 -->
    <div class="status-badge" :class="{ 'is-lit': litCount >= 4 }">
      <span class="badge-text">{{ litCount >= 4 ? '灯火长明' : '尚需精进' }}</span>
    </div>

    <!-- 主体：七盏子灯 -->
    <main class="sub-lamps-section">
      <!-- 中心标识 -->
      <div class="center-emblem">
        <div class="emblem-ring"></div>
        <div class="emblem-core">
          <span class="emblem-char">{{ currentLamp.name?.[0] || '灯' }}</span>
        </div>
      </div>

      <!-- 七盏子灯环形布局 -->
      <div class="lamps-circle">
        <div 
          v-for="(sub, index) in subDimensions" 
          :key="index"
          class="sub-lamp-item"
          :class="{ 'is-lit': sub.isLit }"
          :style="getSubLampStyle(index)"
          @click="selectSubLamp(sub, index)"
        >
          <LotusLamp 
            :isLit="sub.isLit" 
            size="70px"
            glowSize="100px"
            :glowIntensity="sub.isLit ? 0.6 : 0"
          />
          <span class="sub-lamp-name">{{ sub.name }}</span>
        </div>
      </div>

      <!-- 连接线 -->
      <svg class="connection-svg" viewBox="0 0 300 300">
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(212,175,55,0.3)"/>
            <stop offset="100%" stop-color="transparent"/>
          </radialGradient>
        </defs>
        <circle cx="150" cy="150" r="80" fill="url(#centerGlow)"/>
        <circle 
          v-for="n in 7" :key="'ring-'+n"
          cx="150" cy="150" 
          :r="90 + n * 5"
          fill="none"
          stroke="rgba(212,175,55,0.1)"
          stroke-width="1"
          stroke-dasharray="4 8"
        />
      </svg>
    </main>

    <!-- 统计卡片 -->
    <section class="stats-card">
      <div class="stats-header">
        <span class="stats-icon">析</span>
        <h3 class="stats-title">当前状态</h3>
      </div>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-value">{{ litCount }}/7</span>
          <span class="stat-label">已亮灯盏</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value good">{{ scoreLevel }}</span>
          <span class="stat-label">能量评级</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ Math.round((litCount / 7) * 100) }}%</span>
          <span class="stat-label">完成度</span>
        </div>
      </div>
    </section>

    <!-- 建议卡片 -->
    <section class="suggestion-card">
      <div class="suggestion-header">
        <span class="suggestion-icon">谏</span>
        <h3 class="suggestion-title">灵机建议</h3>
      </div>
      <div class="suggestion-content" v-if="aiSummary">
        <p class="suggestion-summary">{{ aiSummary.summary }}</p>
        <div class="suggestion-list">
          <div v-for="(s, idx) in aiSummary.suggestions" :key="idx" class="suggestion-item">
            <span class="suggestion-bullet">✦</span>
            <span class="suggestion-text">{{ s }}</span>
          </div>
        </div>
      </div>
      <p class="suggestion-text" v-else-if="isLoadingSummary">
        正在感应天机...
      </p>
      <p class="suggestion-text" v-else>
        <span class="highlight">「{{ firstUnlit?.name || '坚持' }}」</span>
        {{ firstUnlit ? '尚未点亮。建议补充相关记录或进行专门的调理。' : '所有灯盏皆已点亮，功德无量！继续保持。' }}
      </p>
    </section>

    <!-- 底部留白 -->
    <div class="bottom-spacer"></div>

    <!-- 子灯详情弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showSubDetail && selectedSubLamp" class="sub-detail-overlay" @click.self="closeSubDetail">
          <div class="sub-detail-modal">
            <div class="modal-header">
              <div class="modal-lamp">
                <LotusLamp 
                  :isLit="selectedSubLamp.isLit" 
                  size="50px"
                  glowSize="70px"
                  :glowIntensity="selectedSubLamp.isLit ? 0.5 : 0"
                />
              </div>
              <div class="modal-title-area">
                <h3 class="modal-title">{{ selectedSubLamp.name }}</h3>
                <p class="modal-tip">{{ selectedSubLamp.tip }}</p>
              </div>
              <button class="modal-close" @click="closeSubDetail">×</button>
            </div>
            
            <div class="modal-body">
              <div class="detail-row">
                <span class="detail-label">当前状态</span>
                <span class="detail-value" :class="{ lit: selectedSubLamp.isLit }">
                  {{ selectedSubLamp.isLit ? '已点亮' : '未点亮' }}
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">记录数值</span>
                <span class="detail-value">{{ selectedSubLamp.value || '暂无记录' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">更新时间</span>
                <span class="detail-value">{{ selectedSubLamp.time || '—' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">亮度值</span>
                <div class="brightness-bar">
                  <div class="brightness-fill" :style="{ width: selectedSubLamp.brightness + '%' }"></div>
                  <span class="brightness-text">{{ selectedSubLamp.brightness }}%</span>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button class="modal-btn primary" @click="goToCheckin">
                <span>去打卡</span>
              </button>
              <button class="modal-btn secondary" @click="closeSubDetail">
                <span>关闭</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import LotusLamp from '~/components/svg/LotusLamp.vue'
import { useLampsStore } from '~/stores/lamps'
import { useUserStore } from '~/stores/user'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const lampId = route.params.id
const lampsStore = useLampsStore()
const userStore = useUserStore()

// 选中的子灯详情
const selectedSubLamp = ref(null)
const showSubDetail = ref(false)

// 灯数据映射（维度描述与子项提示）
const lampDataMap = {
  'TIANSHU': { 
    dimId: 1, name: '天枢', label: '命火 · 打卡', 
    description: '记录每日打卡，积累生命能量',
    subs: [
      { name: '第一天', tip: '坚持第一天打卡' },
      { name: '第二天', tip: '连续第二天' },
      { name: '第三天', tip: '三天小成' },
      { name: '第四天', tip: '四天渐入佳境' },
      { name: '第五天', tip: '五天习惯养成' },
      { name: '第六天', tip: '六天稳定期' },
      { name: '第七天', tip: '七天圆满' }
    ]
  },
  'TIANXUAN': { 
    dimId: 2, name: '天璇', label: '谷神 · 饮食',
    description: '均衡饮食，滋养身心',
    subs: [
      { name: '碳水', tip: '主食摄入适量' },
      { name: '蔬果', tip: '蔬菜水果充足' },
      { name: '蛋白', tip: '优质蛋白补充' },
      { name: '油盐', tip: '控制油盐摄入' },
      { name: '饮水', tip: '每日饮水2000ml' },
      { name: '节律', tip: '规律进餐时间' },
      { name: '知止', tip: '七分饱即止' }
    ]
  },
  'TIANJI': { 
    dimId: 3, name: '天玑', label: '动静 · 运动',
    description: '动静结合，强健体魄',
    subs: [
      { name: '步数', tip: '日行万步' },
      { name: '心肺', tip: '有氧运动30分钟' },
      { name: '肌力', tip: '力量训练' },
      { name: '破坐', tip: '每小时起身活动' },
      { name: '拉伸', tip: '柔韧性训练' },
      { name: '姿态', tip: '保持正确姿势' },
      { name: '户外', tip: '户外活动时间' }
    ]
  },
  'TIANQUAN': { 
    dimId: 4, name: '天权', label: '归根 · 睡眠',
    description: '安眠养神，恢复元气',
    subs: [
      { name: '入睡', tip: '23点前入睡' },
      { name: '时长', tip: '睡眠7-8小时' },
      { name: '效率', tip: '深睡比例>20%' },
      { name: '连续', tip: '不中断睡眠' },
      { name: '醒感', tip: '醒来精神状态' },
      { name: '仪式', tip: '睡前放松仪式' },
      { name: '午憩', tip: '午休20分钟' }
    ]
  },
  'YUHENG': { 
    dimId: 5, name: '玉衡', label: '调息 · 心理',
    description: '调节情绪，平和心境',
    subs: [
      { name: '稳定', tip: '情绪稳定度' },
      { name: '压力', tip: '压力管理' },
      { name: '专注', tip: '专注力训练' },
      { name: '社交', tip: '社交互动' },
      { name: '愉悦', tip: '愉悦时刻记录' },
      { name: '冥想', tip: '冥想练习' },
      { name: '截断', tip: '负面情绪截断' }
    ]
  },
  'KAIYANG': { 
    dimId: 6, name: '开阳', label: '营卫 · 体征',
    description: '关注身体信号，及时调理',
    subs: [
      { name: '排泄', tip: '排便规律' },
      { name: '皮肤', tip: '皮肤状态' },
      { name: '痛感', tip: '身体不适记录' },
      { name: '体温', tip: '体温监测' },
      { name: '视疲', tip: '眼睛疲劳度' },
      { name: '呼吸', tip: '呼吸顺畅度' },
      { name: '指标', tip: '健康指标' }
    ]
  },
  'YAOGUANG': { 
    dimId: 7, name: '摇光', label: '固表 · 环境',
    description: '优化环境，固护正气',
    subs: [
      { name: '光磁', tip: '减少电磁辐射' },
      { name: '清气', tip: '空气质量' },
      { name: '节气', tip: '顺应节气养生' },
      { name: '离屏', tip: '减少屏幕时间' },
      { name: '噪音', tip: '噪音控制' },
      { name: '光合', tip: '自然光照' },
      { name: '温湿', tip: '温湿度适宜' }
    ]
  }
}

const currentLamp = computed(() => {
  return lampDataMap[lampId] || { dimId: 0, name: '未知', label: '子维度', description: '', subs: [] }
})

// 从 store 获取真实数据
const dimensionData = computed(() => {
  return lampsStore.getDimension(currentLamp.value.dimId)
})

// 子维度数据
const subDimensions = computed(() => {
  const storeData = dimensionData.value?.subItems || []
  return currentLamp.value.subs.map((sub, idx) => {
    const realData = storeData.find(s => s.subItemId === idx + 1)
    const isLit = realData?.state === 'ON'
    const rawBrightness = realData?.brightness ?? 0
    const brightnessPercent = Math.round((rawBrightness / 3) * 100)
    return {
      id: idx + 1,
      name: sub.name,
      tip: sub.tip,
      isLit,
      brightness: brightnessPercent,
      value: realData?.lastValue || null,
      time: realData?.updatedAt ? new Date(realData.updatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : null,
      color: realData?.color || (isLit ? 'GOLD' : 'GRAY')
    }
  })
})

const litCount = computed(() => subDimensions.value.filter(s => s.isLit).length)
const firstUnlit = computed(() => subDimensions.value.find(s => !s.isLit))
const scoreLevel = computed(() => {
  if (litCount.value >= 6) return '优秀'
  if (litCount.value >= 4) return '良好'
  if (litCount.value >= 2) return '一般'
  return '待提升'
})

// 计算子灯位置（环形布局）
const getSubLampStyle = (index) => {
  const total = 7
  const radius = 42 // 百分比
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  const x = 50 + radius * Math.cos(angle)
  const y = 50 + radius * Math.sin(angle)
  return {
    left: x + '%',
    top: y + '%',
    animationDelay: (index * 0.1) + 's'
  }
}

const goBack = () => {
  router.back()
}

const selectSubLamp = (sub, index) => {
  selectedSubLamp.value = sub
  showSubDetail.value = true
}

const closeSubDetail = () => {
  showSubDetail.value = false
  selectedSubLamp.value = null
}

const goToCheckin = () => {
  router.push('/')
}

const aiSummary = ref(null)
const isLoadingSummary = ref(false)

// 获取AI总结
const fetchSummary = async () => {
  if (!currentLamp.value.dimId) return
  
  // 标记该维度为已读，消除红点
  lampsStore.markAsViewed(currentLamp.value.dimId)
  
  isLoadingSummary.value = true
  try {
    const res = await $fetch('/api/lamps/summary', {
      params: { dimId: currentLamp.value.dimId }
    })
    if (res.success && res.data.aiSummary) {
      aiSummary.value = res.data.aiSummary
    }
  } catch (e) {
    console.error('获取AI总结失败:', e)
  } finally {
    isLoadingSummary.value = false
  }
}

// 初始化
onMounted(async () => {
  await userStore.init()
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  try {
    await lampsStore.fetchStatus()
    await fetchSummary()
  } catch (e) {
    console.error('获取灯阵详情失败:', e)
  }
})
</script>

<style scoped>
.lamp-detail-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
  background: linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0d1b2a 100%);
  padding-bottom: 100px;
}

/* 背景 */
.page-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.1) 0%, transparent 50%);
}

.bg-particles {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(212, 175, 55, 0.5);
  border-radius: 50%;
  animation: particleFloat 8s ease-in-out infinite;
}

@keyframes particleFloat {
  0%, 100% { opacity: 0; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-20px); }
}

/* 顶部导航 */
.page-header {
  position: relative;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 50px 16px 20px;
}

.back-btn,
.history-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: #f5e6d3;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover,
.history-btn:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(212,175,55,0.3);
}

.back-icon {
  font-size: 24px;
}

.history-icon {
  font-size: 16px;
  font-family: "Noto Serif SC", serif;
}

.header-title {
  text-align: center;
}

.lamp-name {
  font-size: 22px;
  font-weight: 900;
  color: #f5e6d3;
  font-family: "Noto Serif SC", serif;
  letter-spacing: 4px;
}

.lamp-subtitle {
  font-size: 11px;
  color: rgba(212, 175, 55, 0.8);
  letter-spacing: 2px;
}

/* 状态徽章 */
.status-badge {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.badge-text {
  padding: 6px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  font-size: 11px;
  color: rgba(245, 230, 211, 0.6);
  letter-spacing: 2px;
}

.status-badge.is-lit .badge-text {
  background: rgba(168, 50, 50, 0.2);
  border-color: rgba(168, 50, 50, 0.4);
  color: #D4AF37;
}

/* 子灯区域 */
.sub-lamps-section {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  max-width: 350px;
  margin: 0 auto;
  z-index: 10;
}

.center-emblem {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
}

.emblem-ring {
  position: absolute;
  inset: -10px;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 50%;
  animation: ringPulse 3s ease-in-out infinite;
}

@keyframes ringPulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.6; }
}

.emblem-core {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(168,50,50,0.2) 100%);
  border: 2px solid rgba(212, 175, 55, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.emblem-char {
  font-size: 24px;
  font-weight: 900;
  color: #D4AF37;
  font-family: "Noto Serif SC", serif;
  text-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
}

.lamps-circle {
  position: absolute;
  inset: 0;
}

.sub-lamp-item {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: lampFadeIn 0.6s ease-out backwards;
}

@keyframes lampFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.sub-lamp-item:hover {
  transform: translate(-50%, -55%) scale(1.1);
  z-index: 100;
}

.sub-lamp-name {
  font-size: 11px;
  color: rgba(245, 230, 211, 0.7);
  font-weight: 600;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  white-space: nowrap;
}

.sub-lamp-item.is-lit .sub-lamp-name {
  color: #D4AF37;
}

.connection-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

/* 统计卡片 */
.stats-card {
  position: relative;
  z-index: 10;
  margin: 20px 16px;
  padding: 20px;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
}

.stats-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.stats-icon {
  font-size: 14px;
  color: #D4AF37;
  font-family: "Noto Serif SC", serif;
}

.stats-title {
  font-size: 14px;
  color: #f5e6d3;
  font-weight: 700;
  letter-spacing: 2px;
}

.stats-grid {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 900;
  color: #D4AF37;
  font-family: "Noto Serif SC", serif;
}

.stat-value.good {
  color: #4ADE80;
}

.stat-label {
  font-size: 10px;
  color: rgba(245, 230, 211, 0.5);
  letter-spacing: 1px;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: rgba(255,255,255,0.1);
}

/* 建议卡片 */
.suggestion-card {
  position: relative;
  z-index: 10;
  margin: 0 16px;
  padding: 20px;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.suggestion-icon {
  font-size: 14px;
  color: #A83232;
  font-family: "Noto Serif SC", serif;
}

.suggestion-title {
  font-size: 14px;
  color: #f5e6d3;
  font-weight: 700;
  letter-spacing: 2px;
}

.suggestion-text {
  font-size: 13px;
  color: rgba(245, 230, 211, 0.7);
  line-height: 1.8;
  margin-bottom: 16px;
}

.suggestion-summary {
  font-size: 13px;
  color: #D4AF37;
  line-height: 1.6;
  margin-bottom: 12px;
  font-weight: 500;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.suggestion-bullet {
  color: #A83232;
  font-size: 12px;
  margin-top: 2px;
}

.suggestion-text .highlight {
  color: #D4AF37;
  font-weight: 700;
}

.suggestion-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: linear-gradient(135deg, #A83232 0%, #D4AF37 100%);
  border: none;
  color: #fff;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(168, 50, 50, 0.4);
}

.action-btn.secondary {
  background: transparent;
  border: 1px solid rgba(212,175,55,0.3);
  color: #D4AF37;
}

.action-btn.secondary:hover {
  background: rgba(212,175,55,0.1);
}

.bottom-spacer {
  height: 20px;
}

</style>

<!-- 弹窗样式需要非 scoped 才能应用到 Teleport 内容 -->
<style>
.sub-detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.sub-detail-modal {
  width: 100%;
  max-width: 340px;
  background: linear-gradient(180deg, #1a1a2e 0%, #0d1b2a 100%);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(212, 175, 55, 0.1);
}

.sub-detail-modal .modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: rgba(212, 175, 55, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.sub-detail-modal .modal-lamp {
  flex-shrink: 0;
}

.sub-detail-modal .modal-title-area {
  flex: 1;
}

.sub-detail-modal .modal-title {
  font-size: 18px;
  font-weight: 900;
  color: #f5e6d3;
  font-family: "Noto Serif SC", serif;
  letter-spacing: 2px;
  margin-bottom: 4px;
}

.sub-detail-modal .modal-tip {
  font-size: 11px;
  color: rgba(212, 175, 55, 0.7);
}

.sub-detail-modal .modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(245, 230, 211, 0.6);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sub-detail-modal .modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f5e6d3;
}

.sub-detail-modal .modal-body {
  padding: 20px;
}

.sub-detail-modal .detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.sub-detail-modal .detail-row:last-child {
  border-bottom: none;
}

.sub-detail-modal .detail-label {
  font-size: 13px;
  color: rgba(245, 230, 211, 0.5);
}

.sub-detail-modal .detail-value {
  font-size: 14px;
  font-weight: 700;
  color: #f5e6d3;
}

.sub-detail-modal .detail-value.lit {
  color: #D4AF37;
}

.sub-detail-modal .brightness-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  max-width: 150px;
}

.sub-detail-modal .brightness-bar .brightness-fill {
  flex: 1;
  height: 6px;
  background: linear-gradient(90deg, #A83232 0%, #D4AF37 100%);
  border-radius: 3px;
  position: relative;
}

.sub-detail-modal .brightness-text {
  font-size: 12px;
  color: #D4AF37;
  font-weight: 700;
  min-width: 35px;
  text-align: right;
}

.sub-detail-modal .modal-actions {
  display: flex;
  gap: 12px;
  padding: 0 20px 20px;
}

.sub-detail-modal .modal-btn {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sub-detail-modal .modal-btn.primary {
  background: linear-gradient(135deg, #A83232 0%, #D4AF37 100%);
  border: none;
  color: #fff;
}

.sub-detail-modal .modal-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(168, 50, 50, 0.4);
}

.sub-detail-modal .modal-btn.secondary {
  background: transparent;
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: #D4AF37;
}

.sub-detail-modal .modal-btn.secondary:hover {
  background: rgba(212, 175, 55, 0.1);
}

/* 弹窗动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .sub-detail-modal,
.modal-leave-to .sub-detail-modal {
  transform: scale(0.9) translateY(20px);
}
</style>
