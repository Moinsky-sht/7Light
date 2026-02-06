/**
 * 认证中间件
 * 检查用户是否已登录，未登录则跳转到登录页
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  // 不需要认证的页面
  const publicPages = ['/login', '/register']
  
  if (publicPages.includes(to.path)) {
    return
  }

  // 客户端检查
  if (process.client) {
    const token = localStorage.getItem('sevenstar_token')
    
    if (!token) {
      return navigateTo('/login')
    }
  }
})
