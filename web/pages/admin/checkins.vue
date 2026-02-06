<template>
  <div class="space-y-6">
    <section class="rounded-xl border border-ink/10 bg-white/70 p-6 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-bold">打卡记录</h2>
          <p class="text-sm text-ink/60">查看用户答题与识别结果，支持筛选与分页。</p>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-3">
        <input v-model="filters.q" type="text" placeholder="搜索问题/回答/手机号/昵称" class="input-base w-full md:w-80" />
        <input v-model="filters.userId" type="text" placeholder="userId（可选）" class="input-base w-full md:w-64" />
        <input v-model="filters.dimensionId" type="number" min="1" max="7" placeholder="维度" class="input-base w-24" />
        <input v-model="filters.subItemId" type="number" min="1" max="7" placeholder="子项" class="input-base w-24" />
        <select v-model="filters.inputType" class="input-base w-40">
          <option value="">输入类型</option>
          <option value="TEXT">TEXT</option>
          <option value="AUDIO_TEXT">AUDIO_TEXT</option>
        </select>
        <select v-model="filters.isValid" class="input-base w-40">
          <option value="">全部</option>
          <option value="true">仅有效</option>
          <option value="false">仅无效</option>
        </select>
        <input v-model="filters.from" type="text" placeholder="from（ISO，可选）" class="input-base w-full md:w-56" />
        <input v-model="filters.to" type="text" placeholder="to（ISO，可选）" class="input-base w-full md:w-56" />
        <button class="btn-secondary" @click="applyFilters" :disabled="loading">查询</button>
      </div>

      <div v-if="loading" class="mt-4 text-sm text-ink/60">加载中...</div>

      <div v-else class="mt-6 overflow-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="text-xs uppercase text-ink/60">
            <tr>
              <th class="py-2">时间</th>
              <th class="py-2">用户</th>
              <th class="py-2">问题</th>
              <th class="py-2">回答</th>
              <th class="py-2">维度/子项</th>
              <th class="py-2">输入</th>
              <th class="py-2">指标/得分</th>
              <th class="py-2">有效</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id" class="border-t border-ink/10">
              <td class="py-2 text-xs text-ink/60">{{ formatTime(row.createdAt) }}</td>
              <td class="py-2">
                <div class="font-semibold">{{ row.userNickname || '—' }}</div>
                <div class="text-xs text-ink/60">{{ row.userPhone || row.userId }}</div>
              </td>
              <td class="py-2 max-w-[360px] truncate">{{ row.question || '—' }}</td>
              <td class="py-2 max-w-[360px] truncate">{{ row.answerText || '—' }}</td>
              <td class="py-2 text-xs text-ink/70">{{ row.dimensionId ?? '—' }}/{{ row.subItemId ?? '—' }}</td>
              <td class="py-2 text-xs text-ink/70">{{ row.inputType || '—' }}</td>
              <td class="py-2 text-xs">
                <div>{{ row.metricName || '—' }}</div>
                <div class="text-ink/60">{{ row.score ?? '—' }}</div>
              </td>
              <td class="py-2">
                <span :class="row.isValid ? 'text-green-700' : 'text-red-700'">
                  {{ row.isValid ? '是' : '否' }}
                </span>
              </td>
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

const route = useRoute()

const filters = reactive({
  q: '',
  userId: '',
  dimensionId: '' as any,
  subItemId: '' as any,
  inputType: '',
  from: '',
  to: '',
  isValid: ''
})

const rows = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const limit = 50
const offset = ref(0)

const load = async () => {
  loading.value = true
  const result = await $fetch('/api/admin/checkins', {
    query: {
      q: filters.q || undefined,
      userId: filters.userId || undefined,
      dimensionId: filters.dimensionId || undefined,
      subItemId: filters.subItemId || undefined,
      inputType: filters.inputType || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      isValid: filters.isValid || undefined,
      limit,
      offset: offset.value
    }
  }) as any
  if (result?.success) {
    rows.value = result.data.logs || []
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

onMounted(() => {
  const q = route.query.q
  const userId = route.query.userId
  if (typeof q === 'string') filters.q = q
  if (typeof userId === 'string') filters.userId = userId
  load()
})
</script>
