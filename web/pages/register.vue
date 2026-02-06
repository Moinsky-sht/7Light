<template>
  <div class="auth-page">
    <!-- 背景 -->
    <div class="page-background">
      <div class="paper-texture"></div>
      <div class="ink-wash ink-1"></div>
      <div class="ink-wash ink-2"></div>
    </div>

    <!-- 内容 -->
    <div class="auth-container">
      <!-- Logo 区域 -->
      <div class="logo-area">
        <div class="logo-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#A83232">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <h1 class="logo-title">七星灯</h1>
        <p class="logo-subtitle">点亮星灯·日日续生</p>
      </div>

      <!-- 表单卡片 -->
      <div class="auth-card">
        <h2 class="card-title">注册</h2>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label class="form-label">手机号</label>
            <input 
              v-model="phone" 
              type="tel" 
              placeholder="请输入手机号"
              class="form-input"
              maxlength="11"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label class="form-label">昵称（选填）</label>
            <input 
              v-model="nickname" 
              type="text" 
              placeholder="给自己取个道号"
              class="form-input"
              maxlength="20"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label class="form-label">密码</label>
            <input 
              v-model="password" 
              type="password" 
              placeholder="请输入密码（至少6位）"
              class="form-input"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label class="form-label">确认密码</label>
            <input 
              v-model="confirmPassword" 
              type="password" 
              placeholder="请再次输入密码"
              class="form-input"
              :disabled="loading"
            />
          </div>

          <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

          <button 
            type="submit" 
            class="submit-btn"
            :disabled="loading || !canSubmit"
          >
            <span v-if="loading" class="loading-spinner"></span>
            <span v-else>注 册</span>
          </button>
        </form>

        <div class="auth-footer">
          <span>已有账号？</span>
          <NuxtLink to="/login" class="link">立即登录</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '~/stores/user'

const router = useRouter()
const userStore = useUserStore()

const phone = ref('')
const nickname = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMsg = ref('')

const canSubmit = computed(() => {
  return phone.value && 
         password.value && 
         password.value.length >= 6 &&
         password.value === confirmPassword.value
})

const handleRegister = async () => {
  if (!canSubmit.value) return
  
  // 验证手机号格式
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    errorMsg.value = '请输入正确的手机号'
    return
  }
  
  // 验证密码
  if (password.value !== confirmPassword.value) {
    errorMsg.value = '两次密码输入不一致'
    return
  }
  
  loading.value = true
  errorMsg.value = ''
  
  const result = await userStore.register(
    phone.value, 
    password.value, 
    nickname.value || undefined
  )
  
  if (result.success) {
    router.push('/')
  } else {
    errorMsg.value = result.message || '注册失败'
  }
  
  loading.value = false
}

// 如果已登录，跳转首页
onMounted(async () => {
  await userStore.init()
  if (userStore.isLoggedIn) {
    router.push('/')
  }
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F3E9D2;
  position: relative;
  padding: 20px 0;
}

.page-background {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.paper-texture {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
  opacity: 0.6;
}

.ink-wash {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
}

.ink-1 {
  top: -10%;
  right: -10%;
  width: 60%;
  height: 40%;
  background: radial-gradient(circle, #8B4513 0%, transparent 70%);
}

.ink-2 {
  bottom: 20%;
  left: -15%;
  width: 50%;
  height: 35%;
  background: radial-gradient(circle, #2C241B 0%, transparent 70%);
}

.auth-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.logo-area {
  text-align: center;
  margin-bottom: 30px;
}

.logo-icon {
  font-size: 40px;
  color: #A83232;
  margin-bottom: 8px;
}

.logo-title {
  font-size: 28px;
  font-weight: 900;
  color: #2C241B;
  letter-spacing: 8px;
  font-family: "Noto Serif SC", serif;
}

.logo-subtitle {
  font-size: 11px;
  color: #8C735A;
  letter-spacing: 4px;
  margin-top: 6px;
}

.auth-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(44, 36, 27, 0.1);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px -10px rgba(44, 36, 27, 0.15);
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #2C241B;
  text-align: center;
  margin-bottom: 24px;
  font-family: "Noto Serif SC", serif;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #5D4E3F;
}

.form-input {
  padding: 12px 14px;
  background: rgba(44, 36, 27, 0.05);
  border: 1px solid rgba(44, 36, 27, 0.15);
  border-radius: 12px;
  font-size: 15px;
  color: #2C241B;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #A83232;
  background: rgba(255, 255, 255, 0.8);
}

.form-input::placeholder {
  color: #8C735A;
}

.error-msg {
  color: #A83232;
  font-size: 13px;
  text-align: center;
}

.submit-btn {
  padding: 14px;
  background: linear-gradient(135deg, #A83232 0%, #8A2525 100%);
  border: none;
  border-radius: 12px;
  color: #F3E9D2;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(168, 50, 50, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(243, 233, 210, 0.3);
  border-top-color: #F3E9D2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.auth-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 13px;
  color: #8C735A;
}

.link {
  color: #A83232;
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
}

.link:hover {
  text-decoration: underline;
}
</style>
