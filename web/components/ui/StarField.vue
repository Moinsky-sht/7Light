<template>
  <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-void">
    <div ref="container" class="absolute inset-0"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import gsap from 'gsap'

const container = ref(null)

onMounted(() => {
  const count = 100
  const w = window.innerWidth
  const h = window.innerHeight
  
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div')
    star.className = 'absolute rounded-full bg-white transition-opacity'
    
    // Random size
    const size = Math.random() * 2
    star.style.width = `${size}px`
    star.style.height = `${size}px`
    
    // Random position
    const x = Math.random() * w
    const y = Math.random() * h
    star.style.left = `${x}px`
    star.style.top = `${y}px`
    
    // Random opacity for twinkling
    star.style.opacity = Math.random()
    
    container.value.appendChild(star)
    
    // Animate
    gsap.to(star, {
      opacity: Math.random(),
      duration: 1 + Math.random() * 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    })
  }
})
</script>
