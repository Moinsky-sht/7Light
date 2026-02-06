<template>
  <div class="lotus-lamp-container" :style="{ width: size, height: size }">
    <!-- 外部光晕 (CSS实现，无滤镜) -->
    <div v-if="isLit" 
         class="external-glow"
         :style="{ width: glowSize, height: glowSize, opacity: glowIntensity }">
    </div>

    <svg 
      class="lotus-svg" 
      viewBox="0 0 100 120"
      :class="{ 'is-lit': isLit }"
    >
      <defs>
        <!-- 莲花渐变 -->
        <linearGradient id="petalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffb6c1;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#ff69b4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#dc143c;stop-opacity:1" />
        </linearGradient>
        
        <!-- 内层花瓣渐变 -->
        <linearGradient id="innerPetalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#fff0f5;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#ffb6c1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ff69b4;stop-opacity:1" />
        </linearGradient>

        <!-- 火焰渐变 -->
        <radialGradient id="lotusFlameCore" cx="50%" cy="80%" fx="50%" fy="80%" r="80%">
          <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
          <stop offset="15%" style="stop-color:#ffeb3b;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#ff9800;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:#ff5722;stop-opacity:0" />
        </radialGradient>
      </defs>

      <!-- 莲叶基底 -->
      <ellipse cx="50" cy="105" rx="35" ry="10" fill="#1a4a3f" opacity="0.7" />
      <ellipse cx="50" cy="103" rx="30" ry="8" fill="#3d8b70" opacity="0.5" />

      <!-- 外层花瓣 -->
      <g class="petal-group outer">
        <path class="petal outer-petal" d="M50 85 Q 20 70 25 50 Q 35 60 50 65 Z" fill="url(#petalGradient)" />
        <path class="petal outer-petal" d="M50 85 Q 80 70 75 50 Q 65 60 50 65 Z" fill="url(#petalGradient)" />
        <path class="petal outer-petal" d="M50 85 Q 10 85 15 60 Q 30 70 50 75 Z" fill="url(#petalGradient)" />
        <path class="petal outer-petal" d="M50 85 Q 90 85 85 60 Q 70 70 50 75 Z" fill="url(#petalGradient)" />
      </g>

      <!-- 内层花瓣 -->
      <g class="petal-group inner">
        <path class="petal inner-petal" d="M50 75 Q 30 60 35 45 Q 45 55 50 60 Z" fill="url(#innerPetalGradient)" />
        <path class="petal inner-petal" d="M50 75 Q 70 60 65 45 Q 55 55 50 60 Z" fill="url(#innerPetalGradient)" />
        <path class="petal inner-petal" d="M50 75 Q 40 55 45 40 Q 50 50 50 58 Z" fill="url(#innerPetalGradient)" />
        <path class="petal inner-petal" d="M50 75 Q 60 55 55 40 Q 50 50 50 58 Z" fill="url(#innerPetalGradient)" />
      </g>

      <!-- 灯芯 -->
      <ellipse cx="50" cy="65" rx="12" ry="5" fill="#a0522d" />
      <ellipse cx="50" cy="63" rx="10" ry="4" fill="#daa520" />
      <line x1="50" y1="63" x2="50" y2="50" stroke="#2c2c2c" stroke-width="2" />

      <!-- 火焰 -->
      <g v-if="isLit" class="flame-group">
        <path class="flame main" d="M50 50 Q 42 40 50 20 Q 58 40 50 50" fill="url(#lotusFlameCore)" />
        <ellipse class="flame core" cx="50" cy="47" rx="3" ry="5" fill="#fffacd" opacity="0.8" />
      </g>
      
      <!-- 未点亮状态 -->
      <circle v-else cx="50" cy="40" r="8" fill="#555" opacity="0.3" />
    </svg>
  </div>
</template>

<script setup>
defineProps({
  isLit: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: '100px'
  },
  glowSize: {
    type: String,
    default: '130px'
  },
  glowIntensity: {
    type: Number,
    default: 0.6
  }
})
</script>

<style scoped>
.lotus-lamp-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lotus-svg {
  width: 100%;
  height: 100%;
  transition: filter 0.5s ease;
}

.lotus-svg:not(.is-lit) {
  filter: grayscale(0.8) opacity(0.7);
}

/* 花瓣动画 */
.petal {
  transform-origin: 50px 80px;
  transition: transform 0.5s ease;
  will-change: transform;
}

.is-lit .outer-petal {
  animation: petalSway 5s ease-in-out infinite;
}

.is-lit .inner-petal {
  animation: petalSway 4s ease-in-out infinite reverse;
  transform-origin: 50px 70px;
}

@keyframes petalSway {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(0.5deg) scale(1.01); }
}

/* 火焰动画 */
.flame-group {
  transform-origin: 50px 50px;
  animation: flameFlicker 3s infinite alternate;
  will-change: transform, opacity;
}

.flame.main {
  animation: flameShape 0.2s infinite alternate;
  transform-origin: 50px 50px;
}

@keyframes flameFlicker {
  0%, 100% { transform: scale(1) rotate(-1deg); opacity: 0.9; }
  50% { transform: scale(1.05) rotate(1deg); opacity: 1; }
}

@keyframes flameShape {
  0% { transform: scaleX(0.95) skewX(1deg); }
  100% { transform: scaleX(1.05) skewX(-1deg); }
}

/* 外部光晕 - CSS实现，无滤镜 */
.external-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, rgba(255, 105, 180, 0.2) 40%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  animation: glowPulse 3s ease-in-out infinite;
  z-index: -1;
  will-change: transform, opacity;
}

@keyframes glowPulse {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1); 
    opacity: 0.5;
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.2); 
    opacity: 0.8;
  }
}
</style>