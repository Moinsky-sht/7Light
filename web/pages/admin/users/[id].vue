<template>
  <div class="space-y-6">
    <section class="rounded-xl border border-ink/10 bg-white/70 p-6 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-bold">用户详情</h2>
          <p class="text-sm text-ink/60">{{ user?.id || '—' }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <NuxtLink class="btn-secondary" to="/admin/users">返回列表</NuxtLink>
          <button class="btn-secondary" :disabled="!user" @click="exportUser">导出数据</button>
          <button class="btn-primary" :disabled="saving || !user" @click="saveUser">
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="mt-6 text-sm text-ink/60">加载中...</div>

      <div v-else-if="user" class="mt-6 grid gap-6 lg:grid-cols-2">
        <div class="space-y-4">
          <div>
            <label class="text-xs text-ink/60">昵称</label>
            <input v-model="form.nickname" class="input-base" />
          </div>
          <div>
            <label class="text-xs text-ink/60">手机号</label>
            <input v-model="form.phone" class="input-base" />
          </div>
          <div>
            <label class="text-xs text-ink/60">邮箱</label>
            <input v-model="form.email" class="input-base" />
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="text-xs text-ink/60">角色</label>
              <select v-model="form.role" class="input-base">
                <option value="user">普通用户</option>
                <option value="admin">管理员</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-ink/60">状态</label>
              <select v-model="form.status" class="input-base">
                <option value="ACTIVE">启用</option>
                <option value="DISABLED">禁用</option>
              </select>
            </div>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="text-xs text-ink/60">VIP</label>
              <label class="mt-2 inline-flex items-center gap-2 text-sm">
                <input v-model="form.isPro" type="checkbox" class="h-4 w-4 rounded border-ink/30 text-cinnabar focus:ring-cinnabar/60" />
                <span class="text-ink/70">{{ form.isPro ? '是' : '否' }}</span>
              </label>
            </div>
            <div>
              <label class="text-xs text-ink/60">VIP 到期（ISO，可选）</label>
              <input v-model="form.proUntil" class="input-base" placeholder="例如: 2026-12-31T00:00:00.000Z" />
            </div>
          </div>
          <div class="grid gap-4 md:grid-cols-2 text-xs text-ink/70">
            <div>
              <div class="text-ink/50">创建时间</div>
              <div>{{ formatTime(user.createdAt) }}</div>
            </div>
            <div>
              <div class="text-ink/50">最后登录</div>
              <div>{{ formatTime(user.lastLoginAt) }} / {{ user.lastLoginIp || '—' }}</div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 pt-2">
            <button class="btn-secondary" :disabled="saving" @click="resetPassword">重置密码</button>
            <span v-if="newPassword" class="text-xs text-ink/70">新密码：{{ newPassword }}</span>
          </div>
        </div>

        <div class="space-y-4">
          <div class="rounded-lg border border-ink/10 bg-parchment-light p-4">
            <h3 class="text-sm font-bold">我的设置</h3>
            <div class="mt-3 grid gap-3 md:grid-cols-2">
              <div class="rounded-lg border border-ink/10 bg-white/70 p-3">
                <div class="text-xs font-semibold">健康偏好</div>
                <pre class="mt-2 whitespace-pre-wrap break-words text-xs text-ink/70">{{ pretty({
                  goals: profile?.goals,
                  sleepPattern: profile?.sleepPattern,
                  dietHabit: profile?.dietHabit,
                  exerciseFreq: profile?.exerciseFreq,
                  waterIntake: profile?.waterIntake,
                  workType: profile?.workType,
                  lateNight: profile?.lateNight,
                  regularMeals: profile?.regularMeals,
                  healthConcerns: profile?.healthConcerns,
                  smokeDrink: profile?.smokeDrink
                }) }}</pre>
              </div>
              <div class="rounded-lg border border-ink/10 bg-white/70 p-3">
                <div class="text-xs font-semibold">个人信息</div>
                <pre class="mt-2 whitespace-pre-wrap break-words text-xs text-ink/70">{{ pretty({
                  gender: profile?.gender,
                  birthDate: profile?.birthDate,
                  heightCm: profile?.heightCm,
                  weightKg: profile?.weightKg,
                  bmi: profile?.bmi,
                  occupation: profile?.occupation,
                  chronicDiseases: profile?.chronicDiseases,
                  allergies: profile?.allergies
                }) }}</pre>
              </div>
              <div class="rounded-lg border border-ink/10 bg-white/70 p-3">
                <div class="text-xs font-semibold">通知设置</div>
                <pre class="mt-2 whitespace-pre-wrap break-words text-xs text-ink/70">{{ pretty(profile?.notificationSettings) }}</pre>
              </div>
              <div class="rounded-lg border border-ink/10 bg-white/70 p-3">
                <div class="text-xs font-semibold">系统/隐私/设备</div>
                <pre class="mt-2 whitespace-pre-wrap break-words text-xs text-ink/70">{{ pretty({
                  settings: profile?.settings,
                  privacySettings: profile?.privacySettings,
                  connectedDevices: profile?.connectedDevices
                }) }}</pre>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-ink/10 bg-parchment-light p-4">
            <h3 class="text-sm font-bold">统计</h3>
            <pre class="mt-2 whitespace-pre-wrap break-words text-xs text-ink/70">{{ pretty(stats) }}</pre>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-ink/10 bg-white/70 p-6 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 class="text-base font-bold">最近 10 条打卡</h3>
        </div>
        <NuxtLink v-if="user" class="text-cinnabar text-sm hover:underline" :to="`/admin/checkins?q=${encodeURIComponent(user.phone || user.id)}`">
          去打卡记录页查看更多
        </NuxtLink>
      </div>

      <div v-if="loading" class="mt-4 text-sm text-ink/60">加载中...</div>
      <div v-else class="mt-4 overflow-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="text-xs uppercase text-ink/60">
            <tr>
              <th class="py-2">时间</th>
              <th class="py-2">问题</th>
              <th class="py-2">回答</th>
              <th class="py-2">指标/得分</th>
              <th class="py-2">有效</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in latestLogs" :key="log.id" class="border-t border-ink/10">
              <td class="py-2 text-xs text-ink/60">{{ formatTime(log.createdAt) }}</td>
              <td class="py-2 max-w-[360px] truncate">{{ log.question || '—' }}</td>
              <td class="py-2 max-w-[360px] truncate">{{ log.answerText || '—' }}</td>
              <td class="py-2 text-xs">
                <div>{{ log.metricName || '—' }}</div>
                <div class="text-ink/60">{{ log.score ?? '—' }}</div>
              </td>
              <td class="py-2">
                <span :class="log.isValid ? 'text-green-700' : 'text-red-700'">{{ log.isValid ? '是' : '否' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!latestLogs.length" class="mt-4 text-xs text-ink/60">暂无记录</div>
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
const userId = String(route.params.id)

const loading = ref(true)
const saving = ref(false)
const user = ref<any | null>(null)
const profile = ref<any | null>(null)
const stats = ref<any | null>(null)
const latestLogs = ref<any[]>([])
const newPassword = ref('')

const form = reactive({
  nickname: '',
  phone: '',
  email: '',
  role: 'user',
  status: 'ACTIVE',
  isPro: false,
  proUntil: ''
})

const load = async () => {
  loading.value = true
  const result = await $fetch(`/api/admin/users/${userId}`) as any
  if (result?.success) {
    user.value = result.data.user
    profile.value = result.data.profile
    stats.value = result.data.stats
    latestLogs.value = result.data.latestLogs || []

    form.nickname = user.value.nickname || ''
    form.phone = user.value.phone || ''
    form.email = user.value.email || ''
    form.role = user.value.role || 'user'
    form.status = user.value.status || 'ACTIVE'
    form.isPro = Boolean(user.value.isPro)
    form.proUntil = user.value.proUntil || ''
  }
  loading.value = false
}

const saveUser = async () => {
  if (!user.value) return
  saving.value = true
  const userIdVal = user.value.id

  const resultUpdate = await $fetch('/api/admin/users/update', {
    method: 'POST',
    body: { userId: userIdVal, nickname: form.nickname, phone: form.phone, email: form.email }
  }) as any

  if (!resultUpdate?.success) {
    alert(resultUpdate?.message || '保存失败')
    saving.value = false
    return
  }

  const roleResult = await $fetch('/api/admin/users/role', {
    method: 'POST',
    body: { userId: userIdVal, role: form.role }
  }) as any

  if (!roleResult?.success) {
    alert(roleResult?.message || '角色更新失败')
    saving.value = false
    return
  }

  const statusResult = await $fetch('/api/admin/users/status', {
    method: 'POST',
    body: { userId: userIdVal, status: form.status }
  }) as any

  if (!statusResult?.success) {
    alert(statusResult?.message || '状态更新失败')
    saving.value = false
    return
  }

  const vipResult = await $fetch('/api/admin/users/vip', {
    method: 'POST',
    body: { userId: userIdVal, isPro: Boolean(form.isPro), proUntil: form.proUntil || undefined }
  }) as any

  if (!vipResult?.success) {
    alert(vipResult?.message || 'VIP 更新失败')
    saving.value = false
    return
  }

  await load()
  saving.value = false
}

const resetPassword = async () => {
  if (!user.value) return
  if (!confirm('确定重置该用户密码吗？')) return
  const result = await $fetch('/api/admin/users/reset-password', {
    method: 'POST',
    body: { userId: user.value.id }
  }) as any
  if (result?.success) {
    newPassword.value = result.data.password
  } else {
    alert(result?.message || '重置失败')
  }
}

const exportUser = async () => {
  if (!user.value) return
  const result = await $fetch(`/api/admin/users/${user.value.id}/export`) as any
  if (!result?.success) {
    alert(result?.message || '导出失败')
    return
  }
  const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `user_${user.value.id}_export.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const pretty = (val: any) => {
  if (!val) return ''
  try {
    return JSON.stringify(val, null, 2)
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
