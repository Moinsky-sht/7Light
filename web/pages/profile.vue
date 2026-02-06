<template>
  <div class="profile-page">
    <!-- 背景 -->
    <div class="page-background">
      <div class="paper-texture"></div>
      <div class="ink-wash ink-1"></div>
    </div>

    <!-- 用户信息卡片 -->
    <section class="user-section">
      <div class="user-card">
        <div class="avatar" @click="showAvatarModal = true">
          <img v-if="userAvatar" :src="userAvatar" alt="avatar" class="avatar-img" />
          <span v-else>{{ userStore.displayName?.charAt(0) || '灯' }}</span>
          <div class="avatar-edit-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
        </div>
        <div class="user-info">
          <div class="name-row">
            <h2 class="user-name">{{ userStore.displayName }}</h2>
            <div v-if="userStore.isUserPro" class="premium-badge">
              <span class="premium-text">PRO</span>
            </div>
          </div>
          <p class="user-phone">{{ maskedPhone }}</p>
        </div>
        <button v-if="!userStore.isUserPro" class="subscribe-btn" @click="showSubscriptionModal = true">
          订阅会员
        </button>
        <button v-else class="edit-btn" @click="showEditModal = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>
    </section>

    <!-- 数据统计 -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 2v3M16 2v3"/>
              <path d="M3.5 9h17"/>
              <path d="M5 5h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>
              <path d="M7.5 12h3M7.5 15.5h3M13.5 12h3M13.5 15.5h3"/>
            </svg>
          </div>
          <span class="stat-value">{{ userStore.stats?.totalDays || 0 }}</span>
          <span class="stat-label">累计天数</span>
        </div>
        <div class="stat-item">
          <div class="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 21s7-4.4 7-11a4 4 0 0 0-7-2.7A4 4 0 0 0 5 10c0 6.6 7 11 7 11z"/>
              <path d="M9.5 12.2l1.7 1.7 3.6-3.8"/>
            </svg>
          </div>
          <span class="stat-value">{{ userStore.stats?.currentStreak || 0 }}</span>
          <span class="stat-label">连续打卡</span>
        </div>
        <div class="stat-item">
          <div class="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3l2.3 4.8 5.2.7-3.8 3.7.9 5.2L12 15.9 7.4 17.4l.9-5.2L4.5 8.5l5.2-.7L12 3z"/>
              <path d="M12 2v1M4.2 6.4l.8.6M19 7l.8-.6M2.5 14h1M20.5 14h1M6 20l.6-.8M18 20l-.6-.8"/>
            </svg>
          </div>
          <span class="stat-value stat-value-ratio">
            <span class="stat-value-num">{{ userStore.lampsLit || 0 }}</span>
            <span class="stat-value-sep">/</span>
            <span class="stat-value-den">{{ userStore.lampsTotal || 49 }}</span>
          </span>
          <span class="stat-label">点亮星灯</span>
        </div>
        <div class="stat-item">
          <div class="stat-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <span class="stat-value">{{ userStore.friendsCount || 0 }}</span>
          <span class="stat-label">同行灯友</span>
        </div>
      </div>
    </section>

    <!-- 外部设备连接 -->
    <section class="devices-section">
      <div class="section-header">
        <h3 class="section-title">外部设备</h3>
        <button class="add-device-btn" @click="showAddDeviceModal = true">
          <span class="plus-icon">+</span>
          <span>添加</span>
        </button>
      </div>
      
      <div class="devices-list">
        <div 
          v-for="device in connectedDevices" 
          :key="device.id"
          class="device-card" 
          :class="{ connected: device.connected, expanded: expandedDeviceId === device.id }" 
          @click="toggleExpand(device.id)"
        >
          <div class="device-main">
            <div class="device-icon-wrapper">
              <!-- Dynamic SVG based on device type/icon -->
              <svg v-if="device.icon === 'apple'" class="device-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M12 2C8 2 6 3 6 6v12c0 3 2 4 6 4s6-1 6-4V6c0-3-2-4-6-4z"/>
                 <path d="M10 2V1"/>
                 <path d="M14 2V1"/>
              </svg>
              <svg v-else-if="device.icon === 'huawei' || device.icon === 'huawei-watch'" class="device-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <rect x="7" y="2" width="10" height="20" rx="3"/>
                 <rect x="9" y="5" width="6" height="14" rx="1"/>
              </svg>
               <svg v-else-if="device.icon === 'xiaomi'" class="device-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <rect x="8" y="2" width="8" height="20" rx="4"/>
                 <circle cx="12" cy="18" r="1" fill="currentColor"/>
              </svg>
               <svg v-else-if="device.icon === 'garmin'" class="device-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <circle cx="12" cy="12" r="9"/>
                 <path d="M12 2v20"/>
                 <path d="M2 12h20"/>
              </svg>
              <svg v-else-if="device.icon === 'fitbit'" class="device-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <rect x="6" y="4" width="12" height="16" rx="2"/>
                 <circle cx="12" cy="12" r="3"/>
              </svg>
              <!-- Fallback -->
              <svg v-else class="device-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="6" y="2" width="12" height="20" rx="2"/>
              </svg>
            </div>
            <div class="device-info">
              <span class="device-name">{{ device.name }}</span>
              <span class="device-status">
                <span v-if="device.syncing" class="status-syncing">同步中...</span>
                <span v-else>{{ device.connected ? '已连接' : '未连接' }}</span>
              </span>
            </div>
            <div class="device-actions">
               <button class="icon-btn" @click.stop="syncDevice(device, $event)" title="同步数据">
                 <svg class="sync-icon" :class="{ spinning: device.syncing }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
                 </svg>
               </button>
               <button class="icon-btn delete" @click.stop="confirmRemoveDevice(device.id, $event)" title="删除设备">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <line x1="18" y1="6" x2="6" y2="18"/>
                   <line x1="6" y1="6" x2="18" y2="18"/>
                 </svg>
               </button>
            </div>
          </div>

          <!-- Device Details (Health Data) -->
          <div v-if="expandedDeviceId === device.id && device.data" class="device-details" @click.stop>
            <div class="last-sync">上次同步: {{ formatTime(device.lastSync) }}</div>
            <div class="health-grid">
               <!-- Steps -->
               <div class="health-item">
                 <div class="health-icon steps">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                     <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 11 3.8 11 8c0 2.85-1.67 4.24-2 6.62V16a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V8"/>
                     <path d="M14 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C8.63 6 7 7.8 7 12c0 2.85 1.67 4.24 2 6.62V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2"/>
                   </svg>
                 </div>
                 <div class="health-val">{{ device.data.steps }}</div>
                 <div class="health-label">步数</div>
               </div>
               
               <!-- Heart Rate -->
               <div class="health-item">
                 <div class="health-icon heart">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                     <path d="M12 13l-1.5-2.5-2 4-2-3-2 3"/>
                   </svg>
                 </div>
                 <div class="health-val">{{ device.data.heartRate }} <span class="unit">bpm</span></div>
                 <div class="health-label">心率</div>
               </div>

               <!-- Sleep -->
               <div class="health-item">
                 <div class="health-icon sleep">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                   </svg>
                 </div>
                 <div class="health-val">{{ device.data.sleepDuration }}</div>
                 <div class="health-label">睡眠</div>
               </div>

               <!-- SpO2 -->
               <div class="health-item">
                 <div class="health-icon spo2">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                     <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
                   </svg>
                 </div>
                 <div class="health-val">{{ device.data.spo2 }}%</div>
                 <div class="health-label">血氧</div>
               </div>

               <!-- Calories -->
               <div class="health-item">
                 <div class="health-icon calories">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.3.4 1.8 1.9 2.8 2.9 2.8z"/>
                   </svg>
                 </div>
                 <div class="health-val">{{ device.data.calories }} <span class="unit">kcal</span></div>
                 <div class="health-label">卡路里</div>
               </div>

               <!-- Stand Hours -->
               <div class="health-item">
                 <div class="health-icon stand">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <circle cx="12" cy="5" r="1"/>
                     <path d="M9 20a4 4 0 0 1 6 0"/>
                     <path d="M12 20v-2"/>
                     <path d="M12 18a4 4 0 0 0 4-4v-5a4 4 0 0 0-8 0v5a4 4 0 0 0 4 4"/>
                   </svg>
                 </div>
                 <div class="health-val">{{ device.data.standHours }} <span class="unit">h</span></div>
                 <div class="health-label">站立</div>
               </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="connectedDevices.length === 0" class="empty-devices">
           <p>暂无连接设备，点击右上角添加</p>
           <button class="add-first-btn" @click="showAddDeviceModal = true">添加设备</button>
        </div>
      </div>
    </section>

    <!-- 功能菜单 -->
    <section class="menu-section">
      <!-- 模块一：基础信息 -->
      <h3 class="section-title">基础信息</h3>
      <div class="menu-group">
        <div class="menu-item" @click="showPersonalInfoModal = true">
          <div class="menu-icon-svg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <span class="menu-label">个人信息</span>
          <span class="menu-arrow">›</span>
        </div>
        <div class="menu-item" @click="showNotificationModal = true">
          <div class="menu-icon-svg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <span class="menu-label">健康通知</span>
          <span class="menu-arrow">›</span>
        </div>
        <div class="menu-item" @click="showHealthPreferencesModal = true">
          <div class="menu-icon-svg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <span class="menu-label">健康偏好</span>
          <span class="menu-arrow">›</span>
        </div>
        <div class="menu-item" @click="showSubscriptionModal = true">
          <div class="menu-icon-svg gold">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <span class="menu-label">订阅会员</span>
          <span v-if="!userStore.isUserPro" class="menu-badge gold">UP</span>
          <span v-else class="menu-sublabel">已订阅</span>
          <span class="menu-arrow">›</span>
        </div>
      </div>

      <!-- 模块二：我的数据 -->
      <h3 class="section-title">我的数据</h3>
      <div class="menu-group">
        <div class="menu-item" @click="showHistoryModal = true">
          <div class="menu-icon-svg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </div>
          <span class="menu-label">打卡记录</span>
          <span class="menu-arrow">›</span>
        </div>
        <div class="menu-item" @click="showAchievementsModal = true">
          <div class="menu-icon-svg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="8" r="6"/>
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
            </svg>
          </div>
          <span class="menu-label">健康成就</span>
          <span class="menu-arrow">›</span>
        </div>
        <div class="menu-item" @click="showReportModal = true">
          <div class="menu-icon-svg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
          </div>
          <span class="menu-label">健康报告</span>
          <span class="menu-badge">NEW</span>
          <span class="menu-arrow">›</span>
        </div>
      </div>

      <!-- 模块三：其他设置 -->
      <h3 class="section-title">其他设置</h3>
      <div class="menu-group">
        <div class="menu-item" @click="showSettingsModal = true">
          <div class="menu-icon-svg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </div>
          <span class="menu-label">系统设置</span>
          <span class="menu-arrow">›</span>
        </div>
        <div class="menu-item" @click="showFeedbackModal = true">
          <div class="menu-icon-svg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span class="menu-label">意见反馈</span>
          <span class="menu-arrow">›</span>
        </div>
        <div class="menu-item" @click="showAboutModal = true">
          <div class="menu-icon-svg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <span class="menu-label">关于我们</span>
          <span class="menu-arrow">›</span>
        </div>
        <div class="menu-item" @click="showPrivacyModal = true">
          <div class="menu-icon-svg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <span class="menu-label">隐私偏好</span>
          <span class="menu-arrow">›</span>
        </div>
      </div>

      <div class="menu-group">
        <div class="menu-item danger" @click="confirmLogout">
          <div class="menu-icon-svg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          <span class="menu-label">退出登录</span>
          <span class="menu-arrow">›</span>
        </div>
      </div>
    </section>

    <!-- 版本信息 -->
    <footer class="page-footer">
      <p>命续 · 七星灯 v1.0.0</p>
      <p>点亮星灯 · 日日续生</p>
    </footer>

    <!-- 自定义确认弹窗 -->
    <Teleport to="body">
      <div v-if="showConfirmModal" class="modal-overlay" @click.self="showConfirmModal = false">
        <div class="modal-content confirm-modal">
          <h3 class="modal-title">{{ confirmTitle }}</h3>
          <p class="confirm-message">{{ confirmMessage }}</p>
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="showConfirmModal = false">取消</button>
            <button class="modal-btn confirm" @click="handleConfirm">确定</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 自定义 Toast 提示 -->
    <Teleport to="body">
      <Transition name="toast-fade">
        <div v-if="toastVisible" class="toast-container">
          <div class="toast-message">{{ toastMessage }}</div>
        </div>
      </Transition>
    </Teleport>

    <!-- 编辑昵称弹窗 -->
    <Teleport to="body">
      <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
        <div class="modal-content">
          <h3 class="modal-title">修改昵称</h3>
          <input 
            v-model="newNickname" 
            type="text" 
            placeholder="输入新昵称"
            class="modal-input"
            maxlength="20"
          />
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="showEditModal = false">取消</button>
            <button class="modal-btn confirm" @click="updateNickname">确定</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 头像编辑弹窗 -->
    <Teleport to="body">
      <div v-if="showAvatarModal" class="modal-overlay" @click.self="showAvatarModal = false">
        <div class="modal-content avatar-modal">
          <h3 class="modal-title">更换头像</h3>
          <div class="avatar-preview-lg">
             <img v-if="userAvatar" :src="userAvatar" alt="avatar" />
             <span v-else>{{ userStore.displayName?.charAt(0) || '灯' }}</span>
          </div>
          <p class="avatar-tip">默认使用诸葛孔明画像</p>
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="showAvatarModal = false">取消</button>
            <button class="modal-btn confirm" @click="showAvatarModal = false; showToast('头像更新成功')">确定</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 隐私设置弹窗 -->
    <Teleport to="body">
      <div v-if="showPrivacyModal" class="modal-overlay" @click.self="showPrivacyModal = false">
        <div class="modal-content settings-modal">
          <h3 class="modal-title">隐私设置</h3>
          <div class="settings-list">
            <div class="settings-item">
              <span class="settings-label">公开我的主页</span>
              <label class="toggle-switch">
                <input type="checkbox" v-model="privacySettings.publicProfile" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="settings-item">
              <span class="settings-label">允许灯友查看健康数据</span>
              <label class="toggle-switch">
                <input type="checkbox" v-model="privacySettings.shareHealthData" />
                <span class="toggle-slider"></span>
              </label>
            </div>
             <div class="settings-item">
              <span class="settings-label">允许添加好友</span>
              <label class="toggle-switch">
                <input type="checkbox" v-model="privacySettings.allowFriendRequests" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="settings-item">
              <span class="settings-label">展示在线状态</span>
              <label class="toggle-switch">
                <input type="checkbox" v-model="privacySettings.showOnlineStatus" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <button class="modal-btn confirm" @click="showPrivacyModal = false; showToast('隐私设置已保存')">保存</button>
        </div>
      </div>
    </Teleport>

    <!-- 个人信息弹窗 -->
    <Teleport to="body">
      <div v-if="showPersonalInfoModal" class="modal-overlay" @click.self="showPersonalInfoModal = false">
        <div class="modal-content settings-modal">
          <h3 class="modal-title">个人信息</h3>
          <div class="form-container">
            <div class="form-group">
              <label class="form-label">性别 <span class="required">*</span></label>
              <div class="radio-group">
                <label class="radio-item" :class="{ active: personalInfoForm.gender === 'M' }">
                  <input type="radio" v-model="personalInfoForm.gender" value="M" />
                  <span>男</span>
                </label>
                <label class="radio-item" :class="{ active: personalInfoForm.gender === 'F' }">
                  <input type="radio" v-model="personalInfoForm.gender" value="F" />
                  <span>女</span>
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">出生日期</label>
              <input type="date" v-model="personalInfoForm.birthDate" class="modal-input" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">身高 (cm) <span class="required">*</span></label>
                <input type="number" v-model="personalInfoForm.heightCm" class="modal-input" />
              </div>
              <div class="form-group">
                <label class="form-label">体重 (kg) <span class="required">*</span></label>
                <input type="number" v-model="personalInfoForm.weightKg" class="modal-input" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">职业</label>
              <input type="text" v-model="personalInfoForm.occupation" placeholder="选填" class="modal-input" />
            </div>

            <div class="form-group">
              <label class="form-label">慢性病史</label>
              <div class="tags-input">
                <div class="selected-tags" v-if="personalInfoForm.chronicDiseases.length > 0">
                  <span 
                    v-for="disease in personalInfoForm.chronicDiseases" 
                    :key="disease"
                    class="tag-option active"
                    @click="personalInfoForm.chronicDiseases = personalInfoForm.chronicDiseases.filter(d => d !== disease)"
                  >
                    {{ disease }} <span class="tag-remove">×</span>
                  </span>
                </div>
                <div class="tag-options">
                  <span 
                    v-for="disease in chronicDiseaseOptions" 
                    :key="disease"
                    class="tag-option"
                    :class="{ active: personalInfoForm.chronicDiseases.includes(disease) }"
                    @click="toggleDisease(disease)"
                  >
                    {{ disease }}
                  </span>
                </div>
                <div class="custom-input-wrapper">
                  <input 
                    type="text" 
                    v-model="customDisease" 
                    placeholder="或输入其他病史"
                    class="modal-input custom-input"
                    @keydown.enter.prevent="addCustomDisease"
                  />
                  <button class="add-custom-btn" @click="addCustomDisease" :disabled="!customDisease.trim()">
                    添加
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="showPersonalInfoModal = false">取消</button>
            <button class="modal-btn confirm" @click="savePersonalInfo">保存</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 健康偏好弹窗 -->
    <Teleport to="body">
      <div v-if="showHealthPreferencesModal" class="modal-overlay" @click.self="showHealthPreferencesModal = false">
        <div class="modal-content settings-modal health-pref-modal">
          <h3 class="modal-title">健康偏好</h3>
          <div class="form-container">
            <!-- 健康目标 -->
            <div class="form-group">
              <label class="form-label">
                <svg class="label-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
                健康目标
              </label>
              <div class="tag-options">
                <span 
                  v-for="goal in healthGoalOptions" 
                  :key="goal.value"
                  class="tag-option"
                  :class="{ active: healthPrefForm.goals.includes(goal.value) }"
                  @click="toggleHealthGoal(goal.value)"
                >
                  {{ goal.label }}
                </span>
              </div>
            </div>

            <!-- 睡眠习惯 -->
            <div class="form-group">
              <label class="form-label">
                <svg class="label-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                睡眠习惯
              </label>
              <div class="pill-selector">
                <span 
                  v-for="pattern in sleepPatternOptions" 
                  :key="pattern.value"
                  class="pill-item"
                  :class="{ active: healthPrefForm.sleepPattern === pattern.value }"
                  @click="healthPrefForm.sleepPattern = pattern.value"
                >
                  {{ pattern.label }}
                </span>
              </div>
            </div>

            <!-- 运动频率 -->
            <div class="form-group">
              <label class="form-label">
                <svg class="label-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 11 3.8 11 8c0 2.85-1.67 4.24-2 6.62V16a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V8"/>
                  <path d="M14 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C8.63 6 7 7.8 7 12c0 2.85 1.67 4.24 2 6.62V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2"/>
                </svg>
                运动频率
              </label>
              <div class="pill-selector">
                <span 
                  v-for="freq in exerciseFreqOptions" 
                  :key="freq.value"
                  class="pill-item"
                  :class="{ active: healthPrefForm.exerciseFreq === freq.value }"
                  @click="healthPrefForm.exerciseFreq = freq.value"
                >
                  {{ freq.label }}
                </span>
              </div>
            </div>

            <!-- 饮食习惯 -->
            <div class="form-group">
              <label class="form-label">
                <svg class="label-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
                  <path d="M7 2v20"/>
                  <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
                </svg>
                饮食习惯
              </label>
              <div class="pill-selector">
                <span 
                  v-for="diet in dietHabitOptions" 
                  :key="diet.value"
                  class="pill-item"
                  :class="{ active: healthPrefForm.dietHabit === diet.value }"
                  @click="healthPrefForm.dietHabit = diet.value"
                >
                  {{ diet.label }}
                </span>
              </div>
            </div>

            <!-- 每日饮水量 -->
            <div class="form-group">
              <label class="form-label">
                <svg class="label-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
                每日饮水量
              </label>
              <div class="water-slider-container">
                <input 
                  type="range" 
                  min="1" 
                  max="8" 
                  step="0.5"
                  v-model.number="healthPrefForm.waterIntake"
                  class="water-slider"
                />
                <div class="water-labels">
                  <span v-for="n in 8" :key="n" :class="{ active: healthPrefForm.waterIntake >= n }">
                    {{ n }}杯
                  </span>
                </div>
                <div class="water-display">
                  约 {{ healthPrefForm.waterIntake * 250 }}ml
                </div>
              </div>
            </div>

            <!-- 工作类型 -->
            <div class="form-group">
              <label class="form-label">
                <svg class="label-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                工作类型
              </label>
              <div class="pill-selector">
                <span 
                  v-for="work in workTypeOptions" 
                  :key="work.value"
                  class="pill-item"
                  :class="{ active: healthPrefForm.workType === work.value }"
                  @click="healthPrefForm.workType = work.value"
                >
                  {{ work.label }}
                </span>
              </div>
            </div>

            <!-- 生活习惯 -->
            <div class="form-group">
              <label class="form-label">
                <svg class="label-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                生活习惯
              </label>
              <div class="habit-grid">
                <label class="habit-item" :class="{ active: healthPrefForm.smoke }">
                  <input type="checkbox" v-model="healthPrefForm.smoke" />
                  <span class="habit-icon">
                    <svg v-if="healthPrefForm.smoke" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 16h-1a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1M6 16H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1"/>
                      <path d="M12 11v6M9 14h6"/>
                      <line x1="3" y1="3" x2="21" y2="21"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                    </svg>
                  </span>
                  <span class="habit-text">{{ healthPrefForm.smoke ? '有吸烟习惯' : '不吸烟' }}</span>
                </label>
                <label class="habit-item" :class="{ active: healthPrefForm.drink }">
                  <input type="checkbox" v-model="healthPrefForm.drink" />
                  <span class="habit-icon">
                    <svg v-if="healthPrefForm.drink" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9h.01M9 13h.01M9 17h.01"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 3h18M5 21V7l8-4v18M19 21V11l-6-4"/>
                    </svg>
                  </span>
                  <span class="habit-text">{{ healthPrefForm.drink ? '有饮酒习惯' : '不饮酒' }}</span>
                </label>
                <label class="habit-item" :class="{ active: healthPrefForm.lateNight }">
                  <input type="checkbox" v-model="healthPrefForm.lateNight" />
                  <span class="habit-icon">
                    <svg v-if="healthPrefForm.lateNight" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 18a5 5 0 0 0-10 0"/>
                      <line x1="12" y1="2" x2="12" y2="9"/>
                      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/>
                      <line x1="1" y1="18" x2="3" y2="18"/>
                      <line x1="21" y1="18" x2="23" y2="18"/>
                      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>
                    </svg>
                  </span>
                  <span class="habit-text">{{ healthPrefForm.lateNight ? '熬夜玩手机' : '较少熬夜' }}</span>
                </label>
                <label class="habit-item" :class="{ active: healthPrefForm.regularMeals }">
                  <input type="checkbox" v-model="healthPrefForm.regularMeals" />
                  <span class="habit-icon">
                    <svg v-if="healthPrefForm.regularMeals" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
                      <path d="M7 2v20"/>
                      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
                      <path d="M7 2v20"/>
                      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
                    </svg>
                  </span>
                  <span class="habit-text">{{ healthPrefForm.regularMeals ? '饮食较规律' : '饮食不规律' }}</span>
                </label>
              </div>
            </div>

            <!-- 健康关注点 -->
            <div class="form-group">
              <label class="form-label">
                <svg class="label-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                健康关注点
              </label>
              <div class="concern-tags">
                <span 
                  v-for="concern in healthConcernOptions" 
                  :key="concern.value"
                  class="concern-tag"
                  :class="{ active: healthPrefForm.healthConcerns.includes(concern.value) }"
                  @click="toggleHealthConcern(concern.value)"
                >
                  <svg class="concern-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <template v-if="concern.value === 'heart'">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </template>
                    <template v-else-if="concern.value === 'bones'">
                      <path d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5c.7 0 1.69 0 2.5 0a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5c-.81 0-1.8 0-2.5 0"/>
                      <path d="M5 12h14"/>
                    </template>
                    <template v-else-if="concern.value === 'weight'">
                      <path d="M12 2v20M5 8l7-4 7 4M4 18h16"/>
                    </template>
                    <template v-else-if="concern.value === 'digestive'">
                      <path d="M7 2v20M3 10h18M10 2c1 1 2 2 2 4M14 2c-1 1-2 2-2 4"/>
                    </template>
                    <template v-else-if="concern.value === 'respiratory'">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </template>
                    <template v-else-if="concern.value === 'mental'">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                      <line x1="9" y1="9" x2="9.01" y2="9"/>
                      <line x1="15" y1="9" x2="15.01" y2="9"/>
                    </template>
                    <template v-else-if="concern.value === 'immune'">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </template>
                    <template v-else-if="concern.value === 'sleep'">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </template>
                  </svg>
                  {{ concern.label }}
                </span>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="showHealthPreferencesModal = false">取消</button>
            <button class="modal-btn confirm" @click="saveHealthPref">保存</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 健康报告导出弹窗 -->
    <Teleport to="body">
      <div v-if="showReportModal" class="modal-overlay" @click.self="showReportModal = false">
        <div class="modal-content report-modal">
          <h3 class="modal-title">导出健康报告</h3>
          <div class="report-options">
            <div class="report-option" :class="{ active: reportType === 'daily' }" @click="reportType = 'daily'">
              <div class="option-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                   <line x1="16" y1="2" x2="16" y2="6"/>
                   <line x1="8" y1="2" x2="8" y2="6"/>
                   <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <span>日报</span>
            </div>
            <div class="report-option" :class="{ active: reportType === 'weekly' }" @click="reportType = 'weekly'">
              <div class="option-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                   <line x1="16" y1="2" x2="16" y2="6"/>
                   <line x1="8" y1="2" x2="8" y2="6"/>
                   <line x1="3" y1="10" x2="21" y2="10"/>
                   <circle cx="12" cy="16" r="2"/>
                </svg>
              </div>
              <span>周报</span>
            </div>
             <div class="report-option" :class="{ active: reportType === 'monthly' }" @click="reportType = 'monthly'">
              <div class="option-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                   <line x1="16" y1="2" x2="16" y2="6"/>
                   <line x1="8" y1="2" x2="8" y2="6"/>
                   <line x1="3" y1="10" x2="21" y2="10"/>
                   <path d="M8 14h8"/>
                   <path d="M8 18h8"/>
                </svg>
              </div>
              <span>月报</span>
            </div>
          </div>
          <div class="report-preview">
            <p>将导出 {{ reportType === 'daily' ? '今日' : reportType === 'weekly' ? '本周' : '本月' }} 的健康数据概览，包含步数、心率、睡眠等核心指标分析。</p>
          </div>
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="showReportModal = false">取消</button>
            <button class="modal-btn confirm" @click="exportReport">
              {{ exporting ? '导出中...' : '确认导出' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 成就徽章弹窗 -->
    <Teleport to="body">
      <div v-if="showAchievementsModal" class="modal-overlay" @click.self="showAchievementsModal = false">
        <div class="modal-content achievements-modal">
          <h3 class="modal-title">成就徽章</h3>
          <div class="badges-grid">
            <div v-for="badge in badges" :key="badge.id" class="badge-item" :class="{ locked: !badge.unlocked }">
              <div class="badge-icon">
                 <!-- Simple dynamic badge icon -->
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <circle cx="12" cy="12" r="10"/>
                   <path v-if="badge.unlocked" d="M8 12l2 2 4-4"/>
                   <path v-else d="M12 8v4l3 3"/>
                 </svg>
              </div>
              <span class="badge-name">{{ badge.name }}</span>
              <span class="badge-desc">{{ badge.desc }}</span>
            </div>
          </div>
          <button class="modal-btn confirm" @click="showAchievementsModal = false">关闭</button>
        </div>
      </div>
    </Teleport>

    <!-- 添加设备弹窗 -->
    <Teleport to="body">
      <div v-if="showAddDeviceModal" class="modal-overlay" @click.self="showAddDeviceModal = false">
        <div class="modal-content device-modal">
          <h3 class="modal-title">选择设备</h3>
          <div class="available-devices-list">
            <div 
              v-for="item in availableDevices" 
              :key="item.id" 
              class="device-option"
              :class="{ 
                'is-added': connectedDevices.some(d => d.id === item.id),
                'is-adding': addingDeviceId === item.id 
              }"
              @click="addDevice(item)"
            >
               <div class="device-option-icon">
                 <svg v-if="addingDeviceId === item.id" class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                 </svg>
                 <template v-else>
                   <svg v-if="item.type === 'watch'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="2"/></svg>
                   <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="2" width="8" height="20" rx="4"/></svg>
                 </template>
               </div>
               <span class="device-option-name">{{ item.name }}</span>
               <span v-if="addingDeviceId === item.id" class="adding-text">连接中...</span>
               <span v-else-if="connectedDevices.some(d => d.id === item.id)" class="added-badge">已添加</span>
            </div>
          </div>
          <button class="modal-btn cancel" @click="showAddDeviceModal = false">取消</button>
        </div>
      </div>
    </Teleport>

    <!-- 关于弹窗 -->
    <Teleport to="body">
      <div v-if="showAboutModal" class="modal-overlay" @click.self="showAboutModal = false">
        <div class="modal-content about-modal">
          <div class="about-logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#D4AF37" stroke="#D4AF37" stroke-width="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <h3 class="about-title">命续 · 七星灯</h3>
          <p class="about-slogan">点亮星灯 · 日日续生</p>
          <div class="about-desc">
            <p>七星灯源自道家养生智慧，</p>
            <p>通过每日三问，关注身心健康，</p>
            <p>点亮七盏星灯，延年益寿。</p>
          </div>
          <p class="about-version">版本 1.0.0</p>
          <button class="modal-btn confirm" @click="showAboutModal = false">知道了</button>
        </div>
      </div>
    </Teleport>

    <!-- 打卡记录弹窗 -->
    <Teleport to="body">
      <div v-if="showHistoryModal" class="modal-overlay" @click.self="showHistoryModal = false">
        <div class="modal-content history-modal">
          <h3 class="modal-title">打卡记录</h3>
          <div v-if="checkinHistory.length === 0" class="empty-history">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8C735A" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <p>暂无打卡记录</p>
          </div>
          <div v-else class="history-list">
            <div v-for="record in checkinHistory" :key="record.id" class="history-item">
              <div class="history-date">{{ formatDate(record.createdAt) }}</div>
              <div class="history-question">{{ record.question }}</div>
              <div class="history-answer">{{ record.answerText }}</div>
              <div class="history-result" :class="{ valid: record.isValid }">
                {{ record.isValid ? '✓ 有效' : '✗ 无效' }} · {{ record.aiReply }}
              </div>
            </div>
          </div>
          <button class="modal-btn confirm" @click="showHistoryModal = false">关闭</button>
        </div>
      </div>
    </Teleport>

    <!-- 订阅弹窗 (Updated) -->
    <Teleport to="body">
      <div v-if="showSubscriptionModal" class="modal-overlay" @click.self="showSubscriptionModal = false">
        <div class="modal-content sub-modal wide-modal">
          <div class="sub-header">
            <div class="sub-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3 class="sub-title">升级 PRO 会员</h3>
            <p class="sub-desc">解锁全部高级功能，享受极致体验</p>
          </div>
          
          <div class="sub-features">
            <div class="feature-item">
              <span class="feature-icon-svg">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </span>
              <div class="feature-text">
                <span class="feature-title">每日 20 次问答</span>
                <span class="feature-desc">突破限制，畅享 AI 智慧</span>
              </div>
            </div>
            <div class="feature-item">
              <span class="feature-icon-svg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
              </span>
              <div class="feature-text">
                <span class="feature-title">每日健康报告</span>
                <span class="feature-desc">深度分析，即时掌握状态</span>
              </div>
            </div>
            <div class="feature-item">
              <span class="feature-icon-svg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </span>
              <div class="feature-text">
                <span class="feature-title">周/月报自动推送</span>
                <span class="feature-desc">长期趋势，一目了然</span>
              </div>
            </div>
            <div class="feature-item">
              <span class="feature-icon-svg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </span>
              <div class="feature-text">
                <span class="feature-title">灯友上限提升</span>
                <span class="feature-desc">结识更多志同道合的伙伴</span>
              </div>
            </div>
             <div class="feature-item">
              <span class="feature-icon-svg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/></svg>
              </span>
              <div class="feature-text">
                <span class="feature-title">专属灯阵皮肤</span>
                <span class="feature-desc">个性化展示，与众不同</span>
              </div>
            </div>
          </div>
          
          <div class="sub-price-card">
            <div class="price-val">
              <span class="currency">¥</span>
              <span class="amount">20</span>
              <span class="period">/月</span>
            </div>
            <div class="price-tip">首月特惠，随时取消</div>
          </div>
          
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="showSubscriptionModal = false">暂不考虑</button>
            <button class="modal-btn confirm sub-btn" @click="handleSubscribe">
              <span v-if="subscribing">处理中...</span>
              <span v-else>立即开通</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 设置弹窗 -->
    <Teleport to="body">
      <div v-if="showSettingsModal" class="modal-overlay" @click.self="showSettingsModal = false">
        <div class="modal-content settings-modal">
          <h3 class="modal-title">设置</h3>
          <div class="settings-list">
            <div class="settings-item">
              <span class="settings-label">消息通知</span>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.notifications" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="settings-item">
              <span class="settings-label">每日提醒</span>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.dailyReminder" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="settings-item">
              <span class="settings-label">深色模式</span>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.darkMode" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="settings-item">
              <span class="settings-label">清除缓存</span>
              <button class="settings-btn" @click="confirmClearCache">清除</button>
            </div>
          </div>
          <button class="modal-btn confirm" @click="showSettingsModal = false">完成</button>
        </div>
      </div>
    </Teleport>
    <Teleport to="body">
      <div v-if="showNotificationModal" class="modal-overlay" @click.self="showNotificationModal = false">
        <div class="modal-content settings-modal">
          <h3 class="modal-title">健康通知</h3>
          <div class="settings-list">
            <div class="settings-item">
              <span class="settings-label">每日签到提醒</span>
              <label class="toggle-switch">
                <input type="checkbox" v-model="notificationSettings.checkin" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div class="divider"></div>
            <h4 class="subsettings-title">维度推送</h4>
            
            <div class="settings-item" v-for="(dim, id) in dimensionInfo" :key="id">
              <div class="dimension-label">
                <span class="dimension-name">{{ dim.name }}</span>
                <span class="dimension-desc">{{ dim.desc }}</span>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="notificationSettings.dimensions[id]" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="showNotificationModal = false">取消</button>
            <button class="modal-btn confirm" @click="saveNotificationSettings">保存</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useUserStore } from '~/stores/user'

definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const userStore = useUserStore()

const showEditModal = ref(false)
const showHistoryModal = ref(false)
const showSettingsModal = ref(false)
const showAboutModal = ref(false)
const showReportModal = ref(false)
const showAchievementsModal = ref(false)
const showFeedbackModal = ref(false)
const showAddDeviceModal = ref(false)
const showSubscriptionModal = ref(false)
const subscribing = ref(false)
const newNickname = ref('')
const addingDeviceId = ref<string | null>(null)
const showAvatarModal = ref(false)
const showPrivacyModal = ref(false)
const showPersonalInfoModal = ref(false)
const showHealthPreferencesModal = ref(false)
const showNotificationModal = ref(false)

// 维度信息配置
const dimensionInfo: Record<string, { name: string; desc: string }> = {
  1: { name: '天枢 · 命火', desc: '关注每日坚持，点灯续命' },
  2: { name: '天璇 · 谷神', desc: '饮食营养，健康基石' },
  3: { name: '天玑 · 动静', desc: '适量运动，身心平衡' },
  4: { name: '天权 · 归根', desc: '规律作息，顺应天时' },
  5: { name: '玉衡 · 调息', desc: '呼吸冥想，静心养神' },
  6: { name: '开阳 · 营卫', desc: '提升免疫，增强体质' },
  7: { name: '摇光 · 固表', desc: '外在防护，内在调和' }
}

