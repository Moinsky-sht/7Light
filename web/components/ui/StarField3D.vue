<template>
  <div class="starfield-3d-container" ref="containerRef">
    <canvas ref="canvasRef" class="starfield-canvas"></canvas>
    
    <!-- 选中用户信息卡片 - 横向布局 -->
    <transition name="card-fade">
      <div v-if="selectedStar" class="star-info-card" :style="cardPosition">
        <!-- 关闭按钮 -->
        <button class="card-close-btn" @click="selectedStar = null">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        
        <!-- 左侧：头像 -->
        <div class="card-avatar-section">
          <div class="star-avatar" :style="{ background: selectedStar.avatarUrl ? 'transparent' : selectedStar.starColor }">
            <img v-if="selectedStar.avatarUrl" :src="selectedStar.avatarUrl" class="avatar-img" />
            <span v-else>{{ selectedStar.nickname?.charAt(0) || '★' }}</span>
          </div>
          <!-- 打卡状态徽章 -->
          <div class="status-badge" :class="{ 'checked-in': selectedStar.todayCheckedIn }">
            <svg v-if="selectedStar.todayCheckedIn" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <svg v-else width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
        </div>
        
        <!-- 中间：用户信息 -->
        <div class="card-info-section">
          <div class="star-name">{{ selectedStar.nickname }}</div>
          <div class="star-stats-row">
            <!-- 连续打卡 -->
            <div class="stat-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              <span>{{ selectedStar.currentStreak }}天</span>
            </div>
            <!-- 点亮灯数 -->
            <div class="stat-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/>
              </svg>
              <span>{{ selectedStar.litLamps }}盏</span>
            </div>
            <!-- 累计天数 -->
            <div class="stat-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>{{ selectedStar.totalDays }}天</span>
            </div>
          </div>
          <div class="star-status-text" :class="{ 'checked-in': selectedStar.todayCheckedIn }">
            {{ selectedStar.todayCheckedIn ? '今日已打卡' : '今日未打卡' }}
          </div>
        </div>
        
        <!-- 右侧：操作按钮 -->
        <div v-if="!selectedStar.isSelf" class="card-actions-section">
          <button class="action-btn boost-btn" @click="handleBoost">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2c.5 2.5 2 4.5 4 6-2 1.5-3.5 3.5-4 6-.5-2.5-2-4.5-4-6 2-1.5 3.5-3.5 4-6z"/>
              <path d="M12 14c.3 1.5 1.2 2.7 2.4 3.6-1.2.9-2.1 2.1-2.4 3.6-.3-1.5-1.2-2.7-2.4-3.6 1.2-.9 2.1-2.1 2.4-3.6z"/>
            </svg>
            <span>借火</span>
          </button>
          <button class="action-btn message-btn" @click="handleMessage">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>消息</span>
          </button>
        </div>
        
        <!-- 自己的标识 -->
        <div v-else class="self-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>我</span>
        </div>
      </div>
    </transition>

    <!-- 统计信息 -->
    <div class="starfield-stats">
      <div class="stat-item">
        <span class="stat-value">{{ summary.totalStars }}</span>
        <span class="stat-label">附近灯友</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ summary.checkedInToday }}</span>
        <span class="stat-label">今日打卡</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ summary.checkedInPercentage }}%</span>
        <span class="stat-label">打卡率</span>
      </div>
    </div>

    <!-- 操作提示 -->
    <div class="interaction-hint">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      <span>拖动旋转 · 点击查看</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onActivated, onDeactivated, watch, reactive } from 'vue'

interface Star {
  id: string
  nickname: string
  avatarUrl?: string
  isSelf: boolean
  position: { x: number; y: number; z: number }
  brightness: number
  todayCheckedIn: boolean
  currentStreak: number
  totalDays: number
  litLamps: number
  starColor: string
}

interface Summary {
  totalStars: number
  checkedInToday: number
  notCheckedIn: number
  checkedInPercentage: number
}

const props = defineProps<{
  stars: Star[]
  summary: Summary
}>()

const emit = defineEmits(['boost', 'select', 'message'])

const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const selectedStar = ref<Star | null>(null)
const cardPosition = reactive({ left: '50%', top: '50%' })

