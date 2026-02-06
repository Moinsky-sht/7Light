<template>
  <div class="space-y-6">
    <section class="rounded-xl border border-ink/10 bg-white/70 p-6 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-bold">维度管理</h2>
          <p class="text-sm text-ink/60">管理 7 个维度与 7 个子项名称，供问题库与提示词上下文使用。</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button class="btn-secondary" @click="load" :disabled="loading">刷新</button>
          <button class="btn-primary" @click="save" :disabled="saving || loading">保存</button>
        </div>
      </div>

      <div v-if="loading" class="mt-6 text-sm text-ink/60">加载中...</div>

      <div v-else class="mt-6 space-y-4">
        <div v-for="d in dims" :key="d.id" class="rounded-xl border border-ink/10 bg-white/60 p-4">
          <div class="grid gap-4 md:grid-cols-5">
            <div>
              <label class="text-xs text-ink/60">ID</label>
              <div class="mt-2 text-sm font-semibold">{{ d.id }}</div>
            </div>
            <div>
              <label class="text-xs text-ink/60">Key</label>
              <input v-model="d.key" class="input-base mt-1" />
            </div>
            <div>
              <label class="text-xs text-ink/60">名称</label>
              <input v-model="d.name" class="input-base mt-1" />
            </div>
            <div>
              <label class="text-xs text-ink/60">标签</label>
              <input v-model="d.label" class="input-base mt-1" />
            </div>
            <div>
              <label class="text-xs text-ink/60">分类</label>
              <input v-model="d.category" class="input-base mt-1" />
            </div>
          </div>

          <div class="mt-4">
            <div class="text-sm font-bold">子项</div>
            <div class="mt-3 grid gap-3 md:grid-cols-4">
              <div v-for="s in d.subItems" :key="s.id" class="rounded-lg border border-ink/10 bg-parchment-light p-3">
                <div class="text-[11px] text-ink/60">子项 {{ s.subId }}</div>
                <input v-model="s.name" class="input-base mt-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

type Sub = { id: string; dimensionId: number; subId: number; name: string; sortOrder: number; updatedAt: string | null }
type Dim = { id: number; key: string; name: string; label: string; category: string; sortOrder: number; updatedAt: string | null; subItems: Sub[] }

const dims = ref<Dim[]>([])
const loading = ref(false)
const saving = ref(false)

const load = async () => {
  loading.value = true
  const result = await $fetch('/api/admin/dimensions') as any
  if (result?.success) {
    dims.value = result.data.dimensions || []
    dims.value.forEach((d) => {
      d.subItems = (d.subItems || []).sort((a, b) => a.subId - b.subId)
    })
  }
  loading.value = false
}

const save = async () => {
  saving.value = true
  const payload = {
    dimensions: dims.value.map((d) => ({
      id: d.id,
      key: d.key,
      name: d.name,
      label: d.label,
      category: d.category,
      sortOrder: d.sortOrder,
      subItems: (d.subItems || []).map((s) => ({ subId: s.subId, name: s.name, sortOrder: s.sortOrder }))
    }))
  }
  const result = await $fetch('/api/admin/dimensions', { method: 'POST', body: payload }) as any
  if (!result?.success) alert(result?.message || '保存失败')
  await load()
  saving.value = false
}

onMounted(load)
</script>