// 慢性病史选项
const chronicDiseaseOptions = ['高血压', '糖尿病', '心脏病', '哮喘']
const customDisease = ref('')

// 切换慢性病选择
const toggleDisease = (disease: string) => {
  if (personalInfoForm.chronicDiseases.includes(disease)) {
    personalInfoForm.chronicDiseases = personalInfoForm.chronicDiseases.filter(d => d !== disease)
  } else {
    personalInfoForm.chronicDiseases.push(disease)
  }
}

// 添加自定义慢性病
const addCustomDisease = () => {
  const disease = customDisease.value.trim()
  if (disease && !personalInfoForm.chronicDiseases.includes(disease)) {
    personalInfoForm.chronicDiseases.push(disease)
    customDisease.value = ''
  }
}

// 健康通知设置
const notificationSettings = reactive({
  checkin: true,
  dimensions: {
    1: true, // 天枢
    2: true, // 天璇
    3: true, // 天玑
    4: true, // 天权
    5: true, // 玉衡
    6: true, // 开阳
    7: true  // 摇光
  } as Record<string | number, boolean>
})

// 个人信息表单
const personalInfoForm = reactive({
  gender: 'M',
  birthDate: '',
  heightCm: 170,
  weightKg: 65,
  occupation: '',
  chronicDiseases: [] as string[]
})

