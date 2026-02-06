<template>
  <div class="relative w-full max-w-sm aspect-[3/4] flex items-center justify-center -mt-8">
    <svg class="w-64 h-auto drop-shadow-xl relative z-10 text-ink" viewBox="0 0 200 300">
      <defs>
        <radialGradient cx="50%" cy="50%" fx="50%" fy="50%" id="flameGradient" r="50%">
          <stop offset="0%" style="stop-color:#ff9d00;stop-opacity:0.9"></stop>
          <stop offset="70%" style="stop-color:#ff4d00;stop-opacity:0.4"></stop>
          <stop offset="100%" style="stop-color:#ff0000;stop-opacity:0"></stop>
        </radialGradient>
      </defs>
      
      <!-- Hanging Cord -->
      <line stroke="currentColor" stroke-width="2" x1="100" x2="100" y1="0" y2="40"></line>
      
      <!-- Top Cap -->
      <path d="M70 40 L130 40 L125 50 L75 50 Z" fill="#3E3328" stroke="currentColor" stroke-width="1"></path>
      
      <!-- Glass/Paper Shade -->
      <path d="M75 50 L 125 50 Q 140 100 125 150 L 75 150 Q 60 100 75 50 Z" fill="rgba(255,250,240, 0.7)" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
      
      <!-- Shade Details -->
      <path d="M100 50 L 100 150" opacity="0.4" stroke="currentColor" stroke-width="1"></path>
      <path d="M85 53 Q 75 100 85 147" opacity="0.3" stroke="currentColor" stroke-width="1"></path>
      <path d="M115 53 Q 125 100 115 147" opacity="0.3" stroke="currentColor" stroke-width="1"></path>
      
      <!-- Bottom Base -->
      <path d="M75 150 L125 150 L120 160 L80 160 Z" fill="#3E3328" stroke="currentColor" stroke-width="1"></path>
      
      <!-- Tassel/Cord -->
      <line stroke="#A83232" stroke-width="2" x1="100" x2="100" y1="160" y2="180"></line>
      <path d="M95 180 Q100 175 105 180 Q100 185 95 180" fill="none" stroke="#A83232" stroke-width="2"></path>
      <path d="M100 183 Q 90 220 85 260" fill="none" opacity="0.9" stroke="#A83232" stroke-width="1.5"></path>
      <path d="M100 183 L 100 270" fill="none" opacity="0.9" stroke="#A83232" stroke-width="1.5"></path>
      <path d="M100 183 Q 110 220 115 260" fill="none" opacity="0.9" stroke="#A83232" stroke-width="1.5"></path>
      
      <!-- Flame (Animated) -->
      <circle class="animate-breathe" cx="100" cy="100" fill="url(#flameGradient)" r="25" style="mix-blend-mode: multiply;"></circle>
    </svg>
  </div>
</template>
