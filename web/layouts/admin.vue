<template>
  <div class="min-h-screen bg-parchment text-ink">
    <div class="flex min-h-screen">
      <aside class="hidden w-64 shrink-0 border-r border-ink/10 bg-white/70 p-6 md:block">
        <div class="text-xl font-bold font-serif">七星灯后台</div>
        <nav class="mt-6 space-y-2">
          <NuxtLink :class="navClass('/admin')" to="/admin">概览</NuxtLink>
          <NuxtLink :class="navClass('/admin/settings')" to="/admin/settings">系统设置</NuxtLink>
          <NuxtLink :class="navClass('/admin/ai-prompts')" to="/admin/ai-prompts">AI提示词</NuxtLink>
          <NuxtLink :class="navClass('/admin/prompts')" to="/admin/prompts">问题模板库</NuxtLink>
          <NuxtLink :class="navClass('/admin/dimensions')" to="/admin/dimensions">维度管理</NuxtLink>
          <NuxtLink :class="navClass('/admin/users')" to="/admin/users">用户管理</NuxtLink>
          <NuxtLink :class="navClass('/admin/checkins')" to="/admin/checkins">打卡记录</NuxtLink>
          <NuxtLink :class="navClass('/admin/prompt-runs')" to="/admin/prompt-runs">运行记录</NuxtLink>
          <NuxtLink :class="navClass('/admin/audit')" to="/admin/audit">审计日志</NuxtLink>
        </nav>
      </aside>

      <div class="flex-1">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 bg-white/60 px-6 py-4">
          <div class="flex items-center gap-3">
            <button class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 md:hidden" @click="showMobileNav = !showMobileNav">
              <span class="material-symbols-outlined text-ink">menu</span>
            </button>
            <h1 class="text-lg font-bold font-serif">管理控制台</h1>
          </div>
          <div class="rounded-full bg-cinnabar px-3 py-1 text-xs font-bold text-white">ADMIN</div>
        </header>

        <transition name="fade">
          <div v-if="showMobileNav" class="border-b border-ink/10 bg-white/80 px-6 py-3 md:hidden">
            <nav class="grid gap-2">
              <NuxtLink :class="navClass('/admin')" to="/admin" @click="showMobileNav = false">概览</NuxtLink>
              <NuxtLink :class="navClass('/admin/settings')" to="/admin/settings" @click="showMobileNav = false">系统设置</NuxtLink>
              <NuxtLink :class="navClass('/admin/ai-prompts')" to="/admin/ai-prompts" @click="showMobileNav = false">AI提示词</NuxtLink>
              <NuxtLink :class="navClass('/admin/prompts')" to="/admin/prompts" @click="showMobileNav = false">问题模板库</NuxtLink>
              <NuxtLink :class="navClass('/admin/dimensions')" to="/admin/dimensions" @click="showMobileNav = false">维度管理</NuxtLink>
              <NuxtLink :class="navClass('/admin/users')" to="/admin/users" @click="showMobileNav = false">用户管理</NuxtLink>
              <NuxtLink :class="navClass('/admin/checkins')" to="/admin/checkins" @click="showMobileNav = false">打卡记录</NuxtLink>
              <NuxtLink :class="navClass('/admin/prompt-runs')" to="/admin/prompt-runs" @click="showMobileNav = false">运行记录</NuxtLink>
              <NuxtLink :class="navClass('/admin/audit')" to="/admin/audit" @click="showMobileNav = false">审计日志</NuxtLink>
            </nav>
          </div>
        </transition>

        <main class="px-6 py-6">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const route = useRoute()
const showMobileNav = ref(false)

const navClass = (path: string) => {
  const active = route.path === path
  return [
    'block rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
    active ? 'bg-ink text-white' : 'text-ink hover:bg-ink/10'
  ].join(' ')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
