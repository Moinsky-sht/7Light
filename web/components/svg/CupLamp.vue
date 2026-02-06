<template>
  <div class="cup-lamp-container">
    <svg class="cup-lamp-svg" viewBox="0 -40 200 280">
      <defs>
        <!-- 火焰渐变 -->
        <radialGradient id="flameGradOuter" cx="50%" cy="80%" r="50%" fx="50%" fy="90%">
          <stop offset="0%" stop-color="#FFFACD" stop-opacity="1"/>
          <stop offset="40%" stop-color="#FFD700" stop-opacity="0.9"/>
          <stop offset="70%" stop-color="#FF8C00" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#FF4500" stop-opacity="0"/>
        </radialGradient>
        
        <radialGradient id="flameGradInner" cx="50%" cy="70%" r="40%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1"/>
          <stop offset="60%" stop-color="#FFFACD" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#FFD700" stop-opacity="0"/>
        </radialGradient>
        
        <!-- 灯杯渐变 -->
        <linearGradient id="cupBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#4A3C2E"/>
          <stop offset="20%" stop-color="#6B5744"/>
          <stop offset="50%" stop-color="#8C735A"/>
          <stop offset="80%" stop-color="#6B5744"/>
          <stop offset="100%" stop-color="#4A3C2E"/>
        </linearGradient>
        
        <linearGradient id="cupRimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#D4AF37"/>
          <stop offset="50%" stop-color="#B8860B"/>
          <stop offset="100%" stop-color="#8B6914"/>
        </linearGradient>
        
        <!-- 油面渐变 -->
        <radialGradient id="oilGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFD700" stop-opacity="0.9"/>
          <stop offset="70%" stop-color="#DAA520" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="#B8860B" stop-opacity="0.5"/>
        </radialGradient>
        
        <!-- 发光滤镜 -->
        <filter id="flameGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        <!-- 装饰图案 -->
        <pattern id="decorPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="2" fill="#D4AF37" opacity="0.3"/>
        </pattern>
      </defs>
      
      <!-- 悬挂绳 -->
      <g class="hanging-cord">
        <path d="M100 0 Q95 10 100 20" fill="none" stroke="#8B4513" stroke-width="3" stroke-linecap="round"/>
        <path d="M100 0 Q105 10 100 20" fill="none" stroke="#654321" stroke-width="2" stroke-linecap="round"/>
      </g>
      
      <g transform="translate(0, -40)">
        <!-- 顶部装饰环 -->
        <g class="top-ring">
          <ellipse cx="100" cy="62" rx="35" ry="8" fill="url(#cupRimGrad)" stroke="#8B6914" stroke-width="1"/>
          <ellipse cx="100" cy="60" rx="32" ry="6" fill="#2C241B"/>
          <!-- 装饰珠 -->
          <circle cx="70" cy="62" r="4" fill="#D4AF37" filter="url(#softGlow)"/>
          <circle cx="130" cy="62" r="4" fill="#D4AF37" filter="url(#softGlow)"/>
        </g>
        
        <!-- 灯杯主体 -->
        <g class="cup-body">
          <!-- 外层轮廓 -->
          <path 
            d="M65 70 Q55 100 60 140 Q65 170 80 190 Q100 210 120 190 Q135 170 140 140 Q145 100 135 70 Z" 
            fill="url(#cupBodyGrad)" 
            stroke="#3E3328" 
            stroke-width="2"
          />
          <!-- 装饰纹理 -->
          <path 
            d="M70 80 Q60 110 65 145 Q70 175 85 192" 
            fill="none" 
            stroke="#D4AF37" 
            stroke-width="1" 
            opacity="0.4"
          />
          <path 
            d="M130 80 Q140 110 135 145 Q130 175 115 192" 
            fill="none" 
            stroke="#D4AF37" 
            stroke-width="1" 
            opacity="0.4"
          />
          <!-- 中间装饰带 -->
          <path 
            d="M68 120 Q100 130 132 120" 
            fill="none" 
            stroke="#D4AF37" 
            stroke-width="2" 
            opacity="0.6"
          />
          <path 
            d="M70 125 Q100 135 130 125" 
            fill="none" 
            stroke="#D4AF37" 
            stroke-width="1" 
            opacity="0.4"
          />
        </g>
        
        <!-- 油面 -->
        <ellipse cx="100" cy="85" rx="28" ry="10" fill="url(#oilGrad)" class="oil-surface"/>
        
        <!-- 灯芯 -->
        <g class="wick">
          <line x1="100" y1="85" x2="100" y2="68" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>
          <line x1="100" y1="85" x2="100" y2="70" stroke="#3a3a3a" stroke-width="1.5"/>
        </g>
        
        <!-- 火焰组 -->
        <g v-if="brightness > 0" class="flame-group" :style="{ opacity: flameOpacity }">
          <!-- 外层光晕 -->
          <ellipse 
            cx="100" :cy="55 - flameHeight * 0.3" 
            :rx="25 + flameHeight * 0.5" :ry="35 + flameHeight * 0.8"
            fill="url(#flameGradOuter)" 
            filter="url(#flameGlow)"
            class="flame-outer"
          />
          
          <!-- 主火焰 -->
          <path 
            :d="mainFlamePath"
            fill="#FFD700"
            class="flame-main"
          />
          
          <!-- 内焰 -->
          <path 
            :d="innerFlamePath"
            fill="url(#flameGradInner)"
            class="flame-inner"
          />
          
          <!-- 火焰尖端 -->
          <ellipse 
            cx="100" :cy="30 - flameHeight * 0.5" 
            rx="3" ry="8"
            fill="#FFFFFF"
            opacity="0.9"
            class="flame-tip"
          />
        </g>
        
        <!-- 底部装饰：香炉吊坠 -->
        <g class="bottom-decor">
          <ellipse cx="100" cy="195" rx="25" ry="6" fill="url(#cupRimGrad)" stroke="#8B6914" stroke-width="1"/>
          
          <!-- 连接链 -->
          <line x1="100" y1="201" x2="100" y2="215" stroke="#D4AF37" stroke-width="1.5"/>
          
          <!-- 小香炉造型 -->
          <g transform="translate(100, 222)">
            <!-- 炉身 -->
            <path d="M-8 0 Q-8 8 0 8 Q8 8 8 0" fill="#D4AF37" />
            <path d="M-8 0 L8 0" stroke="#8B6914" stroke-width="0.5" fill="none"/>
            <!-- 炉盖 -->
            <path d="M-6 0 Q0 -6 6 0" fill="#B8860B" />
            <!-- 烟气 -->
            <path d="M0 -4 Q2 -8 0 -12" stroke="#FFF" stroke-width="1" opacity="0.4" fill="none">
              <animate attributeName="d" values="M0 -4 Q2 -8 0 -12; M0 -4 Q-2 -8 0 -12; M0 -4 Q2 -8 0 -12" dur="3s" repeatCount="indefinite"/>
            </path>
          </g>
        </g>
        
        <!-- 流苏：改为更自然的丝线 -->
        <g class="tassels" transform="translate(0, -5)">
          <!-- 左侧流苏 -->
          <path d="M85 225 C85 240, 80 250, 75 265" fill="none" stroke="#A83232" stroke-width="1" opacity="0.8" class="tassel"/>
          <circle cx="75" cy="265" r="2" fill="#A83232"/>
          
          <!-- 中间流苏（主） -->
          <path d="M100 230 C100 250, 100 260, 100 280" fill="none" stroke="#A83232" stroke-width="1.5" class="tassel"/>
          <circle cx="100" cy="280" r="2.5" fill="#A83232"/>
          
          <!-- 右侧流苏 -->
          <path d="M115 225 C115 240, 120 250, 125 265" fill="none" stroke="#A83232" stroke-width="1" opacity="0.8" class="tassel"/>
          <circle cx="125" cy="265" r="2" fill="#A83232"/>
        </g>
      </g>
    </svg>
    
    <!-- 背景光晕 -->
    <div 
      v-if="brightness > 0" 
      class="lamp-glow"
      :style="{ opacity: brightness / 30 * 0.5 }"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  brightness: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 100
  }
})

