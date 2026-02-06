<template>
  <div class="relative flex items-center justify-center isolate" :style="{ width: size, height: size }">
    <!-- Water Reflection (Below Lantern) -->
    <div v-if="isLit" 
         class="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/3 pointer-events-none z-[-1]"
         :style="{
           background: 'radial-gradient(ellipse at 50% 0%, rgba(255,180,120,0.4) 0%, rgba(255,100,50,0.1) 50%, transparent 80%)',
           filter: 'blur(8px)',
           transform: 'scaleY(0.5) translateX(-50%)',
           animation: 'water-shimmer 3s ease-in-out infinite'
         }">
    </div>

    <svg 
      class="transition-all duration-700 ease-in-out w-full h-full" 
      viewBox="0 0 100 120"
      :class="isLit ? 'drop-shadow-[0_0_20px_rgba(255,150,100,0.6)]' : 'grayscale opacity-60'"
    >
      <defs>
        <!-- Lotus Petal Gradient (Pink/Red) -->
        <linearGradient id="petalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffb6c1;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#ff69b4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#dc143c;stop-opacity:1" />
        </linearGradient>
        
        <!-- Inner Petal (Lighter) -->
        <linearGradient id="innerPetalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#fff0f5;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#ffb6c1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ff69b4;stop-opacity:1" />
        </linearGradient>

        <!-- Flame Gradient -->
        <radialGradient id="lotusFlameCore" cx="50%" cy="80%" fx="50%" fy="80%" r="80%">
          <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
          <stop offset="15%" style="stop-color:#ffeb3b;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#ff9800;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:#ff5722;stop-opacity:0" />
        </radialGradient>

        <!-- Glow Filter -->
        <filter id="lotusGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <!-- Water Base Gradient -->
        <linearGradient id="waterBaseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#2a6f5d;stop-opacity:0.6" />
          <stop offset="100%" style="stop-color:#1a4a3f;stop-opacity:0.8" />
        </linearGradient>
      </defs>

      <!-- Floating Base (Lily Pad / Water Circle) -->
      <ellipse cx="50" cy="105" rx="35" ry="10" fill="url(#waterBaseGradient)" opacity="0.7" />
      <ellipse cx="50" cy="103" rx="30" ry="8" fill="#3d8b70" opacity="0.5" />

      <!-- Outer Lotus Petals (Back Layer) -->
      <g class="origin-center" style="transform-origin: 50px 80px;">
        <path d="M50 85 Q 20 70 25 50 Q 35 60 50 65 Z" fill="url(#petalGradient)" opacity="0.9" />
        <path d="M50 85 Q 80 70 75 50 Q 65 60 50 65 Z" fill="url(#petalGradient)" opacity="0.9" />
        <path d="M50 85 Q 10 85 15 60 Q 30 70 50 75 Z" fill="url(#petalGradient)" opacity="0.85" />
        <path d="M50 85 Q 90 85 85 60 Q 70 70 50 75 Z" fill="url(#petalGradient)" opacity="0.85" />
      </g>

      <!-- Inner Lotus Petals (Front Layer) -->
      <g class="origin-center" style="transform-origin: 50px 70px;">
        <path d="M50 75 Q 30 60 35 45 Q 45 55 50 60 Z" fill="url(#innerPetalGradient)" />
        <path d="M50 75 Q 70 60 65 45 Q 55 55 50 60 Z" fill="url(#innerPetalGradient)" />
        <path d="M50 75 Q 40 55 45 40 Q 50 50 50 58 Z" fill="url(#innerPetalGradient)" opacity="0.9" />
        <path d="M50 75 Q 60 55 55 40 Q 50 50 50 58 Z" fill="url(#innerPetalGradient)" opacity="0.9" />
      </g>

      <!-- Center (Candle Platform) -->
      <ellipse cx="50" cy="65" rx="12" ry="5" fill="#a0522d" />
      <ellipse cx="50" cy="63" rx="10" ry="4" fill="#daa520" />
      
      <!-- Wick -->
      <line x1="50" y1="63" x2="50" y2="50" stroke="#2c2c2c" stroke-width="2" />

      <!-- Flame (When Lit) -->
      <g v-if="isLit" class="animate-lotus-flicker" style="transform-origin: 50px 50px;">
        <!-- Outer Halo -->
        <circle cx="50" cy="40" r="15" fill="url(#lotusFlameCore)" opacity="0.5" filter="url(#lotusGlow)" class="animate-pulse-glow" />
        <!-- Main Flame -->
        <path d="M50 50 Q 42 40 50 20 Q 58 40 50 50" fill="url(#lotusFlameCore)" />
        <!-- Inner Core -->
        <ellipse cx="50" cy="47" rx="3" ry="5" fill="#fffacd" opacity="0.8" />
      </g>

      <!-- Unlit State Indicator -->
      <g v-if="!isLit">
        <circle cx="50" cy="40" r="8" fill="#555" opacity="0.3" />
      </g>
    </svg>
    
    <!-- Environmental Glow (Pulsing) -->
    <div v-if="isLit" 
         class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen pointer-events-none z-[-1] animate-lotus-glow-pulse"
         :style="{ 
            width: glowSize, 
            height: glowSize,
            background: 'radial-gradient(circle, rgba(255,180,100,0.6) 0%, rgba(255,100,50,0.2) 50%, transparent 100%)',
            filter: 'blur(20px)'
         }">
    </div>
  </div>
</template>

<script setup>
defineProps({
  isLit: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: '100px'
  },
  glowSize: {
    type: String,
    default: '130px'
  }
})
</script>

<style scoped>
.animate-lotus-flicker {
  animation: lotus-flicker 2.5s infinite alternate;
}
.animate-pulse-glow {
  animation: pulse-glow 0.8s infinite alternate;
}
.animate-lotus-glow-pulse {
  animation: lotus-glow-pulse 2.5s infinite alternate;
}

@keyframes lotus-flicker {
  0%, 100% { transform: scale(1) rotate(-1.5deg); opacity: 0.9; }
  20% { transform: scale(1.08) rotate(1deg); opacity: 1; }
  40% { transform: scale(0.95) rotate(-0.5deg); opacity: 0.85; }
  60% { transform: scale(1.03) rotate(1.5deg); opacity: 0.95; }
  80% { transform: scale(0.98) rotate(-1deg); opacity: 0.9; }
}

@keyframes pulse-glow {
  0% { transform: scale(0.95); opacity: 0.4; }
  100% { transform: scale(1.08); opacity: 0.6; }
}

@keyframes lotus-glow-pulse {
  0% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.85); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
}

@keyframes water-shimmer {
  0%, 100% { opacity: 0.3; transform: scaleY(0.5) translateX(-50%) scaleX(0.95); }
  50% { opacity: 0.5; transform: scaleY(0.6) translateX(-50%) scaleX(1.05); }
}
</style>
