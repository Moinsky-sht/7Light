<template>
  <div class="space-y-6">
    <section class="rounded-xl border border-ink/10 bg-white/70 p-6 shadow-sm">
      <h2 class="text-lg font-bold">运行概览</h2>
      <p class="mt-1 text-sm text-ink/70">本地后台可用于配置 AI Key、提示词与用户权限。</p>
      <div class="mt-6 grid gap-4 md:grid-cols-4">
        <div class="rounded-lg border border-ink/10 bg-parchment-light p-4">
          <div class="text-xs text-ink/60">用户数量</div>
          <div class="mt-2 text-2xl font-bold">{{ stats.users }}</div>
        </div>
        <div class="rounded-lg border border-ink/10 bg-parchment-light p-4">
          <div class="text-xs text-ink/60">提示词模板</div>
          <div class="mt-2 text-2xl font-bold">{{ stats.prompts }}</div>
        </div>
        <div class="rounded-lg border border-ink/10 bg-parchment-light p-4">
          <div class="text-xs text-ink/60">AI 提供商</div>
          <div class="mt-2 text-2xl font-bold">{{ stats.providers }}</div>
        </div>
        <div class="rounded-lg border border-ink/10 bg-parchment-light p-4">
          <div class="text-xs text-ink/60">已启用</div>
          <div class="mt-2 text-2xl font-bold">{{ stats.providersEnabled }}</div>
        </div>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <NuxtLink to="/admin/settings" class="rounded-xl border border-ink/10 bg-white/70 p-5 shadow-sm hover:bg-white">
        <h3 class="text-base font-bold">系统设置</h3>
        <p class="mt-2 text-sm text-ink/70">配置 AI Base URL、模型、Key 与超时策略。</p>
      </NuxtLink>
      <NuxtLink to="/admin/prompts" class="rounded-xl border border-ink/10 bg-white/70 p-5 shadow-sm hover:bg-white">
        <h3 class="text-base font-bold">提示词管理</h3>
        <p class="mt-2 text-sm text-ink/70">创建、过滤、更新各维度提示词。</p>
      </NuxtLink>
      <NuxtLink to="/admin/users" class="rounded-xl border border-ink/10 bg-white/70 p-5 shadow-sm hover:bg-white">
        <h3 class="text-base font-bold">用户管理</h3>
        <p class="mt-2 text-sm text-ink/70">查看用户并分配管理员权限。</p>
      </NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

const stats = reactive({
  users: 0,
  prompts: 0,
  providers: 0,
  providersEnabled: 0
})

onMounted(async () => {
  const result = await $fetch('/api/admin/stats') as any
  if (result?.success) {
    Object.assign(stats, result.data)
  }
})
</script>