const flameOpacity = computed(() => 0.3 + (props.brightness / 100) * 0.7)
const flameHeight = computed(() => props.brightness / 100 * 15)

const mainFlamePath = computed(() => {
  const h = flameHeight.value
  return `M100 75 
          Q85 ${60 - h} 90 ${40 - h} 
          Q95 ${25 - h * 1.2} 100 ${15 - h * 1.5} 
          Q105 ${25 - h * 1.2} 110 ${40 - h} 
          Q115 ${60 - h} 100 75 Z`
})

const innerFlamePath = computed(() => {
  const h = flameHeight.value * 0.7
  return `M100 72 
          Q90 ${58 - h} 93 ${42 - h} 
          Q97 ${30 - h} 100 ${22 - h} 
          Q103 ${30 - h} 107 ${42 - h} 
          Q110 ${58 - h} 100 72 Z`
})
</script>

<style scoped>
.cup-lamp-container {
  position: relative;
  width: 100%;
  max-width: 280px;
  aspect-ratio: 200 / 280;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cup-lamp-svg {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
}

/* 火焰动画 */
.flame-group {
  animation: flameBreath 2.5s ease-in-out infinite;
  transform-origin: 100px 75px;
}

.flame-outer {
  animation: flameFlicker 1.2s ease-in-out infinite alternate;
  transform-origin: center;
}

.flame-main {
  animation: flameWave 2s ease-in-out infinite;
  transform-origin: center bottom;
}

.flame-inner {
  animation: flameCore 1.5s ease-in-out infinite;
  transform-origin: center bottom;
}

.flame-tip {
  animation: flameTip 0.8s ease-in-out infinite;
  transform-origin: center;
}

@keyframes flameBreath {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.02); filter: brightness(1.1); }
}