// 健康偏好表单
const healthPrefForm = reactive({
  goals: [] as string[],
  sleepPattern: 'early_bird',
  dietHabit: 'balanced',
  exerciseFreq: 'moderate',
  waterIntake: 6,
  workType: 'office',
  smoke: false,
  drink: false,
  lateNight: false,
  regularMeals: true,
  healthConcerns: [] as string[]
})

// 健康偏好选项配置
const healthGoalOptions = [
  { value: 'weight_loss', label: '减肥瘦身' },
  { value: 'sleep', label: '改善睡眠' },
  { value: 'stress', label: '缓解压力' },
  { value: 'fitness', label: '增强体质' },
  { value: 'chronic', label: '慢病管理' },
  { value: 'energy', label: '提升精力' },
  { value: 'mood', label: '改善情绪' }
]

const sleepPatternOptions = [
  { value: 'early_bird', label: '早睡早起' },
  { value: 'night_owl', label: '晚睡晚起' },
  { value: 'irregular', label: '作息不规律' },
  { value: 'shift', label: '轮班倒' }
]

const exerciseFreqOptions = [
  { value: 'none', label: '几乎不运动' },
  { value: 'light', label: '偶尔散步' },
  { value: 'moderate', label: '每周2-3次' },
  { value: 'active', label: '每周4-5次' },
  { value: 'daily', label: '每天运动' }
]

