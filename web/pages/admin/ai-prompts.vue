<template>
  <div class="space-y-6">
    <section class="rounded-xl border border-ink/10 bg-white/70 p-6 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-bold">AI 提示词</h2>
          <p class="text-sm text-ink/60">合并后的提示词配置：系统提示词 + 用户提示词（可选）。</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button class="btn-secondary" @click="createNew">新增</button>
          <button class="btn-primary" :disabled="saving" @click="save">
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="mt-6 text-sm text-ink/60">加载中...</div>

      <div v-else class="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div class="rounded-lg border border-ink/10 bg-parchment-light p-3">
          <div class="mb-3 flex items-center justify-between">
            <div class="text-sm font-bold">列表</div>
            <div class="text-xs text-ink/60">{{ bundles.length }} 条</div>
          </div>
          <div class="space-y-2">
            <button
              v-for="b in bundles"
              :key="b.key"
              class="w-full rounded-lg border border-ink/10 bg-white/70 px-3 py-2 text-left text-sm transition hover:bg-white"
              :class="selectedKey === b.key ? 'ring-2 ring-cinnabar/20 border-cinnabar/30' : ''"
              @click="select(b)"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="font-semibold">{{ b.name }}</div>
                <span class="text-[11px]" :class="b.status === 'ACTIVE' ? 'text-green-700' : 'text-ink/60'">
                  {{ b.status === 'ACTIVE' ? '启用' : '草稿' }}
                </span>
              </div>
              <div class="mt-1 font-mono text-[11px] text-ink/60">{{ b.key }}</div>
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="text-xs text-ink/60">Key</label>
              <input v-model="form.key" class="input-base mt-1" placeholder="例如: PARSE" />
            </div>
            <div>
              <label class="text-xs text-ink/60">名称</label>
              <input v-model="form.name" class="input-base mt-1" placeholder="例如: 解析打卡回答" />
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <label class="text-xs text-ink/60">状态</label>
              <select v-model="form.status" class="input-base mt-1">
                <option value="ACTIVE">启用</option>
                <option value="DRAFT">草稿</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-ink/60">版本</label>
              <input v-model="form.version" class="input-base mt-1" placeholder="v1.0.0" />
            </div>
            <div>
              <label class="text-xs text-ink/60">更新时间</label>
              <div class="mt-2 text-sm text-ink/70">{{ selected?.updatedAt ? formatTime(selected.updatedAt) : '—' }}</div>
            </div>
          </div>

          <div>
            <label class="text-xs text-ink/60">系统提示词</label>
            <textarea v-model="form.systemTemplate" class="input-base mt-1 min-h-[220px] font-mono text-xs" />
          </div>

          <div>
            <label class="text-xs text-ink/60">用户提示词（可选）</label>
            <textarea v-model="form.userTemplate" class="input-base mt-1 min-h-[140px] font-mono text-xs" />
          </div>

          <div>
            <label class="text-xs text-ink/60">备注</label>
            <input v-model="form.notes" class="input-base mt-1" />
          </div>

          <div class="rounded-lg border border-ink/10 bg-parchment-light p-4 text-xs text-ink/70">
            <div class="font-semibold">可用变量（{{ }}）</div>
            <div class="mt-2 grid gap-1 md:grid-cols-2">
              <div>解析：expectedDimId / expectedSubId / dimName / subName / userProfileJson / question / answer</div>
              <div>生成问题：dimId / subId / dimName / subName / userProfileJson</div>
              <div>鼓励语：userName / streak / todayScore</div>
              <div>总结：dimId / dimName / userProfileJson / logsJson</div>
            </div>
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

type Bundle = {
  key: string
  name: string
  status: 'DRAFT' | 'ACTIVE'
  version: string
  systemTemplate: string | null
  userTemplate: string | null
  notes: string | null
  updatedAt: string | null
}

const bundles = ref<Bundle[]>([])
const loading = ref(false)
const saving = ref(false)
const selected = ref<Bundle | null>(null)
const selectedKey = ref<string | null>(null)

const form = reactive({
  key: '',
  name: '',
  status: 'ACTIVE',
  version: 'v1.0.0',
  systemTemplate: '',
  userTemplate: '',
  notes: ''
})

const load = async () => {
  loading.value = true
  const result = await $fetch('/api/admin/ai-prompts') as any
  if (result?.success) {
    bundles.value = result.data.bundles || []
    if (!selected.value && bundles.value.length) {
      select(bundles.value[0])
    }
  }
  loading.value = false
}

const select = (b: Bundle) => {
  selected.value = b
  selectedKey.value = b.key
  form.key = b.key
  form.name = b.name
  form.status = b.status
  form.version = b.version || 'v1.0.0'
  form.systemTemplate = b.systemTemplate || ''
  form.userTemplate = b.userTemplate || ''
  form.notes = b.notes || ''
}

const createNew = () => {
  selected.value = null
  selectedKey.value = null
  form.key = ''
  form.name = ''
  form.status = 'ACTIVE'
  form.version = 'v1.0.0'
  form.systemTemplate = ''
  form.userTemplate = ''
  form.notes = ''
}

const save = async () => {
  saving.value = true
  const payload = {
    key: form.key,
    name: form.name,
    status: form.status,
    version: form.version,
    systemTemplate: form.systemTemplate,
    userTemplate: form.userTemplate,
    notes: form.notes
  }
  const result = await $fetch('/api/admin/ai-prompts', { method: 'POST', body: payload }) as any
  if (!result?.success) {
    alert(result?.message || '保存失败')
    saving.value = false
    return
  }
  await load()
  const next = bundles.value.find(b => b.key === String(form.key).trim().toUpperCase())
  if (next) select(next)
  saving.value = false
}

const formatTime = (val: string | null) => {
  if (!val) return '—'
  const date = new Date(val)
  if (Number.isNaN(date.getTime())) return val
  return date.toLocaleString('zh-CN')
}

onMounted(load)
</script>

