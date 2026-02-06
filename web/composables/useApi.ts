/**
 * API 请求封装
 * 自动处理认证 token 和错误
 */

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export const useApi = () => {
  // 获取 token
  const getToken = () => {
    if (process.client) {
      return localStorage.getItem('sevenstar_token')
    }
    return null
  }

  // 设置 token
  const setToken = (token: string) => {
    if (process.client) {
      localStorage.setItem('sevenstar_token', token)
    }
  }

  // 清除 token
  const clearToken = () => {
    if (process.client) {
      localStorage.removeItem('sevenstar_token')
    }
  }

  // 通用请求方法
  const request = async <T = any>(
    url: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      body?: any
      headers?: Record<string, string>
    } = {}
  ): Promise<ApiResponse<T>> => {
    const token = getToken()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const { data, error } = await useFetch<ApiResponse<T>>(url, {
        method: options.method || 'GET',
        body: options.body,
        headers
      })

      if (error.value) {
        // 401 错误清除 token
        if (error.value.statusCode === 401) {
          clearToken()
          navigateTo('/login')
        }
        return {
          success: false,
          message: error.value.data?.message || '请求失败'
        }
      }

      return data.value || { success: false, message: '无响应数据' }
    } catch (e: any) {
      return {
        success: false,
        message: e.message || '网络错误'
      }
    }
  }

  // GET 请求
  const get = <T = any>(url: string) => request<T>(url, { method: 'GET' })

  // POST 请求
  const post = <T = any>(url: string, body?: any) => 
    request<T>(url, { method: 'POST', body })

  // PUT 请求
  const put = <T = any>(url: string, body?: any) => 
    request<T>(url, { method: 'PUT', body })

  // DELETE 请求
  const del = <T = any>(url: string) => request<T>(url, { method: 'DELETE' })

  return {
    getToken,
    setToken,
    clearToken,
    request,
    get,
    post,
    put,
    del
  }
}

// 全局 Toast 提示
export const useToast = () => {
  const toasts = useState<Array<{id: number, message: string, type: 'success' | 'error' | 'info'}>>('toasts', () => [])
  let toastId = 0

  const show = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = toastId++
    toasts.value.push({ id, message, type })
    
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 3000)
  }

  const success = (message: string) => show(message, 'success')
  const error = (message: string) => show(message, 'error')
  const info = (message: string) => show(message, 'info')

  return { toasts, show, success, error, info }
}
