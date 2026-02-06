<template>
  <div class="relative flex items-center justify-center p-2 isolate">
    <svg 
      class="transition-all duration-700 ease-in-out" 
      :viewBox="viewBox" 
      :class="isLit ? 'text-imperial-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]' : 'text-ink-light/30 grayscale opacity-80'"
      :style="{ width: size, height: size }"
    >
      <defs>
        <linearGradient id="bronzeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#4a3b2a;stop-opacity:1" />
          <stop offset="30%" style="stop-color:#8e7050;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#bfa07a;stop-opacity:1" />
          <stop offset="70%" style="stop-color:#8e7050;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4a3b2a;stop-opacity:1" />
        </linearGradient>
        
        <radialGradient id="flameCore" cx="50%" cy="80%" fx="50%" fy="80%" r="80%">
             <stop offset="0%" style="stop-color:#fff;stop-opacity:1" />
             <stop offset="20%" style="stop-color:#ffeb3b;stop-opacity:1" />
             <stop offset="60%" style="stop-color:#ff9800;stop-opacity:0.8" />
             <stop offset="100%" style="stop-color:#ff5722;stop-opacity:0" />
        </radialGradient>
        
        <filter id="glassBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
        </filter>
      </defs>

      <!-- Base Pedestal (Ornate) -->
      <path d="M35 90 C 35 90, 45 85, 50 85 C 55 85, 65 90, 65 90 L 70 95 L 30 95 Z" fill="url(#bronzeGradient)" stroke="#2c241b" stroke-width="0.5"></path>
      
      <!-- Main Stem/Grip -->
      <path d="M45 85 Q 42 70 45 60 L 55 60 Q 58 70 55 85 Z" fill="url(#bronzeGradient)" stroke="#2c241b" stroke-width="0.5"></path>

      <!-- Lotus Base for Glass -->
      <path d="M30 60 Q 25 55 35 55 L 65 55 Q 75 55 70 60 Q 50 65 30 60" fill="url(#bronzeGradient)" stroke="#2c241b" stroke-width="0.5"></path>

      <!-- Glass/Lotus Cup Shape -->
      <path d="M35 55 Q 30 35 35 25 Q 50 20 65 25 Q 70 35 65 55 Z" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"></path>
      
      <!-- Wick -->
      <line x1="50" y1="55" x2="50" y2="45" stroke="#1a1a1a" stroke-width="2"></line>

      <!-- Flame (Complex Flicker) -->
      <g v-if="isLit" class="animate-candle-flicker origin-bottom" style="transform-origin: 50% 45px;">
           <!-- Outer Halo -->
           <circle cx="50" cy="35" r="18" fill="url(#flameCore)" opacity="0.4" filter="url(#glassBlur)" class="animate-pulse-fast"></circle>
           <!-- Main Flame shape -->
           <path d="M50 45 Q 40 35 50 15 Q 60 35 50 45" fill="url(#flameCore)"></path>
           <!-- Inner Blue Core -->
           <ellipse cx="50" cy="42" rx="3" ry="6" fill="#03a9f4" opacity="0.6" filter="url(#glassBlur)"></ellipse>
      </g>
    </svg>
    
    <!-- Environmental Glow (Pulsing) -->
    <div v-if="isLit" 
         class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen pointer-events-none z-[-1] animate-glow-pulse"
         :style="{ 
            width: glowSize, 
            height: glowSize,
            background: 'radial-gradient(circle, rgba(255,160,0,0.6) 0%, rgba(255,87,34,0.2) 60%, transparent 100%)',
            filter: 'blur(15px)'
         }">
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
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
    default: '120px'
  }
})

const viewBox = "0 0 100 100"
</script>

<style scoped>
.animate-candle-flicker {
  animation: flicker 3s infinite alternate;
}
.animate-pulse-fast {
  animation: pulse-fast 0.1s infinite alternate;
}
.animate-glow-pulse {
  animation: glow-pulse 2s infinite alternate;
}

@keyframes flicker {
  0%, 100% { transform: scale(1) rotate(-2deg); opacity: 0.9; }
  25% { transform: scale(1.05) rotate(2deg); opacity: 1; }
  50% { transform: scale(0.95) rotate(-1deg); opacity: 0.8; }
  75% { transform: scale(1.02) rotate(1deg); opacity: 0.95; }
}

@keyframes pulse-fast {
  0% { transform: scale(0.98); opacity: 0.3; }
  100% { transform: scale(1.02); opacity: 0.5; }
}

@keyframes glow-pulse {
  0% { opacity: 0.6; transform: translate(-50%, -50%) scale(0.9); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
}
</style>