const dietHabitOptions = [
  { value: 'balanced', label: '均衡饮食' },
  { value: 'vegetarian', label: '素食为主' },
  { value: 'low_carb', label: '低碳水' },
  { value: 'high_protein', label: '高蛋白' },
  { value: 'irregular', label: '饮食不规律' }
]

const workTypeOptions = [
  { value: 'office', label: '办公室久坐' },
  { value: 'standing', label: '站立工作' },
  { value: 'physical', label: '体力劳动' },
  { value: 'mixed', label: '走动较多' },
  { value: 'freelance', label: '自由职业' }
]

const healthConcernOptions = [
  { value: 'heart', label: '心血管', icon: '❤️' },
  { value: 'bones', label: '骨骼关节', icon: '🦴' },
  { value: 'weight', label: '体重管理', icon: '⚖️' },
  { value: 'digestive', label: '消化系统', icon: '🍽️' },
  { value: 'respiratory', label: '呼吸系统', icon: '🫁' },
  { value: 'mental', label: '心理健康', icon: '🧠' },
  { value: 'immune', label: '免疫力', icon: '🛡️' },
  { value: 'sleep', label: '睡眠质量', icon: '😴' }
]

const toggleHealthGoal = (goal: string) => {
  if (healthPrefForm.goals.includes(goal)) {
    healthPrefForm.goals = healthPrefForm.goals.filter(g => g !== goal)
  } else {
    healthPrefForm.goals.push(goal)
  }
}

const toggleHealthConcern = (concern: string) => {
  if (healthPrefForm.healthConcerns.includes(concern)) {
    healthPrefForm.healthConcerns = healthPrefForm.healthConcerns.filter(c => c !== concern)
  } else {
    healthPrefForm.healthConcerns.push(concern)
  }
}

// 初始化表单数据
watch(() => userStore.profile, (newProfile) => {
  if (newProfile) {
    personalInfoForm.gender = newProfile.gender || 'M'
    personalInfoForm.birthDate = newProfile.birthDate || ''
    personalInfoForm.heightCm = newProfile.heightCm || 170
    personalInfoForm.weightKg = newProfile.weightKg || 65
    personalInfoForm.occupation = newProfile.occupation || ''
    personalInfoForm.chronicDiseases = newProfile.chronicDiseases || []
    
    // 兼容新旧数据格式
    healthPrefForm.goals = newProfile.goals || []
    
    // 睡眠模式映射
    const sleepMap: Record<string, string> = {
      '早睡早起': 'early_bird',
      '晚睡晚起': 'night_owl',
      '熬夜': 'irregular',
      '轮班': 'shift'
    }
    healthPrefForm.sleepPattern = sleepMap[newProfile.sleepPattern || ''] || newProfile.sleepPattern || 'early_bird'
    
    // 饮食习惯映射
    const dietMap: Record<string, string> = {
      '均衡': 'balanced',
      '素食': 'vegetarian',
      '低碳水': 'low_carb',
      '高蛋白': 'high_protein'
    }
    healthPrefForm.dietHabit = dietMap[newProfile.dietHabit || ''] || newProfile.dietHabit || 'balanced'
    
    // 运动频率映射
    const exerciseMap: Record<string, string> = {
      '几乎不运动': 'none',
      '每周1-2次': 'light',
      '每周2-3次': 'moderate',
      '每周3-5次': 'active',
      '每天': 'daily'
    }
    healthPrefForm.exerciseFreq = exerciseMap[newProfile.exerciseFreq || ''] || newProfile.exerciseFreq || 'moderate'
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    healthPrefForm.waterIntake = (newProfile as any).waterIntake || 6
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    healthPrefForm.workType = (newProfile as any).workType || 'office'
    healthPrefForm.smoke = newProfile.smokeDrink?.smoke || false
    healthPrefForm.drink = newProfile.smokeDrink?.drink || false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    healthPrefForm.lateNight = (newProfile as any).lateNight || false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    healthPrefForm.regularMeals = (newProfile as any).regularMeals !== false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    healthPrefForm.healthConcerns = (newProfile as any).healthConcerns || []
    
    if (newProfile.notificationSettings) {
      notificationSettings.checkin = newProfile.notificationSettings.checkin
      notificationSettings.dimensions = { ...newProfile.notificationSettings.dimensions }
    }
  }
}, { immediate: true, deep: true })

// 保存健康通知设置
const saveNotificationSettings = async () => {
  await userStore.updateProfile({
    notificationSettings: {
      checkin: notificationSettings.checkin,
      dimensions: notificationSettings.dimensions
    }
  })
  showNotificationModal.value = false
  showToast('健康通知设置已保存')
}

// 保存个人信息
const savePersonalInfo = async () => {
  if (!personalInfoForm.gender || !personalInfoForm.heightCm || !personalInfoForm.weightKg) {
    showToast('请填写必填项')
    return
  }
  
  await userStore.updateProfile({
    gender: personalInfoForm.gender,
    birthDate: personalInfoForm.birthDate,
    heightCm: personalInfoForm.heightCm,
    weightKg: personalInfoForm.weightKg,
    occupation: personalInfoForm.occupation,
    chronicDiseases: personalInfoForm.chronicDiseases
  })
  
  showPersonalInfoModal.value = false
  showToast('个人信息已保存')
}

// 保存健康偏好
const saveHealthPref = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await userStore.updateProfile({
    goals: healthPrefForm.goals,
    sleepPattern: healthPrefForm.sleepPattern,
    dietHabit: healthPrefForm.dietHabit,
    exerciseFreq: healthPrefForm.exerciseFreq,
    waterIntake: healthPrefForm.waterIntake,
    workType: healthPrefForm.workType,
    smokeDrink: { smoke: healthPrefForm.smoke, drink: healthPrefForm.drink },
    lateNight: healthPrefForm.lateNight,
    regularMeals: healthPrefForm.regularMeals,
    healthConcerns: healthPrefForm.healthConcerns
  } as any)
  
  showHealthPreferencesModal.value = false
  showToast('健康偏好已保存')
}

// 默认头像 (SVG)
const defaultAvatar = 'data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'45\' fill=\'#F3E9D2\' stroke=\'#2C241B\' stroke-width=\'2\'/%3E%3Cpath d=\'M20 35 Q50 10 80 35\' fill=\'none\' stroke=\'#2C241B\' stroke-width=\'2\'/%3E%3Crect x=\'25\' y=\'15\' width=\'50\' height=\'20\' fill=\'#2C241B\' rx=\'2\'/%3E%3Ccircle cx=\'35\' cy=\'50\' r=\'3\' fill=\'#2C241B\'/%3E%3Ccircle cx=\'65\' cy=\'50\' r=\'3\' fill=\'#2C241B\'/%3E%3Cpath d=\'M45 60 Q50 65 55 60\' fill=\'none\' stroke=\'#2C241B\' stroke-width=\'2\'/%3E%3Cpath d=\'M30 75 Q50 90 70 75\' fill=\'none\' stroke=\'#2C241B\' stroke-width=\'2\'/%3E%3C/svg%3E'

// 用户头像
const userAvatar = computed(() => {
  return userStore.user?.avatarUrl || defaultAvatar
})

// 隐私设置
const privacySettings = reactive({
  publicProfile: true,
  shareHealthData: false,
  allowFriendRequests: true,
  showOnlineStatus: true
})

