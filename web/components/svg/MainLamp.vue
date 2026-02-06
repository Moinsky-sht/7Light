<template>
  <div class="relative w-64 h-64 flex items-center justify-center">
    <!-- Glow Effect (Only visible when fully lit) -->
    <div 
      v-if="progress >= 3"
      class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-candle-red/30 rounded-full blur-3xl animate-pulse"
    ></div>

    <svg 
      viewBox="0 0 200 200" 
      class="w-full h-full relative z-10 drop-shadow-2xl"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <!-- Gradient for the Lamp Body -->
        <linearGradient id="lampGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#4a4a4a;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#2d2d2d;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
        </linearGradient>
        
        <!-- Gradient for the Flame -->
        <radialGradient id="flameGradient" cx="50%" cy="80%" r="80%">
          <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" /> <!-- golden-flame -->
          <stop offset="40%" style="stop-color:#FF8C00;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8A2BE2;stop-opacity:0" /> <!-- nebula-purple hint -->
        </radialGradient>

        <!-- Filter for Flame Blur -->
        <filter id="flameBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>
      </defs>

      <!-- Lamp Stand/Dish (Ancient Oil Lamp Style) -->
      <path 
        d="M40 140 Q100 180 160 140 L150 120 Q100 150 50 120 Z" 
        fill="url(#lampGradient)" 
        stroke="#1a1a1a"
        stroke-width="2"
      />
      <!-- Lamp Base -->
      <path
        d="M70 155 L70 170 Q100 180 130 170 L130 155"
        fill="#222"
      />

      <!-- Wick (The part that burns) -->
      <rect x="98" y="100" width="4" height="25" rx="1" fill="#111" />

      <!-- Flame Group -->
      <g 
        v-if="progress > 0"
        class="transition-all duration-1000 ease-in-out origin-bottom"
        :class="{
          'opacity-40 scale-50': progress === 1,
          'opacity-70 scale-75': progress === 2,
          'opacity-100 scale-100': progress >= 3
        }"
        style="transform-origin: 100px 105px;"
      >
        <!-- Inner Core -->
        <path 
          d="M100 105 Q85 80 100 40 Q115 80 100 105 Z" 
          fill="url(#flameGradient)"
          class="animate-flicker"
        />
        <!-- Outer Halo (for brightness) -->
        <circle cx="100" cy="80" r="15" fill="#FFD700" opacity="0.3" filter="url(#flameBlur)" class="animate-pulse-fast" />
      </g>
    </svg>
  </div>
</template>

<script setup>
defineProps({
  progress: {
    type: Number,
    default: 0, // 0: OFF, 1: WEAK, 2: MEDIUM, 3: FULL
    validator: (value) => [0, 1, 2, 3].includes(value)
  }
})
</script>

<style scoped>
@keyframes flicker {
  0% { transform: scale(1) skewX(0deg); opacity: 0.9; }
  25% { transform: scale(1.05) skewX(1deg); opacity: 1; }
  50% { transform: scale(0.95) skewX(-1deg); opacity: 0.8; }
  75% { transform: scale(1.02) skewX(0.5deg); opacity: 0.95; }
  100% { transform: scale(1) skewX(0deg); opacity: 0.9; }
}

.animate-flicker {
  animation: flicker 0.15s infinite alternate;
  transform-origin: center bottom;
}

.animate-pulse-fast {
  animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
