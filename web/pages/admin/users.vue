<template>
  <div class="space-y-6">
    <section class="rounded-xl border border-ink/10 bg-white/70 p-6 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold">用户管理</h2>
          <p class="text-sm text-ink/60">分配管理员角色以访问后台。</p>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-3">
        <input v-model="searchQuery" type="text" placeholder="搜索手机号/昵称/邮箱" class="input-base w-full md:w-80" />
        <button class="btn-secondary" @click="loadUsers">查询</button>
      </div>

      <div v-if="loading" class="mt-4 text-sm text-ink/60">加载中...</div>

      <div v-else class="mt-6 overflow-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="text-xs uppercase text-ink/60">
            <tr>
              <th class="py-2">昵称</th>
              <th class="py-2">手机号</th>
              <th class="py-2">邮箱</th>
              <th class="py-2">角色</th>
              <th class="py-2">状态</th>
              <th class="py-2">VIP</th>
              <th class="py-2">VIP 到期</th>
              <th class="py-2">最后登录</th>
              <th class="py-2">创建时间</th>
              <th class="py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id" class="border-t border-ink/10">
              <td class="py-2">{{ u.nickname || '—' }}</td>
              <td class="py-2">{{ u.phone || '—' }}</td>
              <td class="py-2">{{ u.email || '—' }}</td>
              <td class="py-2">
                <select
                  v-model="u.role"
                  class="input-base w-28"
                  :disabled="u.id === currentUserId"
                  @change="updateRole(u)"
                >
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                </select>
              </td>
              <td class="py-2">
                <select
                  v-model="u.status"
                  class="input-base w-28"
                  :disabled="u.id === currentUserId"
                  @change="updateStatus(u)"
                >
                  <option value="ACTIVE">启用</option>
                  <option value="DISABLED">禁用</option>
                </select>
              </td>
              <td class="py-2">
                <label class="inline-flex items-center gap-2 text-xs">
                  <input
                    v-model="u.isPro"
                    type="checkbox"
                    class="h-4 w-4 rounded border-ink/30 text-cinnabar focus:ring-cinnabar/60"
                    :disabled="u.id === currentUserId"
                    @change="updateVip(u)"
                  />
                  <span class="text-ink/70">{{ u.isPro ? '是' : '否' }}</span>
                </label>
              </td>
              <td class="py-2 text-xs text-ink/60">{{ formatTime(u.proUntil) }}</td>
              <td class="py-2 text-xs text-ink/60">{{ formatTime(u.lastLoginAt) }}</td>
              <td class="py-2 text-xs text-ink/60">{{ formatTime(u.createdAt) }}</td>
              <td class="py-2">
                <div class="flex flex-wrap items-center gap-2">
                  <NuxtLink class="text-cinnabar text-xs hover:underline" :to="`/admin/users/${u.id}`">详情</NuxtLink>
                  <button class="text-cinnabar text-xs hover:underline" :disabled="u.id === currentUserId" @click="resetPassword(u)">
                    重置密码
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!users.length" class="mt-4 text-xs text-ink/60">暂无用户</div>
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
import { onMounted, ref, computed } from 'vue'
import { useUserStore } from '~/stores/user'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

const userStore = useUserStore()
const currentUserId = computed(() => userStore.user?.id)

const users = ref<any[]>([])
const loading = ref(false)
const searchQuery = ref('')
const total = ref(0)
const limit = 50
const offset = ref(0)

const loadUsers = async () => {
  loading.value = true
  const result = await $fetch('/api/admin/users', {
    query: { q: searchQuery.value, limit, offset: offset.value }
  }) as any
  if (result?.success) {
    users.value = result.data.users || []
    total.value = result.data.total || 0
  }
  loading.value = false
}

const updateRole = async (user: any) => {
  if (!user?.id) return
  await $fetch('/api/admin/users/role', {
    method: 'POST',
    body: { userId: user.id, role: user.role }
  })
}

const updateStatus = async (user: any) => {
  if (!user?.id) return
  await $fetch('/api/admin/users/status', {
    method: 'POST',
    body: { userId: user.id, status: user.status }
  })
}

const updateVip = async (user: any) => {
  if (!user?.id) return
  const result = await $fetch('/api/admin/users/vip', {
    method: 'POST',
    body: { userId: user.id, isPro: Boolean(user.isPro), proUntil: user.proUntil || undefined }
  }) as any
  if (!result?.success) {
    alert(result?.message || '更新失败')
    await loadUsers()
  }
}

const resetPassword = async (user: any) => {
  if (!user?.id) return
  if (!confirm('确定重置该用户密码吗？')) return
  const result = await $fetch('/api/admin/users/reset-password', {
    method: 'POST',
    body: { userId: user.id }
  }) as any
  if (result?.success) {
    alert(`新密码：${result.data.password}`)
  } else {
    alert(result?.message || '重置失败')
  }
}

const prevPage = async () => {
  offset.value = Math.max(0, offset.value - limit)
  await loadUsers()
}

const nextPage = async () => {
  offset.value = offset.value + limit
  await loadUsers()
}

const formatTime = (val: string | null) => {
  if (!val) return '—'
  const date = new Date(val)
  if (Number.isNaN(date.getTime())) return val
  return date.toLocaleString('zh-CN')
}

onMounted(loadUsers)
</script>