// 3D 渲染相关变量
let animationId: number
let ctx: CanvasRenderingContext2D | null = null
let isDragging = false
let previousMousePosition = { x: 0, y: 0 }
let rotation = { x: 0, y: 0 }
let targetRotation = { x: 0, y: 0 }
let starPositions: { star: Star; screenX: number; screenY: number; z: number }[] = []

// 球体参数
const sphereRadius = 200
const fov = 500

// 头像图片缓存
const avatarImages: Map<string, HTMLImageElement> = new Map()
const loadedAvatars: Set<string> = new Set()

// 预加载头像图片
function preloadAvatars(stars: Star[]) {
  // ... (保持不变)
  console.log('开始预加载头像，共', stars.length, '个星星')
  let loadCount = 0
  for (const star of stars) {
    if (star.avatarUrl && !avatarImages.has(star.avatarUrl)) {
      const img = new Image()
      img.onload = () => {
        loadedAvatars.add(star.avatarUrl!)
        loadCount++
        if (loadCount % 10 === 0) {
          console.log('已加载头像:', loadCount)
        }
      }
      img.onerror = (e) => {
        console.log('头像加载失败:', star.nickname, star.avatarUrl)
      }
      img.src = star.avatarUrl
      avatarImages.set(star.avatarUrl, img)
    }
  }
}

