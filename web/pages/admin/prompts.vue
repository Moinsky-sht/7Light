<template>
  <div class="grid gap-6 lg:grid-cols-[360px_1fr]">
    <section class="rounded-xl border border-ink/10 bg-white/70 p-5 shadow-sm">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold">问题模板库</h2>
          <p class="mt-0.5 text-xs text-ink/60">按维度聚类，快速定位各子项的启用版本与草稿。</p>
        </div>
        <button class="btn-primary shrink-0" @click="createNew">新建</button>
      </div>

      <div class="mt-4 grid gap-3 text-sm">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-ink/60">维度</label>
            <select v-model="filters.dimensionId" class="input-base">
              <option value="">全部</option>
              <option v-for="n in dimensionOptions" :key="n" :value="String(n)">维度 {{ n }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-ink/60">子项</label>
            <select v-model="filters.subItemId" class="input-base">
              <option value="">全部</option>
              <option v-for="n in subItemOptions" :key="n" :value="String(n)">子项 {{ n }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-ink/60">状态</label>
            <select v-model="filters.status" class="input-base">
              <option value="">全部</option>
              <option value="ACTIVE">启用</option>
              <option value="DRAFT">草稿</option>
              <option value="DEPRECATED">废弃</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-ink/60">视图</label>
            <select v-model="viewMode" class="input-base">
              <option value="dimension">维度聚类</option>
              <option value="group">子项分组</option>
              <option value="flat">列表</option>
            </select>
          </div>
        </div>

        <div>
          <label class="text-xs text-ink/60">关键词</label>
          <input v-model="searchTerm" type="text" class="input-base" placeholder="搜索模板/备注/版本..." />
        </div>

        <div class="flex items-center gap-2">
          <button class="btn-secondary flex-1" @click="loadPrompts">刷新</button>
          <button class="btn-secondary" @click="clearFilters">清空</button>
        </div>
      </div>

      <div class="mt-5 max-h-[520px] overflow-auto">
        <div v-if="viewMode === 'dimension'" class="space-y-2">
          <div v-for="cluster in dimensionClusters" :key="cluster.key" class="rounded-lg border border-ink/10 bg-white/80">
            <button
              class="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-ink/5"
              @click="toggleDimension(cluster.key)"
            >
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-semibold">
                    {{ cluster.dimensionId ? `维度 ${cluster.dimensionId}` : '未指定维度' }}
                  </span>
                  <span class="rounded-full bg-ink/10 px-2 py-0.5 text-xs font-semibold text-ink/70">
                    子项组：{{ cluster.groupCount }}
                  </span>
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-semibold"
                    :class="cluster.activeGroupCount === cluster.groupCount ? 'bg-emerald-500/10 text-emerald-700' : 'bg-amber-500/10 text-amber-700'"
                  >
                    启用覆盖：{{ cluster.activeGroupCount }}/{{ cluster.groupCount }}
                  </span>
                </div>
                <div class="mt-1 flex items-center gap-3 text-xs text-ink/60">
                  <span>模板：{{ cluster.promptCount }} 条</span>
                  <span v-if="cluster.lastUpdatedAt">最近更新：{{ formatDate(cluster.lastUpdatedAt) }}</span>
                </div>
              </div>
              <span class="text-xs text-ink/60">{{ expandedDimensions[cluster.key] ? '收起' : '展开' }}</span>
            </button>

            <div v-if="expandedDimensions[cluster.key]" class="space-y-2 border-t border-ink/10 p-3">
              <div v-for="group in cluster.groups" :key="group.key" class="rounded-lg border border-ink/10 bg-white">
                <button
                  class="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-ink/5"
                  @click="toggleGroup(group.key)"
                >
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-semibold">子项 {{ group.subItemId ?? '-' }}</span>
                      <span
                        v-if="group.active"
                        class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700"
                      >
                        启用：{{ group.active.version }}
                      </span>
                      <span v-else class="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700">未启用</span>
                    </div>
                    <div class="mt-1 flex items-center gap-3 text-xs text-ink/60">
                      <span>共 {{ group.prompts.length }} 条</span>
                      <span v-if="group.lastUpdatedAt">最近更新：{{ formatDate(group.lastUpdatedAt) }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button class="btn-secondary" type="button" @click.stop="createNewForGroup(group.dimensionId, group.subItemId)">新建版本</button>
                    <span class="text-xs text-ink/60">{{ expandedGroups[group.key] ? '收起' : '展开' }}</span>
                  </div>
                </button>

                <div v-if="expandedGroups[group.key]" class="space-y-2 border-t border-ink/10 p-3">
                  <button
                    v-for="prompt in group.prompts"
                    :key="prompt.id"
                    class="w-full rounded-lg border border-ink/10 px-3 py-2 text-left text-sm hover:bg-ink/5"
                    :class="selectedPrompt?.id === prompt.id ? 'bg-ink text-white' : 'bg-white text-ink'"
                    @click="selectPrompt(prompt)"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <div class="min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="font-semibold">{{ prompt.version }}</span>
                          <span
                            class="rounded-full px-2 py-0.5 text-xs font-semibold"
                            :class="prompt.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-700' : prompt.status === 'DRAFT' ? 'bg-sky-500/10 text-sky-700' : 'bg-ink/10 text-ink/70'"
                          >
                            {{ statusLabel(prompt.status) }}
                          </span>
                        </div>
                        <div class="mt-1 truncate text-xs" :class="selectedPrompt?.id === prompt.id ? 'text-white/80' : 'text-ink/60'">
                          {{ previewText(prompt.template) }}
                        </div>
                      </div>
                      <div class="shrink-0 text-xs" :class="selectedPrompt?.id === prompt.id ? 'text-white/80' : 'text-ink/60'">
                        {{ formatDate(prompt.updatedAt) }}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div v-if="!cluster.groups.length" class="text-xs text-ink/60">暂无模板</div>
            </div>
          </div>

          <div v-if="!dimensionClusters.length" class="text-xs text-ink/60">暂无模板</div>
        </div>

        <div v-else-if="viewMode === 'group'" class="space-y-2">
          <div
            v-for="group in groupedPrompts"
            :key="group.key"
            class="rounded-lg border border-ink/10 bg-white/80"
          >
            <button
              class="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-ink/5"
              @click="toggleGroup(group.key)"
            >
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-semibold">维度 {{ group.dimensionId ?? '-' }} / 子项 {{ group.subItemId ?? '-' }}</span>
                  <span
                    v-if="group.active"
                    class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700"
                  >
                    启用：{{ group.active.version }}
                  </span>
                  <span v-else class="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700">未启用</span>
                </div>
                <div class="mt-1 flex items-center gap-3 text-xs text-ink/60">
                  <span>共 {{ group.prompts.length }} 条</span>
                  <span v-if="group.lastUpdatedAt">最近更新：{{ formatDate(group.lastUpdatedAt) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button class="btn-secondary" type="button" @click.stop="createNewForGroup(group.dimensionId, group.subItemId)">新建版本</button>
                <span class="text-xs text-ink/60">{{ expandedGroups[group.key] ? '收起' : '展开' }}</span>
              </div>
            </button>

            <div v-if="expandedGroups[group.key]" class="space-y-2 border-t border-ink/10 p-3">
              <button
                v-for="prompt in group.prompts"
                :key="prompt.id"
                class="w-full rounded-lg border border-ink/10 px-3 py-2 text-left text-sm hover:bg-ink/5"
                :class="selectedPrompt?.id === prompt.id ? 'bg-ink text-white' : 'bg-white text-ink'"
                @click="selectPrompt(prompt)"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-semibold">{{ prompt.version }}</span>
                      <span
                        class="rounded-full px-2 py-0.5 text-xs font-semibold"
                        :class="prompt.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-700' : prompt.status === 'DRAFT' ? 'bg-sky-500/10 text-sky-700' : 'bg-ink/10 text-ink/70'"
                      >
                        {{ statusLabel(prompt.status) }}
                      </span>
                    </div>
                    <div class="mt-1 truncate text-xs" :class="selectedPrompt?.id === prompt.id ? 'text-white/80' : 'text-ink/60'">
                      {{ previewText(prompt.template) }}
                    </div>
                  </div>
                  <div class="shrink-0 text-xs" :class="selectedPrompt?.id === prompt.id ? 'text-white/80' : 'text-ink/60'">
                    {{ formatDate(prompt.updatedAt) }}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div v-if="!groupedPrompts.length" class="text-xs text-ink/60">暂无模板</div>
        </div>

        <div v-else class="space-y-2">
          <button
            v-for="prompt in flatPrompts"
            :key="prompt.id"
            class="w-full rounded-lg border border-ink/10 px-3 py-2 text-left text-sm hover:bg-ink/5"
            :class="selectedPrompt?.id === prompt.id ? 'bg-ink text-white' : 'bg-white/80 text-ink'"
            @click="selectPrompt(prompt)"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-semibold">维度 {{ prompt.dimensionId ?? '-' }} / 子项 {{ prompt.subItemId ?? '-' }}</span>
                  <span class="text-xs">{{ prompt.version }}</span>
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-semibold"
                    :class="prompt.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-700' : prompt.status === 'DRAFT' ? 'bg-sky-500/10 text-sky-700' : 'bg-ink/10 text-ink/70'"
                  >
                    {{ statusLabel(prompt.status) }}
                  </span>
                </div>
                <div class="mt-1 truncate text-xs" :class="selectedPrompt?.id === prompt.id ? 'text-white/80' : 'text-ink/60'">
                  {{ previewText(prompt.template) }}
                </div>
              </div>
              <div class="shrink-0 text-xs" :class="selectedPrompt?.id === prompt.id ? 'text-white/80' : 'text-ink/60'">
                {{ formatDate(prompt.updatedAt) }}
              </div>
            </div>
          </button>

          <div v-if="!flatPrompts.length" class="text-xs text-ink/60">暂无模板</div>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-ink/10 bg-white/70 p-6 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-bold">编辑问题模板</h2>
          <p class="text-sm text-ink/60">用于每日问询问题的模板库（按维度/子项）。</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button class="btn-secondary" :disabled="!form.id || saving" @click="cloneAsDraft">复制为草稿</button>
          <button class="btn-secondary" :disabled="!form.id || saving" @click="publishPrompt">发布</button>
          <button class="btn-secondary" :disabled="!form.id || saving" @click="deletePrompt">删除</button>
          <button class="btn-primary" :disabled="saving" @click="savePrompt">
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>

      <div class="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <label class="text-xs text-ink/60">版本</label>
          <input v-model="form.version" type="text" class="input-base" />
        </div>
        <div>
          <label class="text-xs text-ink/60">维度</label>
          <input v-model.number="form.dimensionId" type="number" min="1" max="7" class="input-base" />
        </div>
        <div>
          <label class="text-xs text-ink/60">子项</label>
          <input v-model.number="form.subItemId" type="number" min="1" max="7" class="input-base" />
        </div>
        <div>
          <label class="text-xs text-ink/60">状态</label>
          <select v-model="form.status" class="input-base">
            <option value="ACTIVE">启用</option>
            <option value="DRAFT">草稿</option>
            <option value="DEPRECATED">废弃</option>
          </select>
        </div>
      </div>

      <div class="mt-4">
        <label class="text-xs text-ink/60">提示词模板</label>
        <textarea v-model="form.template" class="input-base h-40 font-mono text-xs"></textarea>
      </div>

      <div class="mt-4">
        <div class="flex items-center justify-between">
          <label class="text-xs text-ink/60">JSON Schema（可选）</label>
          <button class="btn-secondary" type="button" @click="formatJsonSchema">格式化</button>
        </div>
        <textarea v-model="form.jsonSchema" class="input-base h-32 font-mono text-xs"></textarea>
      </div>

      <div class="mt-4">
        <label class="text-xs text-ink/60">备注</label>
        <textarea v-model="form.notes" class="input-base h-24 text-sm"></textarea>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

const filters = reactive({
  dimensionId: '',
  subItemId: '',
  status: ''
})

const prompts = ref<any[]>([])
const selectedPrompt = ref<any | null>(null)
const saving = ref(false)
const viewMode = ref<'dimension' | 'group' | 'flat'>('dimension')
const searchTerm = ref('')
const expandedGroups = reactive<Record<string, boolean>>({})
const expandedDimensions = reactive<Record<string, boolean>>({})
const activeDimension = ref<number | null>(null)

const dimensionOptions = [1, 2, 3, 4, 5, 6, 7]
const subItemOptions = [1, 2, 3, 4, 5, 6, 7]

const statusLabel = (status: string) => {
  if (status === 'ACTIVE') return '启用'
  if (status === 'DRAFT') return '草稿'
  if (status === 'DEPRECATED') return '废弃'
  return status
}

const previewText = (input: string) => {
  const value = (input || '').replace(/\s+/g, ' ').trim()
  return value.length > 80 ? `${value.slice(0, 80)}…` : value
}

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date)
}

const form = reactive({
  id: '',
  dimensionId: null as number | null,
  subItemId: null as number | null,
  version: 'v1.0.0',
  status: 'DRAFT',
  template: '',
  jsonSchema: '',
  notes: ''
})

const resetForm = () => {
  form.id = ''
  form.dimensionId = null
  form.subItemId = null
  form.version = 'v1.0.0'
  form.status = 'DRAFT'
  form.template = ''
  form.jsonSchema = ''
  form.notes = ''
}

const selectPrompt = (prompt: any) => {
  selectedPrompt.value = prompt
  form.id = prompt.id
  form.dimensionId = prompt.dimensionId
  form.subItemId = prompt.subItemId
  form.version = prompt.version
  form.status = prompt.status
  form.template = prompt.template
  form.jsonSchema = prompt.jsonSchema ? JSON.stringify(prompt.jsonSchema, null, 2) : ''
  form.notes = prompt.notes || ''

  const key = `${prompt.dimensionId ?? ''}|${prompt.subItemId ?? ''}`
  expandedGroups[key] = true

  const dimensionKey = String(prompt.dimensionId ?? 'unknown')
  expandedDimensions[dimensionKey] = true
  activeDimension.value = prompt.dimensionId ?? null
}

const createNew = () => {
  selectedPrompt.value = null
  resetForm()
  form.dimensionId = filters.dimensionId ? Number(filters.dimensionId) : activeDimension.value
  form.subItemId = filters.subItemId ? Number(filters.subItemId) : null
}

const clearFilters = () => {
  filters.dimensionId = ''
  filters.subItemId = ''
  filters.status = ''
  searchTerm.value = ''
  loadPrompts()
}

const loadPrompts = async () => {
  const query: Record<string, any> = {}
  query.type = 'QUESTION'
  if (filters.dimensionId) query.dimensionId = filters.dimensionId
  if (filters.subItemId) query.subItemId = filters.subItemId
  if (filters.status) query.status = filters.status

  const result = await $fetch('/api/admin/prompts', { query }) as any
  if (result?.success) {
    prompts.value = result.data.prompts || []
    if (selectedPrompt.value) {
      const updated = prompts.value.find(p => p.id === selectedPrompt.value.id)
      if (updated) selectPrompt(updated)
    }
  }
}

const normalizedSearch = computed(() => searchTerm.value.trim().toLowerCase())

const filteredPrompts = computed(() => {
  const keyword = normalizedSearch.value
  if (!keyword) return prompts.value
  return prompts.value.filter((p) => {
    const hay = [
      p.version,
      p.template,
      p.notes,
      String(p.dimensionId ?? ''),
      String(p.subItemId ?? ''),
      p.status
    ]
      .filter(Boolean)
      .join('\n')
      .toLowerCase()
    return hay.includes(keyword)
  })
})

const flatPrompts = computed(() => filteredPrompts.value)

const groupedPrompts = computed(() => {
  const groups = new Map<string, { key: string; dimensionId: number | null; subItemId: number | null; prompts: any[]; active: any | null; lastUpdatedAt: string | null }>()
  for (const p of filteredPrompts.value) {
    const key = `${p.dimensionId ?? ''}|${p.subItemId ?? ''}`
    const existing = groups.get(key)
    if (!existing) {
      groups.set(key, {
        key,
        dimensionId: p.dimensionId ?? null,
        subItemId: p.subItemId ?? null,
        prompts: [p],
        active: p.status === 'ACTIVE' ? p : null,
        lastUpdatedAt: p.updatedAt ?? null
      })
      continue
    }
    existing.prompts.push(p)
    if (p.status === 'ACTIVE') {
      if (!existing.active) existing.active = p
      else if (new Date(p.updatedAt).getTime() > new Date(existing.active.updatedAt).getTime()) existing.active = p
    }
    if (p.updatedAt && (!existing.lastUpdatedAt || new Date(p.updatedAt).getTime() > new Date(existing.lastUpdatedAt).getTime())) {
      existing.lastUpdatedAt = p.updatedAt
    }
  }

  const result = Array.from(groups.values())
  for (const g of result) {
    g.prompts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }
  result.sort((a, b) => (b.lastUpdatedAt ? new Date(b.lastUpdatedAt).getTime() : 0) - (a.lastUpdatedAt ? new Date(a.lastUpdatedAt).getTime() : 0))
  return result
})

const dimensionClusters = computed(() => {
  const clusters = new Map<string, { key: string; dimensionId: number | null; groups: any[]; groupCount: number; activeGroupCount: number; promptCount: number; lastUpdatedAt: string | null }>()
  for (const group of groupedPrompts.value) {
    const key = String(group.dimensionId ?? 'unknown')
    const existing = clusters.get(key)
    if (!existing) {
      clusters.set(key, {
        key,
        dimensionId: group.dimensionId ?? null,
        groups: [group],
        groupCount: 1,
        activeGroupCount: group.active ? 1 : 0,
        promptCount: group.prompts.length,
        lastUpdatedAt: group.lastUpdatedAt ?? null
      })
      continue
    }
    existing.groups.push(group)
    existing.groupCount += 1
    existing.activeGroupCount += group.active ? 1 : 0
    existing.promptCount += group.prompts.length
    if (group.lastUpdatedAt && (!existing.lastUpdatedAt || new Date(group.lastUpdatedAt).getTime() > new Date(existing.lastUpdatedAt).getTime())) {
      existing.lastUpdatedAt = group.lastUpdatedAt
    }
  }

  const ordered: Array<{ key: string; dimensionId: number | null; groups: any[]; groupCount: number; activeGroupCount: number; promptCount: number; lastUpdatedAt: string | null }> = []
  for (const n of dimensionOptions) {
    const entry = clusters.get(String(n))
    if (entry) ordered.push(entry)
  }
  const unknown = clusters.get('unknown')
  if (unknown) ordered.push(unknown)

  for (const cluster of ordered) {
    cluster.groups.sort((a: any, b: any) => {
      const aSub = a.subItemId ?? 999
      const bSub = b.subItemId ?? 999
      if (aSub !== bSub) return aSub - bSub
      return (b.lastUpdatedAt ? new Date(b.lastUpdatedAt).getTime() : 0) - (a.lastUpdatedAt ? new Date(a.lastUpdatedAt).getTime() : 0)
    })
  }

  return ordered
})

const toggleGroup = (key: string) => {
  expandedGroups[key] = !expandedGroups[key]
}

const toggleDimension = (key: string) => {
  expandedDimensions[key] = !expandedDimensions[key]
  activeDimension.value = key === 'unknown' ? null : Number(key)
}

const bumpVersion = (version: string) => {
  const v = (version || '').trim()
  const m = v.match(/^v?(\d+)\.(\d+)\.(\d+)$/i)
  if (!m) return v ? `${v}-draft` : 'v1.0.0'
  const major = Number(m[1])
  const minor = Number(m[2])
  const patch = Number(m[3]) + 1
  return `v${major}.${minor}.${patch}`
}

const createNewForGroup = (dimensionId: number | null, subItemId: number | null) => {
  const group = groupedPrompts.value.find(g => g.dimensionId === dimensionId && g.subItemId === subItemId)
  const base = group?.active || group?.prompts?.[0]

  selectedPrompt.value = null
  resetForm()
  form.dimensionId = dimensionId
  form.subItemId = subItemId
  if (base) {
    form.template = base.template || ''
    form.jsonSchema = base.jsonSchema ? JSON.stringify(base.jsonSchema, null, 2) : ''
    form.notes = base.notes || ''
    form.version = bumpVersion(base.version)
  }
  form.status = 'DRAFT'
  activeDimension.value = dimensionId
  expandedDimensions[String(dimensionId ?? 'unknown')] = true
  expandedGroups[`${dimensionId ?? ''}|${subItemId ?? ''}`] = true
}

const cloneAsDraft = () => {
  if (!selectedPrompt.value) return
  createNewForGroup(selectedPrompt.value.dimensionId ?? null, selectedPrompt.value.subItemId ?? null)
}

const formatJsonSchema = () => {
  if (!form.jsonSchema.trim()) return
  try {
    const parsed = JSON.parse(form.jsonSchema)
    form.jsonSchema = JSON.stringify(parsed, null, 2)
  } catch {
    alert('JSON Schema 格式不正确')
  }
}

const savePrompt = async () => {
  if (!form.template.trim()) return
  saving.value = true

  let jsonSchemaValue = null
  if (form.jsonSchema.trim()) {
    try {
      jsonSchemaValue = JSON.parse(form.jsonSchema)
    } catch {
      alert('JSON Schema 格式不正确')
      saving.value = false
      return
    }
  }

  const result = await $fetch('/api/admin/prompts', {
    method: 'POST',
    body: {
      id: form.id || undefined,
      type: 'QUESTION',
      dimensionId: form.dimensionId,
      subItemId: form.subItemId,
      version: form.version,
      status: form.status,
      template: form.template,
      jsonSchema: jsonSchemaValue,
      notes: form.notes
    }
  }) as any

  if (result?.success) {
    await loadPrompts()
    if (!form.id && result.data?.id) {
      const newPrompt = prompts.value.find(p => p.id === result.data.id)
      if (newPrompt) selectPrompt(newPrompt)
    }
  }

  saving.value = false
}

const publishPrompt = async () => {
  if (!form.id) return
  if (!confirm('发布将把同维度/子项的其它版本标记为“废弃”，确定继续吗？')) return
  saving.value = true
  const result = await $fetch('/api/admin/prompts/publish', {
    method: 'POST',
    body: { id: form.id }
  }) as any
  if (result?.success) {
    await loadPrompts()
  } else {
    alert(result?.message || '发布失败')
  }
  saving.value = false
}

const deletePrompt = async () => {
  if (!form.id) return
  if (!confirm('确定删除该提示词吗？')) return
  saving.value = true
  const result = await $fetch(`/api/admin/prompts/${form.id}`, { method: 'DELETE' }) as any
  if (result?.success) {
    selectedPrompt.value = null
    resetForm()
    await loadPrompts()
  } else {
    alert(result?.message || '删除失败')
  }
  saving.value = false
}

onMounted(loadPrompts)

watch(
  () => prompts.value,
  () => {
    if (selectedPrompt.value) return
    if (viewMode.value === 'dimension') {
      const first = dimensionClusters.value[0]
      if (first && expandedDimensions[first.key] === undefined) expandedDimensions[first.key] = true
      const firstGroup = first?.groups?.[0]
      if (firstGroup && expandedGroups[firstGroup.key] === undefined) expandedGroups[firstGroup.key] = true
      if (activeDimension.value === null && first?.dimensionId != null) activeDimension.value = first.dimensionId
      return
    }
    if (viewMode.value !== 'group') return
    const first = groupedPrompts.value[0]
    if (first && expandedGroups[first.key] === undefined) expandedGroups[first.key] = true
  },
  { deep: true }
)
</script>
