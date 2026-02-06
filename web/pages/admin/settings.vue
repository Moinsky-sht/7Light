<template>
  <div class="space-y-6">
    <section class="rounded-xl border border-ink/10 bg-white/70 p-6 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold">AI 提供商配置</h2>
          <p class="mt-1 text-sm text-ink/70">在本地后台维护各家模型服务的 Key、Base URL 与模型名。</p>
        </div>
        <button class="btn-primary" :disabled="isSaving" @click="saveAll">
          {{ isSaving ? '保存中...' : '保存全部' }}
        </button>
      </div>

      <div v-if="isLoading" class="mt-6 text-sm text-ink/60">正在加载配置...</div>

      <div v-else class="mt-6 grid gap-4">
        <div v-for="provider in providers" :key="provider.id" class="rounded-lg border border-ink/10 bg-parchment-light p-4">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 class="text-base font-bold">{{ provider.displayName }}</h3>
              <p class="text-xs text-ink/60">{{ provider.name }}</p>
            </div>
            <label class="flex items-center gap-2 text-sm">
              <input v-model="provider.enabled" type="checkbox" class="h-4 w-4 rounded border-ink/30 text-cinnabar focus:ring-cinnabar/60" />
              启用
            </label>
          </div>

          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label class="text-xs text-ink/60">Base URL</label>
              <input v-model="provider.baseUrl" type="text" class="input-base" />
            </div>
            <div>
              <label class="text-xs text-ink/60">模型名称</label>
              <input v-model="provider.model" type="text" class="input-base" />
            </div>
            <div>
              <label class="text-xs text-ink/60">API Key（留空则不修改）</label>
              <input v-model="provider.apiKeyInput" type="password" class="input-base" :placeholder="provider.apiKeyMasked || '未配置'" />
              <div class="mt-2 flex items-center gap-2 text-xs text-ink/60">
                <span>当前：{{ provider.apiKeyMasked || '未配置' }}</span>
                <button class="text-cinnabar hover:underline" @click="clearKey(provider)">清空 Key</button>
              </div>
            </div>
            <div>
              <label class="text-xs text-ink/60">超时 (ms)</label>
              <input v-model.number="provider.timeoutMs" type="number" min="1000" max="60000" class="input-base" />
            </div>
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-3">
            <button class="btn-secondary" @click="testProvider(provider)" :disabled="provider.testing">
              {{ provider.testing ? '测试中...' : '测试连接' }}
            </button>
            <span v-if="provider.testResult" class="text-xs" :class="provider.testResult.success ? 'text-green-600' : 'text-red-600'">
              {{ provider.testResult.success ? `成功 (${provider.testResult.latency}ms)` : provider.testResult.error }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-ink/10 bg-white/70 p-6 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold">通用系统设置</h2>
          <p class="mt-1 text-sm text-ink/70">用于管理非敏感的业务配置项（Key-Value）。</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button class="btn-secondary" @click="addSettingRow">新增</button>
          <button class="btn-primary" :disabled="isSavingAppSettings" @click="saveAppSettings">
            {{ isSavingAppSettings ? '保存中...' : '保存设置' }}
          </button>
        </div>
      </div>

      <div v-if="appSettingsLoading" class="mt-6 text-sm text-ink/60">正在加载设置...</div>

      <div v-else class="mt-6 overflow-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="text-xs uppercase text-ink/60">
            <tr>
              <th class="py-2">Key</th>
              <th class="py-2">类型</th>
              <th class="py-2">Value</th>
              <th class="py-2">说明</th>
              <th class="py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(s, idx) in appSettings" :key="s._rowId" class="border-t border-ink/10">
              <td class="py-2">
                <input v-model="s.key" class="input-base w-56" placeholder="如: DAILY_QUESTION_LIMIT" />
              </td>
              <td class="py-2">
                <select v-model="s.valueType" class="input-base w-32">
                  <option value="STRING">STRING</option>
                  <option value="NUMBER">NUMBER</option>
                  <option value="BOOLEAN">BOOLEAN</option>
                  <option value="JSON">JSON</option>
                </select>
              </td>
              <td class="py-2">
                <input v-model="s.value" class="input-base w-72" placeholder="值" />
              </td>
              <td class="py-2">
                <input v-model="s.description" class="input-base w-[420px]" placeholder="可选" />
              </td>
              <td class="py-2">
                <button class="text-cinnabar text-xs hover:underline" @click="removeSettingRow(idx)">移除</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!appSettings.length" class="mt-4 text-xs text-ink/60">暂无设置</div>
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

type ProviderForm = {
  id: string
  name: string
  displayName: string
  baseUrl: string
  model: string
  enabled: boolean
  timeoutMs: number
  apiKeyMasked: string
  apiKeyInput: string
  clearKey: boolean
  testing: boolean
  testResult: null | { success: boolean; latency: number; error?: string }
}

const providers = ref<ProviderForm[]>([])
const isLoading = ref(true)
const isSaving = ref(false)

type AppSettingRow = {
  _rowId: string
  key: string
  value: string
  valueType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON'
  description: string
}

const appSettings = ref<AppSettingRow[]>([])
const appSettingsLoading = ref(true)
const isSavingAppSettings = ref(false)

const loadProviders = async () => {
  isLoading.value = true
  const result = await $fetch('/api/admin/settings/ai') as any
  if (result?.success) {
    providers.value = result.data.providers.map((p: any) => ({
      ...p,
      apiKeyInput: '',
      clearKey: false,
      testing: false,
      testResult: null
    }))
  }
  isLoading.value = false
}

const loadAppSettings = async () => {
  appSettingsLoading.value = true
  const result = await $fetch('/api/admin/settings/app') as any
  if (result?.success) {
    appSettings.value = (result.data.settings || []).map((s: any) => ({
      _rowId: s.key || crypto.randomUUID(),
      key: s.key || '',
      value: s.value ?? '',
      valueType: (s.valueType || 'STRING').toUpperCase(),
      description: s.description ?? ''
    }))
  }
  appSettingsLoading.value = false
}

const addSettingRow = () => {
  appSettings.value.unshift({
    _rowId: crypto.randomUUID(),
    key: '',
    value: '',
    valueType: 'STRING',
    description: ''
  })
}

const removeSettingRow = (idx: number) => {
  appSettings.value.splice(idx, 1)
}

const saveAppSettings = async () => {
  isSavingAppSettings.value = true
  const payload = appSettings.value
    .map(s => ({
      key: s.key.trim(),
      value: s.value,
      valueType: s.valueType,
      description: s.description
    }))
    .filter(s => s.key)

  const result = await $fetch('/api/admin/settings/app', {
    method: 'POST',
    body: { settings: payload }
  }) as any

  if (result?.success) {
    await loadAppSettings()
  }
  isSavingAppSettings.value = false
}

const clearKey = (provider: ProviderForm) => {
  provider.apiKeyInput = ''
  provider.clearKey = true
  provider.apiKeyMasked = ''
}

const saveAll = async () => {
  isSaving.value = true
  const payload = providers.value.map(p => ({
    id: p.id,
    baseUrl: p.baseUrl,
    model: p.model,
    enabled: p.enabled,
    timeoutMs: p.timeoutMs,
    apiKey: p.apiKeyInput ? p.apiKeyInput : (p.clearKey ? '' : undefined)
  }))
  const result = await $fetch('/api/admin/settings/ai', {
    method: 'POST',
    body: { providers: payload }
  }) as any
  if (result?.success) {
    await loadProviders()
  }
  isSaving.value = false
}

const testProvider = async (provider: ProviderForm) => {
  provider.testing = true
  provider.testResult = null
  const result = await $fetch('/api/admin/settings/ai-test', {
    method: 'POST',
    body: { provider: provider.id }
  }) as any
  if (result?.success) {
    provider.testResult = result.data
  } else {
    provider.testResult = { success: false, latency: 0, error: result?.message || '测试失败' }
  }
  provider.testing = false
}

onMounted(async () => {
  await loadProviders()
  await loadAppSettings()
})
</script>
