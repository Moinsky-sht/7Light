<template>
  <div class="h-screen bg-parchment text-ink font-serif relative flex justify-center overflow-hidden selection:bg-cinnabar selection:text-white">
    <!-- Background Texture -->
    <div class="absolute inset-0 pointer-events-none bg-paper-texture mix-blend-multiply opacity-60 z-0"></div>

    <!-- 外部全屏按钮 -->
    <button
      v-if="canFullscreen"
      type="button"
      class="fixed top-8 right-8 z-50 inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/90 backdrop-blur border border-paper-border text-ink shadow-lg hover:bg-white active:scale-95 transition-all duration-300 group"
      :title="isFullscreen ? '退出全屏' : '进入全屏'"
      @click="toggleFullscreen"
    >
      <svg v-if="!isFullscreen" class="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
        <path d="M16 3h3a2 2 0 0 1 2 2v3"/>
        <path d="M8 21H5a2 2 0 0 1-2-2v-3"/>
        <path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
      </svg>
      <svg v-else class="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
      </svg>
    </button>
    
    <!-- Mobile Container -->
    <div class="w-full max-w-[480px] h-full relative z-10 shadow-2xl flex flex-col bg-parchment/50 backdrop-blur-[1px]">
      <!-- 内部滚动区域 -->
      <main class="flex-1 overflow-y-auto scroll-smooth overscroll-y-contain" :class="{ 'pb-[70px]': showBottomNav }">
        <slot />
      </main>
      
      <!-- 底部导航 (固定在容器底部) -->
      <BottomNav v-if="showBottomNav" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomNav from '~/components/ui/BottomNav.vue'

const route = useRoute()
const isFullscreen = ref(false)
const canFullscreen = ref(false)

const showBottomNav = computed(() => route.meta?.hideBottomNav !== true)

const syncFullscreenState = () => {
  if (!process.client) return
  isFullscreen.value = !!document.fullscreenElement
}

const toggleFullscreen = async () => {
  if (!process.client) return
  if (document.fullscreenElement) {
    await document.exitFullscreen()
    return
  }
  await document.documentElement.requestFullscreen()
}

onMounted(() => {
  if (!process.client) return
  canFullscreen.value = !!document.documentElement.requestFullscreen && document.fullscreenEnabled !== false
  syncFullscreenState()
  document.addEventListener('fullscreenchange', syncFullscreenState)
})

onBeforeUnmount(() => {
  if (!process.client) return
  document.removeEventListener('fullscreenchange', syncFullscreenState)
})
</script>

<style>
/* 隐藏滚动条但保留功能 */
main::-webkit-scrollbar {
  width: 4px;
}
main::-webkit-scrollbar-track {
  background: transparent;
}
main::-webkit-scrollbar-thumb {
  background: rgba(44, 36, 27, 0.1);
  border-radius: 4px;
}
main::-webkit-scrollbar-thumb:hover {
  background: rgba(44, 36, 27, 0.2);
}
</style>