// 报告导出
const reportType = ref('daily')
const exporting = ref(false)
const exportReport = () => {
  exporting.value = true
  
  // 模拟数据生成
  const date = new Date().toLocaleDateString()
  const period = reportType.value === 'daily' ? '日报' : reportType.value === 'weekly' ? '周报' : '月报'
  const steps = Math.floor(Math.random() * 5000) + 5000
  const sleep = (Math.random() * 2 + 6).toFixed(1)
  const score = Math.floor(Math.random() * 20) + 80
  
  const content = `
七星灯健康报告 - ${period}
日期: ${date}
------------------------
综合健康分: ${score}

核心指标:
- 步数: ${steps} 步
- 睡眠时长: ${sleep} 小时
- 平均心率: ${Math.floor(Math.random() * 20) + 60} bpm
- 消耗热量: ${Math.floor(Math.random() * 300) + 1500} kcal

AI 建议:
保持良好的作息习惯，适当增加有氧运动。
  `.trim()

  setTimeout(() => {
    // 创建 Blob 并下载
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `health-report-${reportType.value}-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    exporting.value = false
    showReportModal.value = false
    showToast(`${period}导出成功`)
  }, 1500)
}

// 成就徽章
const badges = [
  { id: 1, name: '初入灯途', unlocked: true, desc: '累计点灯7天' },
  { id: 2, name: '持之以恒', unlocked: true, desc: '连续打卡30天' },
  { id: 3, name: '养生大师', unlocked: false, desc: '连接3个以上健康设备' },
  { id: 4, name: '灯火阑珊', unlocked: false, desc: '深夜点灯10次' },
  { id: 5, name: '七星高照', unlocked: false, desc: '连续7天获得满分健康分' },
  { id: 6, name: '众星捧月', unlocked: false, desc: '拥有10位以上灯友' }
]

// 自定义确认弹窗状态
const showConfirmModal = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmAction = ref<(() => void) | null>(null)

const openConfirm = (title: string, message: string, action: () => void) => {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmAction.value = action
  showConfirmModal.value = true
}

const handleConfirm = () => {
  if (confirmAction.value) {
    confirmAction.value()
  }
  showConfirmModal.value = false
}

// 自定义 Toast 状态
const toastVisible = ref(false)
const toastMessage = ref('')

const showToast = (message: string) => {
  toastMessage.value = message
  toastVisible.value = true
  setTimeout(() => {
    toastVisible.value = false
  }, 2000)
}

// 打卡记录
const checkinHistory = ref<any[]>([])

// 可扩展的设备列表
interface HealthData {
  steps: number
  heartRate: number
  sleepDuration: string
  spo2: number
  calories: number
  standHours: number
}

interface Device {
  id: string
  name: string
  type: 'watch' | 'band' | 'health'
  icon: string
  connected: boolean
  syncing: boolean
  lastSync?: Date
  data?: HealthData
}

const expandedDeviceId = ref<string | null>(null)

// 预设可用设备
const availableDevices = [
  { id: 'apple-watch', name: 'Apple Watch', type: 'watch', icon: 'apple' },
  { id: 'huawei-band', name: '华为手环', type: 'band', icon: 'huawei' },
  { id: 'xiaomi-band', name: '小米手环', type: 'band', icon: 'xiaomi' },
  { id: 'huawei-watch', name: '华为 Watch GT', type: 'watch', icon: 'huawei-watch' },
  { id: 'garmin', name: 'Garmin Forerunner', type: 'watch', icon: 'garmin' },
  { id: 'fitbit', name: 'Fitbit Charge', type: 'band', icon: 'fitbit' }
] as const

const connectedDevices = ref<Device[]>([])
let deviceSyncTimer: any = null

// 模拟生成健康数据
const generateHealthData = (): HealthData => ({
  steps: Math.floor(Math.random() * 8000) + 2000,
  heartRate: Math.floor(Math.random() * 30) + 60,
  sleepDuration: `${Math.floor(Math.random() * 2) + 6}小时${Math.floor(Math.random() * 60)}分`,
  spo2: Math.floor(Math.random() * 3) + 96,
  calories: Math.floor(Math.random() * 400) + 150,
  standHours: Math.floor(Math.random() * 6) + 6
})

// 初始化设备数据（从 localStorage 加载）
const initDevices = () => {
  if (process.client) {
    const fromServer = (userStore.profile as any)?.connectedDevices
    if (Array.isArray(fromServer) && fromServer.length) {
      connectedDevices.value = fromServer.map((d: any) => ({
        ...d,
        lastSync: d.lastSync ? new Date(d.lastSync) : undefined
      }))
      return
    }
    const saved = localStorage.getItem('connected_devices')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // 恢复 Date 对象
        connectedDevices.value = parsed.map((d: any) => ({
          ...d,
          lastSync: d.lastSync ? new Date(d.lastSync) : undefined
        }))
      } catch (e) {
        console.error('Failed to parse saved devices', e)
      }
    }
  }
}

// 监听设备变化并保存
watch(connectedDevices, (newVal) => {
  if (process.client) {
    localStorage.setItem('connected_devices', JSON.stringify(newVal))
  }
  if (userStore.isLoggedIn) {
    if (deviceSyncTimer) clearTimeout(deviceSyncTimer)
    deviceSyncTimer = setTimeout(() => {
      userStore.updateProfile({ connectedDevices: newVal } as any)
    }, 500)
  }
}, { deep: true })

// 添加设备
const addDevice = (deviceTemplate: typeof availableDevices[number]) => {
  // 避免重复添加或正在添加中
  if (connectedDevices.value.some(d => d.id === deviceTemplate.id) || addingDeviceId.value) {
    return
  }
  
  addingDeviceId.value = deviceTemplate.id
  
  // 模拟1秒连接延迟
  setTimeout(() => {
    const newDevice: Device = {
      ...deviceTemplate,
      connected: true,
      syncing: false,
      type: deviceTemplate.type as any,
      lastSync: new Date(),
      data: generateHealthData()
    }
    
    connectedDevices.value.push(newDevice)
    showAddDeviceModal.value = false
    expandedDeviceId.value = newDevice.id // 自动展开新设备
    showToast(`${newDevice.name} 连接成功`)
    
    // 重置状态
    addingDeviceId.value = null
  }, 1000)
}

// 同步设备数据
const syncDevice = (device: Device, event?: Event) => {
  event?.stopPropagation()
  if (device.syncing) return
  
  device.syncing = true
  setTimeout(() => {
    device.syncing = false
    device.lastSync = new Date()
    device.data = generateHealthData() // 更新数据
    showToast('数据同步完成')
  }, 1500)
}

// 移除设备
const confirmRemoveDevice = (deviceId: string, event?: Event) => {
  event?.stopPropagation()
  openConfirm('移除设备', '确定要移除该设备吗？', () => {
    connectedDevices.value = connectedDevices.value.filter(d => d.id !== deviceId)
    if (expandedDeviceId.value === deviceId) {
      expandedDeviceId.value = null
    }
    showToast('设备已移除')
  })
}

// 展开/收起设备详情
const toggleExpand = (deviceId: string) => {
  expandedDeviceId.value = expandedDeviceId.value === deviceId ? null : deviceId
}

// 格式化同步时间
const formatTime = (date?: Date) => {
  if (!date) return '--:--'
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 设置
const settings = reactive({
  notifications: true,
  dailyReminder: true,
  darkMode: false
})

let privacySyncTimer: any = null
let settingsSyncTimer: any = null

watch(privacySettings, (val) => {
  if (!userStore.isLoggedIn) return
  if (privacySyncTimer) clearTimeout(privacySyncTimer)
  privacySyncTimer = setTimeout(() => {
    userStore.updateProfile({ privacySettings: val } as any)
  }, 500)
}, { deep: true })

watch(settings, (val) => {
  if (!userStore.isLoggedIn) return
  if (settingsSyncTimer) clearTimeout(settingsSyncTimer)
  settingsSyncTimer = setTimeout(() => {
    userStore.updateProfile({ settings: val } as any)
  }, 500)
}, { deep: true })

const maskedPhone = computed(() => {
  const phone = userStore.user?.phone
  if (!phone) return '未绑定手机'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
})

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取打卡记录
const fetchCheckinHistory = async () => {
  try {
    const { data } = await useFetch('/api/checkin/history')
    const result = data.value as any
    if (result?.success) {
      checkinHistory.value = result.data || []
    }
  } catch (e) {
    console.error('获取打卡记录失败:', e)
  }
}

// 清除缓存
const confirmClearCache = () => {
  openConfirm('清除缓存', '确定要清除缓存吗？', () => {
    localStorage.clear()
    sessionStorage.clear()
    showToast('缓存已清除')
  })
}

// 更新昵称
const updateNickname = async () => {
  if (!newNickname.value.trim()) return
  
  await userStore.updateProfile({
    nickname: newNickname.value.trim()
  })
  
  showEditModal.value = false
  newNickname.value = ''
  showToast('昵称修改成功')
}

// 更新头像
const updateAvatar = async () => {
  await userStore.updateProfile({
    avatarUrl: '/avatars/sanguo_avatars/04_诸葛亮.jpg'
  })
  showAvatarModal.value = false
  showToast('头像更新成功')
}

// 退出登录
const confirmLogout = () => {
  openConfirm('退出登录', '确定要退出登录吗？', () => {
    userStore.logout()
    router.push('/login')
  })
}

// 订阅会员
const handleSubscribe = () => {
  subscribing.value = true
  setTimeout(() => {
    userStore.upgradePro()
    subscribing.value = false
    showSubscriptionModal.value = false
    showToast('恭喜！已成功升级 PRO 会员')
  }, 1500)
}

// 导航
const navigateTo = (path: string) => {
  router.push(path)
}

onMounted(async () => {
  await userStore.init()
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  
  // 获取用户数据
  await userStore.fetchHomeData()
  newNickname.value = userStore.user?.nickname || ''

  const profile = userStore.profile as any
  if (profile?.privacySettings) Object.assign(privacySettings, profile.privacySettings)
  if (profile?.settings) Object.assign(settings, profile.settings)
  
  // 获取打卡记录
  await fetchCheckinHistory()
  
  // 初始化设备
  initDevices()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  width: 100%;
  background: #F3E9D2;
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
  opacity: 0.1;
}

.ink-1 {
  top: -5%;
  right: -10%;
  width: 50%;
  height: 30%;
  background: radial-gradient(circle, #8B4513 0%, transparent 70%);
}

/* 用户信息 */
.user-section {
  position: relative;
  z-index: 10;
  padding: 60px 20px 20px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(44, 36, 27, 0.1);
  border-radius: 20px;
}

.avatar {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #D4AF37 0%, #A83232 100%);
  border-radius: 50%;
  color: #F3E9D2;
  font-size: 24px;
  font-weight: 900;
  font-family: "Noto Serif SC", serif;
  position: relative;
  cursor: pointer;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-edit-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background: #2C241B;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F3E9D2;
  padding: 3px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 20px;
  font-weight: 900;
  color: #2C241B;
  font-family: "Noto Serif SC", serif;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.premium-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFD700 0%, #FDB931 50%, #D4AF37 100%);
  padding: 1px 5px;
  border-radius: 4px;
  color: #4a3b2a;
  box-shadow: 0 2px 4px rgba(212, 175, 55, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  position: relative;
  overflow: hidden;
  height: 16px;
}

.premium-badge::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    45deg, 
    transparent 40%, 
    rgba(255, 255, 255, 0.6) 50%, 
    transparent 60%
  );
  animation: shine 3s infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  20% { transform: translateX(100%); }
  100% { transform: translateX(100%); }
}

.premium-text {
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.5px;
  line-height: 1;
  transform: translateY(0.5px);
}

.user-phone {
  font-size: 13px;
  color: #8C735A;
  margin-top: 4px;
}

.edit-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(44, 36, 27, 0.05);
  border: 1px solid rgba(44, 36, 27, 0.1);
  border-radius: 12px;
  color: #8C735A;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn svg {
  width: 18px;
  height: 18px;
}

.edit-btn:hover {
  background: rgba(44, 36, 27, 0.1);
  color: #2C241B;
}

/* 数据统计 */
.stats-section {
  position: relative;
  z-index: 10;
  padding: 0 20px 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-item {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 10px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(44, 36, 27, 0.12);
  border-radius: 16px;
  box-shadow:
    0 10px 22px rgba(44, 36, 27, 0.10),
    inset 0 1px 0 rgba(255, 255, 255, 0.55);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.stat-item::before {
  content: "";
  position: absolute;
  inset: -1px;
  background: radial-gradient(140px 90px at 35% 20%, rgba(212, 175, 55, 0.18), rgba(255, 255, 255, 0) 60%);
  opacity: 0.9;
  pointer-events: none;
}

.stat-item:hover {
  transform: translateY(-1px);
  border-color: rgba(44, 36, 27, 0.18);
  box-shadow:
    0 14px 28px rgba(44, 36, 27, 0.13),
    inset 0 1px 0 rgba(255, 255, 255, 0.62);
}

.stat-item:active {
  transform: translateY(0);
}

.stat-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(44, 36, 27, 0.06);
  border: 1px solid rgba(44, 36, 27, 0.12);
  color: #8C735A;
}

.stat-icon svg {
  width: 18px;
  height: 18px;
}

.stat-value {
  font-size: 20px;
  font-weight: 900;
  color: #2C241B;
  font-family: "Noto Serif SC", serif;
}

.stat-value-ratio {
  display: inline-flex;
  align-items: baseline;
  gap: 0;
}

.stat-value-sep {
  opacity: 0.55;
  padding: 0 2px;
}

.stat-value-den {
  font-size: 13px;
  font-weight: 800;
  opacity: 0.65;
}

.stat-label {
  font-size: 11px;
  color: #8C735A;
}

@media (max-width: 520px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-item {
    padding: 14px 10px;
  }
}

/* 外部设备 */
.devices-section {
  position: relative;
  z-index: 10;
  padding: 0 20px 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 900;
  color: #2C241B;
  font-family: "Noto Serif SC", serif;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  display: block;
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, #D4AF37 0%, #A83232 100%);
  border-radius: 2px;
}

.add-device-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(44, 36, 27, 0.1);
  border-radius: 16px;
  font-size: 12px;
  color: #8C735A;
  cursor: pointer;
}

.plus-icon {
  font-size: 16px;
  font-weight: bold;
}

.devices-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-card {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(44, 36, 27, 0.1);
  border-radius: 16px;
  padding: 16px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.device-card.connected {
  border-color: #D4AF37;
  background: rgba(255, 255, 255, 0.9);
}

.device-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.device-icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(44, 36, 27, 0.05);
  border-radius: 12px;
  color: #8C735A;
}

.device-svg {
  width: 24px;
  height: 24px;
}

.device-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.device-name {
  font-size: 14px;
  font-weight: bold;
  color: #2C241B;
}

.device-status {
  font-size: 12px;
  color: #8C735A;
}

.status-syncing {
  color: #D4AF37;
}

.device-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #8C735A;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: rgba(44, 36, 27, 0.05);
  color: #D4AF37;
}

.icon-btn.delete:hover {
  color: #A83232;
}

.icon-btn svg {
  width: 18px;
  height: 18px;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Device Details */
.device-details {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(44, 36, 27, 0.1);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.last-sync {
  font-size: 11px;
  color: #8C735A;
  margin-bottom: 12px;
  text-align: right;
}

.health-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.health-item {
  background: rgba(243, 233, 210, 0.5);
  padding: 10px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.health-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-bottom: 4px;
}

.health-icon svg {
  width: 16px;
  height: 16px;
}

.health-icon.steps { color: #4CAF50; background: rgba(76, 175, 80, 0.1); }
.health-icon.heart { color: #F44336; background: rgba(244, 67, 54, 0.1); }
.health-icon.sleep { color: #673AB7; background: rgba(103, 58, 183, 0.1); }
.health-icon.spo2 { color: #03A9F4; background: rgba(3, 169, 244, 0.1); }
.health-icon.calories { color: #FF9800; background: rgba(255, 152, 0, 0.1); }
.health-icon.stand { color: #009688; background: rgba(0, 150, 136, 0.1); }

.health-val {
  font-size: 14px;
  font-weight: bold;
  color: #2C241B;
}

.unit {
  font-size: 10px;
  font-weight: normal;
  color: #8C735A;
}

.health-label {
  font-size: 10px;
  color: #8C735A;
}

.empty-devices {
  text-align: center;
  padding: 30px;
  color: #8C735A;
  font-size: 14px;
}

.add-first-btn {
  margin-top: 12px;
  padding: 8px 20px;
  background: #D4AF37;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
}

/* 功能菜单 */
.menu-section {
  position: relative;
  z-index: 10;
  padding: 0 20px 40px;
}

.menu-group {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(44, 36, 27, 0.1);
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 24px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid rgba(44, 36, 27, 0.05);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: rgba(44, 36, 27, 0.05);
}

.menu-icon-svg {
  width: 24px;
  height: 24px;
  color: #8C735A;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-icon-svg.gold {
  color: #D4AF37;
}

.menu-label {
  flex: 1;
  font-size: 15px;
  color: #2C241B;
}

.menu-sublabel {
  font-size: 12px;
  color: #D4AF37;
  margin-right: 4px;
}

.menu-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: #A83232;
  color: white;
  border-radius: 10px;
  margin-right: 4px;
}

.menu-badge.gold {
  background: #D4AF37;
}

.menu-arrow {
  color: #8C735A;
  font-size: 18px;
  opacity: 0.5;
}

.menu-item.danger .menu-label,
.menu-item.danger .menu-icon-svg {
  color: #A83232;
}

/* Footer */
.page-footer {
  text-align: center;
  padding: 20px;
  color: #8C735A;
  font-size: 12px;
  opacity: 0.6;
}

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(44, 36, 27, 0.4);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background: #FAF6ED;
  border-radius: 24px;
  padding: 24px;
  width: 100%;
  max-width: 320px;
  box-shadow: 0 10px 30px rgba(44, 36, 27, 0.15);
  animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalPop {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-title {
  font-size: 18px;
  font-weight: 900;
  color: #2C241B;
  text-align: center;
  margin-bottom: 20px;
  font-family: "Noto Serif SC", serif;
}

.modal-input, .modal-select {
  width: 100%;
  padding: 12px;
  background: white;
  border: 1px solid rgba(44, 36, 27, 0.1);
  border-radius: 12px;
  font-size: 16px;
  color: #2C241B;
  margin-bottom: 24px;
  outline: none;
}

.modal-input:focus, .modal-select:focus {
  border-color: #D4AF37;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn.cancel {
  background: rgba(44, 36, 27, 0.05);
  color: #8C735A;
}

.modal-btn.confirm {
  background: linear-gradient(135deg, #D4AF37 0%, #A83232 100%);
  color: #F3E9D2;
}

/* Device Modal */
.device-modal {
  max-width: 360px;
}

.available-devices-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.device-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid rgba(44, 36, 27, 0.1);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.device-option:hover {
  border-color: #D4AF37;
}

.device-option.is-added {
  opacity: 0.6;
  cursor: default;
  background: #f5f5f5;
}

.device-option.is-adding {
  border-color: #D4AF37;
  background: rgba(212, 175, 55, 0.05);
}

.device-option-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(44, 36, 27, 0.05);
  border-radius: 10px;
  color: #8C735A;
}

.device-option-icon svg {
  width: 20px;
  height: 20px;
}

.device-option-name {
  flex: 1;
  font-size: 14px;
  color: #2C241B;
}

.added-badge {
  font-size: 11px;
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.adding-text {
  font-size: 11px;
  color: #D4AF37;
}

.spinner {
  animation: spin 1s linear infinite;
}

/* History Modal */
.history-modal {
  max-width: 360px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.history-list {
  overflow-y: auto;
  margin-bottom: 20px;
}

.history-item {
  padding: 16px;
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid rgba(44, 36, 27, 0.05);
}

.history-date {
  font-size: 12px;
  color: #8C735A;
  margin-bottom: 4px;
}

.history-question {
  font-size: 14px;
  font-weight: bold;
  color: #2C241B;
  margin-bottom: 4px;
}

.history-answer {
  font-size: 13px;
  color: #5D4037;
  margin-bottom: 8px;
}

.history-result {
  font-size: 12px;
  color: #D4AF37;
  display: flex;
  align-items: center;
  gap: 4px;
}

.history-result.valid {
  color: #4CAF50;
}

/* Settings Modal */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-label {
  font-size: 15px;
  color: #2C241B;
}

.dimension-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dimension-name {
  font-size: 15px;
  color: #2C241B;
  font-weight: 500;
}

.dimension-desc {
  font-size: 12px;
  color: #8C735A;
  opacity: 0.8;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e0d0b8;
  transition: .4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #D4AF37;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.settings-btn {
  padding: 6px 12px;
  font-size: 13px;
  color: #A83232;
  border: 1px solid rgba(168, 50, 50, 0.2);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}

/* About Modal */
.about-modal {
  text-align: center;
}

.about-logo {
  margin-bottom: 16px;
}

.about-title {
  font-size: 20px;
  margin-bottom: 4px;
}

.about-slogan {
  font-size: 14px;
  color: #D4AF37;
  margin-bottom: 24px;
}

.about-desc {
  font-size: 14px;
  color: #8C735A;
  line-height: 1.6;
  margin-bottom: 24px;
}

.about-version {
  font-size: 12px;
  color: #8C735A;
  opacity: 0.6;
  margin-bottom: 24px;
}

/* Confirm Modal */
.confirm-message {
  text-align: center;
  color: #5D4037;
  margin-bottom: 24px;
  line-height: 1.5;
}

/* Toast */
.toast-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(44, 36, 27, 0.9);
  padding: 12px 24px;
  border-radius: 12px;
  z-index: 200;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast-message {
  color: #F3E9D2;
  font-size: 14px;
  font-weight: 500;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
}

/* New Modals Styles */
.avatar-modal {
  text-align: center;
}

.avatar-preview-lg {
  width: 100px;
  height: 100px;
  margin: 0 auto 16px;
  border-radius: 50%;
  overflow: hidden;
  background: #f5f5f5;
  border: 4px solid #D4AF37;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: #D4AF37;
}

.avatar-preview-lg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-tip {
  font-size: 12px;
  color: #8C735A;
  margin-bottom: 24px;
}

/* Report Modal */
.report-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.report-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  border: 1px solid rgba(44, 36, 27, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.report-option.active {
  border-color: #D4AF37;
  background: rgba(212, 175, 55, 0.05);
}

.option-icon {
  width: 32px;
  height: 32px;
  color: #8C735A;
}

.report-option.active .option-icon {
  color: #D4AF37;
}

.report-preview {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #8C735A;
  margin-bottom: 20px;
  line-height: 1.5;
}

/* Achievements Modal */
.achievements-modal {
  max-width: 360px;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
}

.badge-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #D4AF37;
  border-radius: 50%;
  color: white;
  margin-bottom: 4px;
  box-shadow: 0 4px 8px rgba(212, 175, 55, 0.3);
}

.badge-item.locked .badge-icon {
  background: #e0e0e0;
  color: #999;
  box-shadow: none;
}

.badge-name {
  font-size: 12px;
  font-weight: bold;
  color: #2C241B;
}

.badge-desc {
  font-size: 10px;
  color: #8C735A;
  transform: scale(0.9);
}

/* Wide Subscription Modal */
.wide-modal {
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.sub-header {
  text-align: center;
  margin-bottom: 24px;
}

.sub-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  color: #D4AF37;
}

.sub-title {
  font-size: 22px;
  font-weight: 900;
  color: #2C241B;
  margin-bottom: 4px;
}

.sub-desc {
  font-size: 13px;
  color: #8C735A;
}

.sub-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.feature-icon-svg {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
  border-radius: 8px;
}

.feature-icon-svg svg {
  width: 18px;
  height: 18px;
}

.feature-text {
  flex: 1;
}

.feature-title {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #2C241B;
}

.feature-desc {
  font-size: 11px;
  color: #8C735A;
}

.sub-price-card {
  background: linear-gradient(135deg, #D4AF37 0%, #A83232 100%);
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  color: #F3E9D2;
  margin-bottom: 20px;
}

.price-val {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
}

.currency { font-size: 16px; }
.amount { font-size: 32px; font-weight: 900; }
.period { font-size: 12px; opacity: 0.8; }
.price-tip { font-size: 11px; opacity: 0.8; margin-top: 4px; }

/* Form Styles */
.form-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 4px;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #2C241B;
  margin-bottom: 10px;
  font-weight: bold;
}

.label-icon {
  font-size: 16px;
}

.label-svg {
  width: 18px;
  height: 18px;
  color: #D4AF37;
  flex-shrink: 0;
}

.concern-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.required {
  color: #A83232;
}

.modal-input {
  margin-bottom: 0; /* Override */
}

.radio-group {
  display: flex;
  gap: 12px;
}

.radio-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border: 1px solid rgba(44, 36, 27, 0.1);
  border-radius: 12px;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
}

.radio-item input {
  display: none;
}

.radio-item.active {
  border-color: #D4AF37;
  background: rgba(212, 175, 55, 0.05);
  color: #D4AF37;
  font-weight: bold;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-option {
  padding: 6px 12px;
  border: 1px solid rgba(44, 36, 27, 0.1);
  border-radius: 20px;
  font-size: 13px;
  color: #8C735A;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-option.active {
  background: #D4AF37;
  color: white;
  border-color: #D4AF37;
}

.tag-option .tag-remove {
  margin-left: 4px;
  font-size: 14px;
  opacity: 0.7;
}

.tag-option.active .tag-remove:hover {
  opacity: 1;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed rgba(44, 36, 27, 0.1);
  width: 100%;
}

.custom-input-wrapper {
  display: flex;
  gap: 8px;
  width: 100%;
  margin-top: 8px;
}

.custom-input {
  flex: 1;
  margin-bottom: 0;
  padding: 10px 12px;
}

.add-custom-btn {
  padding: 10px 16px;
  background: linear-gradient(135deg, #D4AF37 0%, #A83232 100%);
  color: #F3E9D2;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.add-custom-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.add-custom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Health Preferences Modal */
.health-pref-modal {
  max-width: 400px;
}

.pill-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill-item {
  padding: 8px 16px;
  background: white;
  border: 1px solid rgba(44, 36, 27, 0.15);
  border-radius: 20px;
  font-size: 13px;
  color: #5D4037;
  cursor: pointer;
  transition: all 0.2s;
}

.pill-item:hover {
  border-color: #D4AF37;
  background: rgba(212, 175, 55, 0.05);
}

.pill-item.active {
  background: linear-gradient(135deg, #D4AF37 0%, #A83232 100%);
  color: #F3E9D2;
  border-color: transparent;
}

.water-slider-container {
  padding: 10px 0;
}

.water-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, #E8F5E9 0%, #4CAF50 100%);
  appearance: none;
  cursor: pointer;
}

.water-slider::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #D4AF37 0%, #A83232 100%);
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.4);
  cursor: pointer;
}

.water-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 11px;
  color: #8C735A;
}

.water-labels span {
  opacity: 0.4;
  transition: opacity 0.2s;
}

.water-labels span.active {
  opacity: 1;
  font-weight: bold;
  color: #D4AF37;
}

.water-display {
  text-align: center;
  margin-top: 12px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(168, 50, 50, 0.1) 100%);
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
  color: #2C241B;
}

.habit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.habit-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: white;
  border: 1px solid rgba(44, 36, 27, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.habit-item input {
  display: none;
}

.habit-item:hover {
  border-color: #D4AF37;
}

.habit-item.active {
  border-color: #D4AF37;
  background: rgba(212, 175, 55, 0.05);
}

.habit-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.habit-icon svg {
  width: 100%;
  height: 100%;
  color: #8C735A;
}

.habit-item.active .habit-icon svg {
  color: #D4AF37;
}

.habit-text {
  font-size: 12px;
  color: #5D4037;
}

.habit-item.active .habit-text {
  color: #2C241B;
}

.concern-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.concern-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: white;
  border: 1px solid rgba(44, 36, 27, 0.1);
  border-radius: 16px;
  font-size: 12px;
  color: #5D4037;
  cursor: pointer;
  transition: all 0.2s;
}

.concern-tag:hover {
  border-color: #D4AF37;
}

.concern-tag.active {
  background: linear-gradient(135deg, #D4AF37 0%, #A83232 100%);
  color: #F3E9D2;
  border-color: transparent;
}

.checkbox-group {
  display: flex;
  gap: 16px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-item input {
  accent-color: #D4AF37;
  width: 18px;
  height: 18px;
}
.divider {
  height: 1px;
  background: rgba(44, 36, 27, 0.1);
  margin: 16px 0;
}

.subsettings-title {
  font-size: 14px;
  color: #8C735A;
  margin-bottom: 12px;
  font-weight: 500;
}
</style>
