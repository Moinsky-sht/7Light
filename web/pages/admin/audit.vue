<template>
  <div class="space-y-6">
    <section class="rounded-xl border border-ink/10 bg-white/70 p-6 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-bold">审计日志</h2>
          <p class="text-sm text-ink/60">记录后台关键操作，便于追踪与排障。</p>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-3">
        <input v-model="filters.q" type="text" placeholder="搜索 action/entity/操作者/详情" class="input-base w-full md:w-96" />
        <input v-model="filters.action" type="text" placeholder="action（可选）" class="input-base w-full md:w-56" />
        <input v-model="filters.entityType" type="text" placeholder="entityType（可选）" class="input-base w-full md:w-40" />
        <button class="btn-secondary" @click="applyFilters" :disabled="loading">查询</button>
      </div>

      <div v-if="loading" class="mt-4 text-sm text-ink/60">加载中...</div>

      <div v-else class="mt-6 overflow-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="text-xs uppercase text-ink/60">
            <tr>
              <th class="py-2">时间</th>
              <th class="py-2">操作者</th>
              <th class="py-2">动作</th>
              <th class="py-2">对象</th>
              <th class="py-2">IP</th>
              <th class="py-2">详情</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="row in rows" :key="row.id">
              <tr class="border-t border-ink/10">
                <td class="py-2 text-xs text-ink/60">{{ formatTime(row.createdAt) }}</td>
                <td class="py-2">
                  <div class="font-semibold">{{ row.actorNickname || '—' }}</div>
                  <div class="text-xs text-ink/60">{{ row.actorPhone || row.actorUserId || '—' }}</div>
                </td>
                <td class="py-2 font-mono text-xs">{{ row.action }}</td>
                <td class="py-2 text-xs">
                  <div class="font-semibold">{{ row.entityType }}</div>
                  <div class="text-ink/60">{{ row.entityId || '—' }}</div>
                </td>
                <td class="py-2 text-xs text-ink/60">{{ row.ip || '—' }}</td>
                <td class="py-2">
                  <button class="text-cinnabar text-xs hover:underline" @click="toggleDetail(row)">
                    {{ expandedId === row.id ? '收起' : '查看' }}
                  </button>
                </td>
              </tr>
              <tr v-if="expandedId === row.id" class="border-b border-ink/10 bg-parchment-light">
                <td colspan="6" class="py-3">
                  <pre class="whitespace-pre-wrap break-words rounded-lg bg-white/80 p-3 text-xs text-ink/80">{{ prettyDetail(row.detail) }}</pre>
                </td>
              </tr>
            </template>
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
  action: '',
  entityType: ''
})

const rows = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const limit = 50
const offset = ref(0)
const expandedId = ref<string | null>(null)

const load = async () => {
  loading.value = true
  const result = await $fetch('/api/admin/audit', {
    query: {
      q: filters.q || undefined,
      action: filters.action || undefined,
      entityType: filters.entityType || undefined,
      limit,
      offset: offset.value
    }
  }) as any
  if (result?.success) {
    rows.value = result.data.logs || []
    total.value = result.data.total || 0
    if (expandedId.value && !rows.value.find(r => r.id === expandedId.value)) {
      expandedId.value = null
    }
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

const toggleDetail = (row: any) => {
  expandedId.value = expandedId.value === row.id ? null : row.id
}

const prettyDetail = (val: any) => {
  if (!val) return ''
  try {
    const json = typeof val === 'string' ? JSON.parse(val) : val
    return JSON.stringify(json, null, 2)
  } catch {
    return String(val)
  }
}

const formatTime = (val: string | null) => {
  if (!val) return '—'
  const date = new Date(val)
  if (Number.isNaN(date.getTime())) return val
  return date.toLocaleString('zh-CN')
}

onMounted(load)
</script>