// 渲染循环
const render = () => {
  if (!ctx || !containerRef.value || !canvasRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  const width = rect.width
  const height = rect.height
  const centerX = width / 2
  const centerY = height / 2

  // 清空画布
  ctx.clearRect(0, 0, width, height)

  // 平滑旋转
  rotation.x += (targetRotation.x - rotation.x) * 0.1
  rotation.y += (targetRotation.y - rotation.y) * 0.1

  // 自动旋转（当没有拖动时）
  if (!isDragging) {
    targetRotation.y += 0.002
  }

  // 计算所有星星的屏幕位置
  starPositions = []
  
  for (let i = 0; i < props.stars.length; i++) {
    const star = props.stars[i]
    
    // 处理位置为 (0,0,0) 的情况（中心星）
    let theta, phi
    const posLength = Math.sqrt(
      star.position.x ** 2 + star.position.y ** 2 + star.position.z ** 2
    )
    
    if (posLength < 0.001 || star.isSelf) {
      // 中心星固定在中心
      theta = rotation.y
      phi = rotation.x * 0.3
    } else {
      // 将API返回的位置映射到球面
      theta = Math.atan2(star.position.z, star.position.x) + rotation.y
      phi = Math.asin(Math.max(-1, Math.min(1, star.position.y / posLength))) + rotation.x
    }

    const x = sphereRadius * Math.cos(phi) * Math.cos(theta)
    const y = sphereRadius * Math.sin(phi)
    const z = sphereRadius * Math.cos(phi) * Math.sin(theta)

    // 透视投影
    const scale = fov / (fov + z)
    const screenX = centerX + x * scale
    const screenY = centerY - y * scale

    // 确保值是有限的
    if (!isFinite(screenX) || !isFinite(screenY) || !isFinite(z)) {
      continue
    }

    starPositions.push({ star, screenX, screenY, z })
  }

  // 按z排序（远的先画）
  starPositions.sort((a, b) => a.z - b.z)

  // 绘制连接线（好友之间）- 使用渐变线条
  const selfStar = starPositions.find(s => s.star.isSelf)
  if (selfStar) {
    for (const sp of starPositions) {
      if (!sp.star.isSelf && sp.z > -sphereRadius * 0.3) {
        // 根据距离和打卡状态计算透明度
        const distance = Math.sqrt(
          Math.pow(selfStar.screenX - sp.screenX, 2) + 
          Math.pow(selfStar.screenY - sp.screenY, 2)
        )
        const maxDist = Math.sqrt(width * width + height * height) / 2
        const distAlpha = Math.max(0.05, 0.3 - (distance / maxDist) * 0.25)
        const checkedInBonus = sp.star.todayCheckedIn ? 0.15 : 0
        const finalAlpha = Math.min(0.4, distAlpha + checkedInBonus)
        
        // 创建渐变线条
        const gradient = ctx.createLinearGradient(
          selfStar.screenX, selfStar.screenY,
          sp.screenX, sp.screenY
        )
        const selfColor = selfStar.star.todayCheckedIn ? 'rgba(212, 175, 55,' : 'rgba(255, 255, 255,'
        
        // 安全处理好友颜色
        let friendColorWithAlpha: string
        if (sp.star.todayCheckedIn && sp.star.starColor) {
          // 如果是已打卡的好友，使用其星星颜色
          const color = sp.star.starColor
          if (color.startsWith('rgba')) {
            // 已经是rgba格式，提取rgb部分
            const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
            if (match) {
              friendColorWithAlpha = `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${finalAlpha * 0.5})`
            } else {
              friendColorWithAlpha = `rgba(255, 255, 255, ${finalAlpha * 0.5})`
            }
          } else if (color.startsWith('rgb')) {
            // rgb格式，转换为rgba
            const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
            if (match) {
              friendColorWithAlpha = `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${finalAlpha * 0.5})`
            } else {
              friendColorWithAlpha = `rgba(255, 255, 255, ${finalAlpha * 0.5})`
            }
          } else if (color.startsWith('#')) {
            // 十六进制颜色
            const r = parseInt(color.slice(1, 3), 16)
            const g = parseInt(color.slice(3, 5), 16)
            const b = parseInt(color.slice(5, 7), 16)
            friendColorWithAlpha = `rgba(${r}, ${g}, ${b}, ${finalAlpha * 0.5})`
          } else {
            friendColorWithAlpha = `rgba(255, 255, 255, ${finalAlpha * 0.5})`
          }
        } else {
          friendColorWithAlpha = `rgba(255, 255, 255, ${finalAlpha * 0.3})`
        }
        
        gradient.addColorStop(0, selfColor + (finalAlpha * 0.8) + ')')
        gradient.addColorStop(0.5, selfColor + (finalAlpha * 0.3) + ')')
        gradient.addColorStop(1, friendColorWithAlpha)
        
        ctx.strokeStyle = gradient
        ctx.lineWidth = sp.star.todayCheckedIn ? 1 : 0.5
        ctx.beginPath()
        ctx.moveTo(selfStar.screenX, selfStar.screenY)
        ctx.lineTo(sp.screenX, sp.screenY)
        ctx.stroke()
      }
    }
  }

  // 绘制星星
  for (const sp of starPositions) {
    const { star, screenX, screenY, z } = sp
    
    // 根据z计算透明度和大小
    const alpha = Math.max(0.2, (z + sphereRadius) / (sphereRadius * 2))
    const size = getStarSize(star, z)

    // 绘制光晕
    if (star.todayCheckedIn) {
      const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, size * 3)
      gradient.addColorStop(0, star.starColor + '40')
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(screenX, screenY, size * 3, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.globalAlpha = alpha * star.brightness

    // 尝试绘制头像图片
    const avatarImg = star.avatarUrl ? avatarImages.get(star.avatarUrl) : null
    if (avatarImg && avatarImg.complete && avatarImg.naturalWidth > 0) {
      // 绘制圆形头像
      ctx.save()
      ctx.beginPath()
      ctx.arc(screenX, screenY, size, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      
      // 绘制头像图片
      const imgSize = size * 2
      ctx.drawImage(avatarImg, screenX - size, screenY - size, imgSize, imgSize)
      ctx.restore()
      
      // 绘制边框
      ctx.strokeStyle = star.starColor
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(screenX, screenY, size, 0, Math.PI * 2)
      ctx.stroke()
    } else {
      // 没有头像时绘制彩色圆形
      ctx.fillStyle = star.starColor
      ctx.beginPath()
      ctx.arc(screenX, screenY, size, 0, Math.PI * 2)
      ctx.fill()
    }

    // 自己的星星特殊标记
    if (star.isSelf) {
      ctx.strokeStyle = '#FFD700'
      ctx.lineWidth = 3
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.arc(screenX, screenY, size + 4, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.globalAlpha = 1
  }

  animationId = requestAnimationFrame(render)
}

// 设置画布大小
const resize = () => {
  if (!containerRef.value || !canvasRef.value || !ctx) return
  const canvas = canvasRef.value
  const rect = containerRef.value.getBoundingClientRect()
  canvas.width = rect.width * window.devicePixelRatio
  canvas.height = rect.height * window.devicePixelRatio
  canvas.style.width = rect.width + 'px'
  canvas.style.height = rect.height + 'px'
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
}

onMounted(() => {
  if (!canvasRef.value || !containerRef.value) return
  
  const canvas = canvasRef.value
  ctx = canvas.getContext('2d')
  if (!ctx) return

  resize()
  window.addEventListener('resize', resize)

  // 鼠标/触摸事件
  const handleStart = (e: MouseEvent | TouchEvent) => {
    isDragging = true
    const pos = getEventPosition(e)
    previousMousePosition = pos
  }

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return
    const pos = getEventPosition(e)
    const deltaX = pos.x - previousMousePosition.x
    const deltaY = pos.y - previousMousePosition.y
    
    targetRotation.y += deltaX * 0.005
    targetRotation.x += deltaY * 0.005
    targetRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotation.x))
    
    previousMousePosition = pos
  }

  const handleEnd = () => {
    isDragging = false
  }

  const handleClick = (e: MouseEvent) => {
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // 检查是否点击了某个星星
    for (const sp of starPositions) {
      const dx = x - sp.screenX
      const dy = y - sp.screenY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const starSize = getStarSize(sp.star, sp.z)
      
      if (dist < starSize + 10) {
        selectedStar.value = sp.star
        
        // 计算卡片位置，确保不溢出屏幕
        const cardWidth = 360
        const cardHeight = 120
        const padding = 20
        
        // 根据头像位置决定卡片显示方向（靠近屏幕中心）
        const screenCenterX = rect.width / 2
        const isLeftOfCenter = sp.screenX < screenCenterX
        const isRightOfCenter = sp.screenX > screenCenterX
        
        // 计算水平位置：头像在中心左侧，卡片显示在头像右侧；头像在中心右侧，卡片显示在头像左侧
        let cardX: number
        if (isLeftOfCenter) {
          cardX = sp.screenX + 40
        } else {
          cardX = sp.screenX - cardWidth - 40
        }
        
        // 确保卡片不超出左右边界
        cardX = Math.max(padding, Math.min(cardX, rect.width - cardWidth - padding))
        
        // 计算垂直位置：卡片显示在头像上方
        let cardY = sp.screenY - cardHeight - 20
        
        // 如果上方空间不足，则显示在头像下方
        if (cardY < padding) {
          cardY = sp.screenY + 30
        }
        
        // 确保卡片不超出底部边界
        cardY = Math.min(cardY, rect.height - cardHeight - padding)
        
        cardPosition.left = cardX + 'px'
        cardPosition.top = cardY + 'px'
        emit('select', sp.star)
        return
      }
    }
    selectedStar.value = null
  }

  canvas.addEventListener('mousedown', handleStart)
  canvas.addEventListener('mousemove', handleMove)
  canvas.addEventListener('mouseup', handleEnd)
  canvas.addEventListener('mouseleave', handleEnd)
  canvas.addEventListener('click', handleClick)
  
  canvas.addEventListener('touchstart', handleStart, { passive: true })
  canvas.addEventListener('touchmove', handleMove, { passive: true })
  canvas.addEventListener('touchend', handleEnd)

  render()

  onUnmounted(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', resize)
  })
})

onActivated(() => {
  resize() // 确保尺寸正确
  render()
})

onDeactivated(() => {
  cancelAnimationFrame(animationId)
})

function getEventPosition(e: MouseEvent | TouchEvent) {
  if ('touches' in e) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  return { x: e.clientX, y: e.clientY }
}

function getStarSize(star: Star, z: number): number {
  // 增大基础尺寸，让头像更清晰可见
  const baseSize = star.isSelf ? 20 : 12 + Math.min(star.currentStreak * 0.2, 8)
  const scale = (z + sphereRadius) / (sphereRadius * 2)
  return Math.max(8, baseSize * (0.5 + scale * 0.5))
}

function handleBoost() {
  if (selectedStar.value && !selectedStar.value.isSelf) {
    emit('boost', selectedStar.value)
  }
}

function handleMessage() {
  if (selectedStar.value && !selectedStar.value.isSelf) {
    emit('message', selectedStar.value)
  }
}

// 监听数据变化，预加载头像
watch(() => props.stars, (newStars) => {
  // 预加载头像图片
  if (newStars && newStars.length > 0) {
    preloadAvatars(newStars)
  }
}, { deep: true, immediate: true })
</script>

<style scoped>
.starfield-3d-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0d1b2a 100%);
  overflow: hidden;
}

