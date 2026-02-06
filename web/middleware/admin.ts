/**
 * 管理员权限中间件
 */
import { useUserStore } from '~/stores/user'

export default defineNuxtRouteMiddleware(async () => {
  if (!process.client) return

  const userStore = useUserStore()

  if (!userStore.isLoggedIn) {
    await userStore.init()
  }

  if (!userStore.user || userStore.user.role !== 'admin') {
    return navigateTo('/')
  }
})