@keyframes flameFlicker {
  0%, 100% { opacity: 0.5; transform: scale(1) translate(0, 0); }
  25% { opacity: 0.6; transform: scale(1.02) translate(0.5px, -1px); }
  50% { opacity: 0.5; transform: scale(0.98) translate(-0.5px, 0.5px); }
  75% { opacity: 0.6; transform: scale(1.01) translate(0.2px, -0.5px); }
}

@keyframes flameWave {
  0%, 100% { transform: scaleX(1) skewX(0deg); }
  25% { transform: scaleX(0.95) skewX(1deg); }
  50% { transform: scaleX(1.02) skewX(-0.5deg); }
  75% { transform: scaleX(0.98) skewX(0.5deg); }
}

@keyframes flameCore {
  0%, 100% { opacity: 0.9; transform: scale(1); }
  50% { opacity: 1; transform: scale(0.98); }
}

@keyframes flameTip {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.9; }
  50% { transform: translateY(-3px) scale(0.9); opacity: 1; }
}

/* 油面动画 */
.oil-surface {
  animation: oilShimmer 4s ease-in-out infinite;
}

@keyframes oilShimmer {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.9; }
}

/* 流苏动画 */
.tassel {
  animation: tasselSway 5s ease-in-out infinite;
  transform-origin: top center;
}

.tassel:nth-child(1) { animation-delay: 0s; }
.tassel:nth-child(2) { animation-delay: 0.5s; }
.tassel:nth-child(3) { animation-delay: 1s; }

@keyframes tasselSway {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(1deg); }
  75% { transform: rotate(-1deg); }
}

/* 背景光晕 */
.lamp-glow {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 165, 0, 0.4) 0%, rgba(255, 140, 0, 0.2) 40%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  animation: glowPulse 3s ease-in-out infinite;
  z-index: -1;
}

@keyframes glowPulse {
  0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.4; }
  50% { transform: translateX(-50%) scale(1.1); opacity: 0.6; }
}
</style>
