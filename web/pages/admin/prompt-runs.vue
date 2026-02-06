<template>
  <div class="space-y-6">
    <section class="rounded-xl border border-ink/10 bg-white/70 p-6 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-bold">提示词运行记录</h2>
          <p class="text-sm text-ink/60">用于排查 AI 调用效果、耗时与有效性。</p>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-3">
        <input v-model="filters.q" type="text" placeholder="搜索 请求ID/场景/手机号/内容片段" class="input-base w-full md:w-96" />
        <input v-model="filters.userId" type="text" placeholder="userId（可选）" class="input-base w-full md:w-64" />
        <input v-model="filters.templateId" type="text" placeholder="templateId（可选）" class="input-base w-full md:w-64" />
        <button class="btn-secondary" @click="applyFilters" :disabled="loading">查询</button>
      </div>

      <div v-if="loading" class="mt-4 text-sm text-ink/60">加载中...</div>

      <div v-else class="mt-6 overflow-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="text-xs uppercase text-ink/60">
            <tr>
              <th class="py-2">时间</th>
              <th class="py-2">用户</th>
              <th class="py-2">场景</th>
              <th class="py-2">耗时</th>
              <th class="py-2">有效</th>
              <th class="py-2">请求ID</th>
              <th class="py-2">模板标识</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id" class="border-t border-ink/10">
              <td class="py-2 text-xs text-ink/60">{{ formatTime(row.createdAt) }}</td>
              <td class="py-2">
                <div class="font-semibold">{{ row.userNickname || '—' }}</div>
                <div class="text-xs text-ink/60">{{ row.userPhone || row.userId || '—' }}</div>
              </td>
              <td class="py-2">
                <div class="text-xs font-semibold">{{ row.bundleName || row.type || '—' }}</div>
                <div class="font-mono text-[11px] text-ink/60">{{ row.bundleKey || '—' }}</div>
              </td>
              <td class="py-2 text-xs text-ink/60">{{ row.latencyMs ?? '—' }}ms</td>
              <td class="py-2">
                <span :class="row.isValid ? 'text-green-700' : 'text-red-700'">{{ row.isValid ? '是' : '否' }}</span>
              </td>
              <td class="py-2 font-mono text-xs max-w-[260px] truncate">{{ row.requestId || '—' }}</td>
              <td class="py-2 font-mono text-xs max-w-[260px] truncate">{{ row.templateId || row.bundleKey || '—' }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="!rows.length" class="mt-4 text-xs text-ink/60">暂无记录</div>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div class="text-ink/60">共 {{ total }} 条</div>
          <div class="flex items-center gap-2">
            <button class="btn-secondary" @click="prevPage" :disabled="offset === 0 || loading">上一页</button>
            <button class="btn-secondary" @click="nextPage" :disabled="offset + limit >= total || loading">下一页</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

const filters = reactive({
  q: '',
  userId: '',
  templateId: ''
})

const rows = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const limit = 50
const offset = ref(0)

const load = async () => {
  loading.value = true
  const result = await $fetch('/api/admin/prompt-runs', {
    query: {
      q: filters.q || undefined,
      userId: filters.userId || undefined,
      templateId: filters.templateId || undefined,
      limit,
      offset: offset.value
    }
  }) as any
  if (result?.success) {
    rows.value = result.data.runs || []
    total.value = result.data.total || 0
  }
  loading.value = false
}

const applyFilters = async () => {
  offset.value = 0
  await load()
}

const prevPage = async () => {
  offset.value = Math.max(0, offset.value - limit)
  await load()
}

const nextPage = async () => {
  offset.value = offset.value + limit
  await load()
}

const formatTime = (val: string | null) => {
  if (!val) return '—'
  const date = new Date(val)
  if (Number.isNaN(date.getTime())) return val
  return date.toLocaleString('zh-CN')
}

onMounted(load)
</script>