.starfield-canvas {
  position: absolute;
  inset: 0;
  cursor: grab;
}

.starfield-canvas:active {
  cursor: grabbing;
}

/* 选中用户信息卡片 - 横向布局 */
.star-info-card {
  position: absolute;
  transform: translate(0, -50%);
  display: flex;
  align-items: stretch;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(10, 10, 26, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 20px;
  z-index: 100;
  pointer-events: auto;
  min-width: 320px;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(212, 175, 55, 0.1);
}

/* 关闭按钮 */
.card-close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(245, 230, 211, 0.1);
  border: none;
  border-radius: 50%;
  color: rgba(245, 230, 211, 0.5);
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-close-btn:hover {
  background: rgba(245, 230, 211, 0.2);
  color: #f5e6d3;
}

/* 左侧头像区域 */
.card-avatar-section {
  position: relative;
  flex-shrink: 0;
}

.star-avatar {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #0a0a1a;
  font-size: 22px;
  font-weight: 700;
  overflow: hidden;
  border: 2px solid rgba(212, 175, 55, 0.5);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* 打卡状态徽章 */
.status-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(100, 100, 100, 0.9);
  border: 2px solid rgba(10, 10, 26, 0.9);
  border-radius: 50%;
  color: rgba(245, 230, 211, 0.6);
}

.status-badge.checked-in {
  background: linear-gradient(135deg, #4ECDC4 0%, #2EAD9E 100%);
  color: #fff;
}

/* 中间信息区域 */
.card-info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  min-width: 0;
}

.star-name {
  font-size: 16px;
  font-weight: 800;
  color: #f5e6d3;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 统计数据行 */
.star-stats-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: rgba(212, 175, 55, 0.15);
  border-radius: 12px;
  font-size: 11px;
  color: #D4AF37;
}

.stat-chip svg {
  stroke: #D4AF37;
  flex-shrink: 0;
}

/* 打卡状态文字 */
.star-status-text {
  font-size: 11px;
  color: rgba(245, 230, 211, 0.4);
  display: flex;
  align-items: center;
  gap: 4px;
}

.star-status-text.checked-in {
  color: #4ECDC4;
}

/* 右侧操作按钮区域 */
.card-actions-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.action-btn svg {
  flex-shrink: 0;
}

.action-btn.boost-btn {
  background: linear-gradient(135deg, #A83232 0%, #8A2525 100%);
  color: #f5e6d3;
}

.action-btn.boost-btn svg {
  stroke: #f5e6d3;
}

.action-btn.boost-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(168, 50, 50, 0.4);
}

.action-btn.message-btn {
  background: rgba(212, 175, 55, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.4);
  color: #D4AF37;
}

.action-btn.message-btn svg {
  stroke: #D4AF37;
}

.action-btn.message-btn:hover {
  background: rgba(212, 175, 55, 0.3);
  transform: scale(1.05);
}

/* 自己的标识 */
.self-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.1) 100%);
  border: 1px solid rgba(212, 175, 55, 0.5);
  border-radius: 12px;
  color: #D4AF37;
  font-size: 13px;
  font-weight: 700;
}

.self-badge svg {
  stroke: #D4AF37;
}

/* 卡片动画 */
.card-fade-enter-active,
.card-fade-leave-active {
  transition: all 0.3s ease;
}

.card-fade-enter-from,
.card-fade-leave-to {
  opacity: 0;
  transform: translate(0, -50%) scale(0.95);
}

/* 统计信息 */
.starfield-stats {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 24px;
  padding: 12px 24px;
  background: rgba(10, 10, 26, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: 18px;
  font-weight: 900;
  color: #D4AF37;
}

.stat-label {
  font-size: 10px;
  color: rgba(245, 230, 211, 0.5);
}

/* 操作提示 */
.interaction-hint {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: rgba(10, 10, 26, 0.6);
  border-radius: 20px;
  font-size: 11px;
  color: rgba(245, 230, 211, 0.5);
}

.interaction-hint svg {
  stroke: #D4AF37;
  flex-shrink: 0;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
