<template>
  <div class="lamps-page">
    <!-- 深邃夜空背景 -->
    <div class="night-sky-bg">
      <div class="stars-layer">
        <div v-for="n in 60" :key="'star-'+n" 
          class="star"
          :style="{
            left: ((n * 17) % 100) + '%',
            top: ((n * 7) % 50) + '%',
            width: (1 + (n % 3)) + 'px',
            height: (1 + (n % 3)) + 'px',
            animationDelay: ((n * 0.05) % 3) + 's',
            animationDuration: (2 + (n % 3)) + 's'
          }"
        ></div>
      </div>
      <div class="moon-glow"></div>
    </div>

    <!-- 水面层 -->
    <div class="water-layer">
      <svg class="water-svg" viewBox="0 0 400 300" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(10, 25, 47, 0.2)"/>
            <stop offset="100%" stop-color="rgba(5, 15, 30, 0.6)"/>
          </linearGradient>
          <filter id="waterBlur">
            <feGaussianBlur stdDeviation="2"/>
          </filter>
        </defs>
        <rect x="0" y="0" width="400" height="300" fill="url(#waterGrad)"/>
        <!-- 水波纹线 -->
        <path class="water-wave wave-1" d="M0,50 Q100,30 200,50 T400,50" fill="none" stroke="rgba(212,175,55,0.1)" stroke-width="1"/>
        <path class="water-wave wave-2" d="M0,100 Q100,80 200,100 T400,100" fill="none" stroke="rgba(212,175,55,0.08)" stroke-width="1"/>
        <path class="water-wave wave-3" d="M0,150 Q100,130 200,150 T400,150" fill="none" stroke="rgba(212,175,55,0.06)" stroke-width="1"/>
      </svg>
    </div>

    <!-- 顶部标题栏 -->
    <header class="page-header">
      <button class="header-btn" @click="showDailyReport = true">
        <svg class="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      </button>
      
      <div class="title-group">
        <svg class="title-deco" viewBox="0 0 40 8" fill="none">
          <path d="M0,4 Q10,0 20,4 T40,4" stroke="url(#goldGrad)" stroke-width="2"/>
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="transparent"/>
              <stop offset="50%" stop-color="#D4AF37"/>
              <stop offset="100%" stop-color="transparent"/>
            </linearGradient>
          </defs>
        </svg>
        <h1 class="page-title">七星莲灯·曲水流灯</h1>
        <svg class="title-deco" viewBox="0 0 40 8" fill="none">
          <path d="M0,4 Q10,8 20,4 T40,4" stroke="url(#goldGrad)" stroke-width="2"/>
        </svg>
      </div>
      
      <button class="header-btn" @click="showTrendAnalysis = true">
        <svg class="btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      </button>
    </header>

    <!-- 主体：七星莲灯阵 -->
    <main class="lotus-array-container" @click="addClickRipple">
      <!-- 点击水波纹效果 -->
      <div 
        v-for="ripple in clickRipples" 
        :key="'click-ripple-'+ripple.id"
        class="click-ripple-container"
        :style="{ left: ripple.x + 'px', top: ripple.y + 'px' }"
      >
        <div class="click-ripple-ring ring-1"></div>
        <div class="click-ripple-ring ring-2"></div>
        <div class="click-ripple-ring ring-3"></div>
        <div class="click-ripple-center"></div>
      </div>

      <!-- 水波纹连接 SVG -->
      <svg class="connection-svg" :viewBox="svgViewBox" preserveAspectRatio="xMidYMid meet">
        <defs>
          <!-- 水波纹渐变 -->
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(212,175,55,0)"/>
            <stop offset="50%" stop-color="rgba(212,175,55,0.4)"/>
            <stop offset="100%" stop-color="rgba(212,175,55,0)"/>
          </linearGradient>
          
          <!-- 发光滤镜 -->
          <filter id="waveGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <!-- 流动光点 -->
          <radialGradient id="flowLight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFD700" stop-opacity="1"/>
            <stop offset="100%" stop-color="#FFD700" stop-opacity="0"/>
          </radialGradient>
        </defs>
        
        <!-- 水波纹路径 -->
        <g class="wave-connections">
          <path 
            v-for="(line, idx) in connectionLines" 
            :key="'wave-'+idx"
            :d="line.path"
            class="wave-path"
            fill="none"
            stroke="url(#waveGradient)"
            stroke-width="2"
            stroke-linecap="round"
            :style="{ animationDelay: (idx * 0.3) + 's' }"
          />
          
          <!-- 流动光点 -->
          <circle 
            v-for="(line, idx) in connectionLines"
            :key="'flow-'+idx"
            r="4"
            fill="url(#flowLight)"
            class="flow-dot"
          >
            <animateMotion 
              :dur="(4 + idx * 0.5) + 's'" 
              repeatCount="indefinite"
              :path="line.path"
            />
          </circle>
        </g>
      </svg>

      <!-- 七盏莲灯 -->
      <div 
        v-for="(lamp, index) in lamps" 
        :key="lamp.id"
        class="lotus-lamp-wrapper"
        :class="{ 'is-lit': lamp.isLit }"
        :style="getLampStyle(lamp, index)"
        @click="navigateToDetail(lamp)"
      >
        <!-- 新内容红点提示 -->
        <div v-if="lamp.hasNewUpdate" class="new-update-dot"></div>

        <!-- 莲灯组件 -->
        <LotusLamp 
          :isLit="lamp.isLit" 
          size="90px"
          glowSize="130px"
          :glowIntensity="lamp.isLit ? 0.6 : 0"
        />
        
        <!-- 标签 -->
        <div class="lamp-label" :class="lamp.labelPos">
          <span class="lamp-name">{{ lamp.name }}</span>
          <span class="lamp-subtitle">{{ lamp.label }}</span>
        </div>
        
        <!-- 涟漪效果 -->
        <div class="ripple-rings" v-if="lamp.isLit">
          <div class="ripple-ring"></div>
          <div class="ripple-ring delay-1"></div>
        </div>
      </div>
    </main>

    <!-- 底部统计 -->
    <footer class="page-footer">
      <div class="stat-item">
        <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <span class="stat-value">{{ litCount }}/49</span>
        <span class="stat-label">盏灯已亮</span>
      </div>
      
      <div class="footer-info-wrapper">
        <button class="footer-info-btn" @click.stop="toggleFooterTooltip">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </button>
        <transition name="fade">
          <div v-if="showFooterTooltip" class="footer-tooltip">
            如果49天内小莲灯未记录新状况，则会暗淡无光
          </div>
        </transition>
      </div>
    </footer>

    <!-- 更新提示弹窗 -->
    <transition name="toast-slide">
      <div v-if="showUpdateToast" class="update-toast">
        <div class="toast-header">
          <span class="toast-icon">✨</span>
          <span class="toast-title">灯阵有新变化</span>
          <button class="toast-close" @click="dismissToast">✕</button>
        </div>
        <div class="toast-content">
          <div v-for="(item, idx) in updateToastContent" :key="idx" class="update-item">
            <span class="update-lamp">{{ item.lampName }}</span>
            <span class="update-metric">{{ item.metricName }}</span>
            <span class="update-question">{{ item.question }}</span>
          </div>
        </div>
      </div>
    </transition>

    <!-- 每日报告弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDailyReport" class="report-overlay" @click.self="showDailyReport = false">
          <div class="report-modal">
            <div class="report-header">
              <div class="report-title-area">
                <svg class="report-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                <div>
                  <h2 class="report-title">每日健康报告</h2>
                  <p class="report-date">{{ dailyReportData.date }}</p>
                  <p class="report-desc">* 本报告每天根据你的近日答题情况、外部设备数据情况生成</p>
                </div>
              </div>
              <button class="report-close" @click="showDailyReport = false">×</button>
            </div>

            <div class="report-body">
              <!-- 总体评分 -->
              <div class="score-card">
                <div class="score-circle">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8"/>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#D4AF37" stroke-width="8" 
                      stroke-dasharray="283" :stroke-dashoffset="283 - (283 * dailyReportData.overallScore / 100)"
                      stroke-linecap="round" transform="rotate(-90 50 50)"/>
                  </svg>
                  <div class="score-value">
                    <span class="score-num">{{ dailyReportData.overallScore }}</span>
                    <span class="score-unit">分</span>
                  </div>
                </div>
                <div class="score-info">
                  <span class="score-level" :class="dailyReportData.overallLevel === '良好' ? 'good' : ''">{{ dailyReportData.overallLevel }}</span>
                  <p class="score-summary">{{ dailyReportData.summary }}</p>
                </div>
              </div>

              <!-- 七维度评分 -->
              <div class="dimensions-section">
                <h3 class="section-title">七维度状态</h3>
                <div class="dimension-list">
                  <div v-for="dim in dailyReportData.dimensions" :key="dim.name" class="dimension-item">
                    <div class="dim-info">
                      <span class="dim-name">{{ dim.name }}</span>
                      <span class="dim-status">{{ dim.status }}</span>
                    </div>
                    <div class="dim-score-bar">
                      <div class="dim-bar-bg">
                        <div class="dim-bar-fill" :style="{ width: dim.score + '%', background: dim.color }"></div>
                      </div>
                      <span class="dim-score" :style="{ color: dim.color }">{{ dim.score }}</span>
                      <span class="dim-trend" :class="dim.trend">
                        {{ dim.trend === 'up' ? '↑' : dim.trend === 'down' ? '↓' : '→' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 今日亮点 -->
              <div class="highlights-section">
                <h3 class="section-title">
                  <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  今日亮点
                </h3>
                <div class="highlight-list">
                  <div v-for="(h, idx) in dailyReportData.highlights" :key="idx" class="highlight-item">
                    <svg class="item-icon highlight" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path v-if="h.iconType === 'star'" d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      <g v-else-if="h.iconType === 'food'">
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                        <line x1="6" y1="1" x2="6" y2="4"/>
                        <line x1="10" y1="1" x2="10" y2="4"/>
                        <line x1="14" y1="1" x2="14" y2="4"/>
                      </g>
                      <g v-else-if="h.iconType === 'sleep'">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                      </g>
                      <polyline v-else points="20 6 9 17 4 12"/>
                    </svg>
                    <span class="highlight-text">{{ h.text }}</span>
                  </div>
                </div>
              </div>

              <!-- 改进建议 -->
              <div class="suggestions-section">
                <h3 class="section-title">
                  <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  改进建议
                </h3>
                <div class="suggestion-list">
                  <div v-for="(s, idx) in dailyReportData.suggestions" :key="idx" class="suggestion-item">
                    <svg class="item-icon suggestion" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <g v-if="s.iconType === 'run'">
                        <circle cx="12" cy="5" r="3"/>
                        <path d="M5 20l3-8 4 2 3-4 4 8"/>
                      </g>
                      <g v-else-if="s.iconType === 'phone'">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                        <line x1="12" y1="18" x2="12.01" y2="18"/>
                      </g>
                      <g v-else-if="s.iconType === 'strength'">
                        <path d="M6.5 6.5L17.5 17.5"/>
                        <path d="M3 10l4-4 4 4"/>
                        <path d="M21 14l-4 4-4-4"/>
                      </g>
                      <g v-else>
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </g>
                    </svg>
                    <span class="suggestion-text">{{ s.text }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 趋势分析弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showTrendAnalysis" class="report-overlay" @click.self="showTrendAnalysis = false">
          <div class="report-modal">
            <div class="report-header">
              <div class="report-title-area">
                <svg class="report-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
                <div>
                  <h2 class="report-title">健康趋势分析</h2>
                  <p class="report-date">{{ trendData.period }}</p>
                </div>
              </div>
              <button class="report-close" @click="showTrendAnalysis = false">×</button>
            </div>

            <div class="report-body">
              <!-- 趋势概览 -->
              <div class="trend-overview">
                <div class="trend-avg">
                  <span class="trend-avg-label">平均得分</span>
                  <span class="trend-avg-value">{{ trendData.avgScore }}</span>
                </div>
                <div class="trend-direction" :class="trendData.trend">
                  <svg class="trend-arrow-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline v-if="trendData.trend === 'up'" points="18 15 12 9 6 15"/>
                    <polyline v-else-if="trendData.trend === 'down'" points="6 9 12 15 18 9"/>
                    <line v-else x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  <span class="trend-text">{{ trendData.trendText }}</span>
                </div>
              </div>

              <!-- 周数据图表 -->
              <div class="week-chart">
                <h3 class="section-title">本周数据</h3>
                <div class="chart-bars">
                  <div v-for="day in trendData.weekData" :key="day.day" class="chart-bar-item">
                    <div class="bar-container">
                      <div class="bar-fill" :style="{ height: day.score + '%' }">
                        <span class="bar-value">{{ day.score }}</span>
                      </div>
                    </div>
                    <span class="bar-label">{{ day.day }}</span>
                    <span class="bar-lit">{{ day.lit }}盏</span>
                  </div>
                </div>
              </div>

              <!-- 最佳/最差维度 -->
              <div class="dimension-compare">
                <div class="compare-item best">
                  <span class="compare-label">
                    <svg class="compare-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="8" r="6"/>
                      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                    </svg>
                    最佳维度
                  </span>
                  <span class="compare-name">{{ trendData.bestDimension.name }}</span>
                  <span class="compare-score">{{ trendData.bestDimension.avgScore }}分</span>
                  <span class="compare-desc">{{ trendData.bestDimension.description }}</span>
                </div>
                <div class="compare-item worst">
                  <span class="compare-label">
                    <svg class="compare-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    待改进
                  </span>
                  <span class="compare-name">{{ trendData.worstDimension.name }}</span>
                  <span class="compare-score">{{ trendData.worstDimension.avgScore }}分</span>
                  <span class="compare-desc">{{ trendData.worstDimension.description }}</span>
                </div>
              </div>

              <!-- 洞察建议 -->
              <div class="insights-section">
                <h3 class="section-title">
                  <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                  数据洞察
                </h3>
                <div class="insight-list">
                  <div v-for="(insight, idx) in trendData.insights" :key="idx" class="insight-item">
                    <svg class="insight-icon" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="4"/>
                    </svg>
                    <span class="insight-text">{{ insight }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 底部导航 -->
    <nav class="bottom-nav dark">
      <NuxtLink to="/" class="nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>点灯</span>
      </NuxtLink>
      <NuxtLink to="/lamps" class="nav-item active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <span>灯阵</span>
      </NuxtLink>
      <NuxtLink to="/social" class="nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <span>灯友</span>
      </NuxtLink>
      <NuxtLink to="/profile" class="nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>我的</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import LotusLamp from '~/components/svg/LotusLamp.vue'
import BottomNav from '~/components/ui/BottomNav.vue'
import { useLampsStore } from '~/stores/lamps'
import { useUserStore } from '~/stores/user'
import { useNotificationStore } from '~/stores/notification'

// 使用中间件
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const lampsStore = useLampsStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

// 更新提示弹窗
const showUpdateToast = ref(false)
const updateToastContent = ref([])

// 每日报告弹窗
const showDailyReport = ref(false)

// 趋势分析弹窗
const showTrendAnalysis = ref(false)

// 底部提示
const showFooterTooltip = ref(false)
const toggleFooterTooltip = () => {
  showFooterTooltip.value = !showFooterTooltip.value
  if (showFooterTooltip.value) {
    setTimeout(() => {
      showFooterTooltip.value = false
    }, 4000)
  }
}

// Mock 每日报告数据
const dailyReportData = ref({
  date: new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
  overallScore: 85,
  overallLevel: '良好',
  summary: '今日整体状态良好，饮食和睡眠维度表现优秀，运动维度需要加强。',
  dimensions: [
    { name: '天枢·命火', score: 86, trend: 'up', status: '连续打卡5天', color: '#4ADE80' },
    { name: '天璇·谷神', score: 92, trend: 'up', status: '饮食均衡', color: '#4ADE80' },
    { name: '天玑·动静', score: 68, trend: 'down', status: '运动不足', color: '#F59E0B' },
    { name: '天权·归根', score: 88, trend: 'stable', status: '睡眠充足', color: '#4ADE80' },
    { name: '玉衡·调息', score: 82, trend: 'up', status: '情绪稳定', color: '#4ADE80' },
    { name: '开阳·营卫', score: 90, trend: 'stable', status: '体征正常', color: '#4ADE80' },
    { name: '摇光·固表', score: 78, trend: 'down', status: '屏幕时间过长', color: '#F59E0B' }
  ],
  highlights: [
    { iconType: 'star', text: '连续打卡第5天，继续保持！' },
    { iconType: 'food', text: '今日蔬果摄入达标，营养均衡' },
    { iconType: 'sleep', text: '睡眠质量优秀，深睡比例23%' }
  ],
  suggestions: [
    { iconType: 'run', text: '今日步数仅8532步，建议增加户外活动' },
    { iconType: 'phone', text: '屏幕使用4.5小时，建议减少30分钟' },
    { iconType: 'strength', text: '力量训练未完成，建议安排15分钟' }
  ]
})

// Mock 趋势分析数据
const trendData = ref({
  period: '近7天',
  avgScore: 82,
  trend: 'up',
  trendText: '整体呈上升趋势',
  weekData: [
    { day: '周一', score: 78, lit: 4 },
    { day: '周二', score: 80, lit: 5 },
    { day: '周三', score: 82, lit: 5 },
    { day: '周四', score: 79, lit: 4 },
    { day: '周五', score: 85, lit: 6 },
    { day: '周六', score: 88, lit: 6 },
    { day: '周日', score: 85, lit: 5 }
  ],
  bestDimension: { name: '天璇·谷神', avgScore: 91, description: '饮食习惯最佳' },
  worstDimension: { name: '天玑·动静', avgScore: 65, description: '运动需要加强' },
  insights: [
    '本周平均亮灯5盏，较上周提升1盏',
    '睡眠质量持续改善，深睡比例提升5%',
    '周末状态明显优于工作日',
    '建议工作日增加运动时间'
  ]
})

// 点击水波纹数据
const clickRipples = ref([])
let rippleId = 0

// 添加点击水波纹
const addClickRipple = (event) => {
  const container = event.currentTarget
  const rect = container.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  const id = rippleId++
  clickRipples.value.push({ id, x, y })
  
  // 3秒后移除
  setTimeout(() => {
    clickRipples.value = clickRipples.value.filter(r => r.id !== id)
  }, 3000)
}

// 七星灯基础配置（位置和标签）
const lampConfig = [
  { id: 'TIANSHU', dimId: 1, name: '天枢', label: '命火', x: 70, y: 6, labelPos: 'right' },
  { id: 'TIANXUAN', dimId: 2, name: '天璇', label: '谷神', x: 30, y: 14, labelPos: 'left' },
  { id: 'TIANJI', dimId: 3, name: '天玑', label: '动静', x: 25, y: 28, labelPos: 'left' },
  { id: 'TIANQUAN', dimId: 4, name: '天权', label: '归根', x: 55, y: 40, labelPos: 'right' },
  { id: 'YUHENG', dimId: 5, name: '玉衡', label: '调息', x: 60, y: 54, labelPos: 'right' },
  { id: 'KAIYANG', dimId: 6, name: '开阳', label: '营卫', x: 72, y: 68, labelPos: 'right' },
  { id: 'YAOGUANG', dimId: 7, name: '摇光', label: '固表', x: 38, y: 80, labelPos: 'left' },
]

// 从 store 获取灯状态，合并配置
const lamps = computed(() => {
  return lampConfig.map(config => {
    const dim = lampsStore.getDimension(config.dimId)
    // 使用 notificationStore 中的逻辑判断红点（仅在本次会话有新更新时显示）
    const isNew = notificationStore.hasLampUpdate(config.dimId)
    
    return {
      ...config,
      isLit: dim?.isLit || false,
      litCount: dim?.litCount || 0,
      brightness: dim?.avgBrightness || 0,
      hasNewUpdate: isNew
    }
  })
})

const litCount = computed(() => lampsStore.litCount || lamps.value.filter(l => l.isLit).length)
const totalBrightness = computed(() => lampsStore.litPercentage || Math.round((litCount.value / 7) * 100))

// 检查并显示更新提示
const checkAndShowUpdates = () => {
  const updates = notificationStore.latestLampUpdates
  if (updates && updates.length > 0) {
    // 将更新信息转换为显示格式
    updateToastContent.value = updates.map(u => {
      const lampInfo = lampConfig.find(l => l.dimId === u.dimensionId)
      return {
        lampName: lampInfo ? `${lampInfo.name}·${lampInfo.label}` : '未知灯',
        metricName: u.metricName || '健康指标',
        question: u.question || ''
      }
    })
    showUpdateToast.value = true
    
    // 5秒后自动关闭
    setTimeout(() => {
      dismissToast()
    }, 5000)
  }
}

// 关闭提示弹窗
const dismissToast = () => {
  showUpdateToast.value = false
  // 清除更新记录
  notificationStore.clearLampUpdates()
}

// 初始化：从数据库获取灯状态
onMounted(async () => {
  await userStore.init()
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  // 获取灯阵状态
  try {
    await lampsStore.fetchStatus()
  } catch (e) {
    console.error('获取灯阵状态失败:', e)
  }
  
  // 检查是否有新的更新提示
  checkAndShowUpdates()
})

const svgViewBox = "0 0 100 100"

// 生成水波纹连接线路径
const connectionLines = computed(() => {
  const lines = []
  for (let i = 0; i < lamps.value.length - 1; i++) {
    const from = lamps.value[i]
    const to = lamps.value[i + 1]
    // 使用正弦波形创建水波纹效果
    const midX = (from.x + to.x) / 2
    const midY = (from.y + to.y) / 2
    const dx = to.x - from.x
    const dy = to.y - from.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const waveAmp = dist * 0.15
    
    // 创建波浪路径
    const ctrl1X = from.x + dx * 0.25 + (dy / dist) * waveAmp
    const ctrl1Y = from.y + dy * 0.25 - (dx / dist) * waveAmp
    const ctrl2X = from.x + dx * 0.75 - (dy / dist) * waveAmp
    const ctrl2Y = from.y + dy * 0.75 + (dx / dist) * waveAmp
    
    lines.push({
      path: `M${from.x},${from.y + 4} C${ctrl1X},${ctrl1Y} ${ctrl2X},${ctrl2Y} ${to.x},${to.y + 4}`
    })
  }
  return lines
})

const getLampStyle = (lamp, index) => {
  return {
    left: lamp.x + '%',
    top: lamp.y + '%',
    animationDelay: (index * 0.15) + 's',
    zIndex: 10 + index
  }
}

const navigateToDetail = (lamp) => {
  // 清除该维度的更新通知
  notificationStore.clearDimensionUpdates(lamp.dimId)
  router.push(`/lamp/${lamp.id}`)
}
</script>

<style scoped>
.lamps-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0d1b2a 100%);
}

/* 夜空背景 */
.night-sky-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.stars-layer {
  position: absolute;
  inset: 0;
}

.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.moon-glow {
  position: absolute;
  top: 5%;
  right: 10%;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(255,250,240,0.12) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(15px);
}

/* 水面层 */
.water-layer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 35%;
  z-index: 1;
  pointer-events: none;
}

.water-svg {
  width: 100%;
  height: 100%;
}

.water-wave {
  animation: waveMove 6s ease-in-out infinite;
}

.wave-1 { animation-delay: 0s; }
.wave-2 { animation-delay: 1s; }
.wave-3 { animation-delay: 2s; }

@keyframes waveMove {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(10px); }
}

/* 顶部标题栏 */
.page-header {
  position: relative;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 50px 16px 16px;
}

.header-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(212,175,55,0.2);
  border-radius: 12px;
  color: #D4AF37;
  cursor: pointer;
  transition: all 0.3s ease;
}

.header-btn:hover {
  background: rgba(212,175,55,0.1);
  border-color: rgba(212,175,55,0.4);
}

.btn-svg {
  width: 20px;
  height: 20px;
}

.title-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.title-deco {
  width: 60px;
  height: 8px;
}

.page-title {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 6px;
  color: #f5e6d3;
  font-family: "Noto Serif SC", serif;
  text-shadow: 0 0 20px rgba(255,215,0,0.2);
}

/* 莲灯阵容器 */
.lotus-array-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 220px);
  min-height: 500px;
  max-width: 420px;
  margin: 0 auto;
  z-index: 10;
}

/* 水波纹连接 */
.connection-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  pointer-events: none;
}

.wave-path {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: drawWave 2s ease forwards, waveFlow 4s ease-in-out infinite 2s;
}

@keyframes drawWave {
  to { stroke-dashoffset: 0; }
}

@keyframes waveFlow {
  0%, 100% { stroke-opacity: 0.4; }
  50% { stroke-opacity: 0.8; }
}

.flow-dot {
  filter: blur(1px);
  opacity: 0.8;
}

/* 莲灯包装器 */
.lotus-lamp-wrapper {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: floatIn 0.8s ease-out backwards;
}

/* 红点提示 */
.new-update-dot {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 10px;
  height: 10px;
  background: #ff4d4f;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  z-index: 20;
  box-shadow: 0 0 8px rgba(255, 77, 79, 0.6);
  animation: dotPulse 1.5s infinite;
}

@keyframes dotPulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes floatIn {
  from {
    opacity: 0;
    transform: translate(-50%, -40%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.lotus-lamp-wrapper:hover {
  transform: translate(-50%, -55%) scale(1.08);
  z-index: 100 !important;
}

/* 标签 - 修复溢出 */
.lamp-label {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 2px;
  white-space: nowrap;
  pointer-events: none;
}

.lamp-label.left {
  right: calc(100% + 8px);
  align-items: flex-end;
  text-align: right;
}

.lamp-label.right {
  left: calc(100% + 8px);
  align-items: flex-start;
  text-align: left;
}

.lamp-name {
  font-size: 16px;
  font-weight: 900;
  color: #f5e6d3;
  font-family: "Noto Serif SC", serif;
  text-shadow: 0 2px 8px rgba(0,0,0,0.6);
  letter-spacing: 2px;
}

.lamp-subtitle {
  font-size: 9px;
  color: rgba(212, 175, 55, 0.7);
  letter-spacing: 1px;
  padding: 1px 6px;
  background: rgba(0,0,0,0.3);
  border-radius: 8px;
}

/* 涟漪效果 */
.ripple-rings {
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.ripple-ring {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 15px;
  border: 1px solid rgba(255, 215, 0, 0.25);
  border-radius: 50%;
  animation: rippleExpand 3s ease-out infinite;
}

.ripple-ring.delay-1 {
  animation-delay: 1.5s;
}

@keyframes rippleExpand {
  0% {
    transform: translateX(-50%) scale(0.6);
    opacity: 0.6;
  }
  100% {
    transform: translateX(-50%) scale(1.8);
    opacity: 0;
  }
}

/* 底部统计 */
.page-footer {
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  background: rgba(10, 10, 26, 0.85);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 20px;
  z-index: 50;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-icon {
  width: 14px;
  height: 14px;
  color: #D4AF37;
}

.stat-value {
  font-size: 16px;
  font-weight: 900;
  color: #D4AF37;
  font-family: "Noto Serif SC", serif;
}

.stat-label {
  font-size: 10px;
  color: rgba(245, 230, 211, 0.5);
  letter-spacing: 1px;
}

.footer-info-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.footer-info-btn {
  background: none;
  border: none;
  padding: 4px;
  color: rgba(245, 230, 211, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s;
  border-radius: 50%;
}

.footer-info-btn:hover {
  color: #D4AF37;
  background: rgba(212, 175, 55, 0.1);
}

.footer-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 12px;
  background: rgba(10, 10, 26, 0.95);
  color: #F3E9D2;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 11px;
  white-space: nowrap;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.footer-tooltip::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: rgba(10, 10, 26, 0.95);
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
  border-right: 1px solid rgba(212, 175, 55, 0.3);
}

.stat-divider {
  width: 1px;
  height: 16px;
  background: rgba(212,175,55,0.2);
}

/* 亮灯状态增强 */
.lotus-lamp-wrapper.is-lit::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(255,215,0,0.12) 0%, transparent 70%);
  pointer-events: none;
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.8; transform: translateX(-50%) scale(1.1); }
}

/* ========== 点击水波纹效果 ========== */
.click-ripple-container {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 100;
}

.click-ripple-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(0);
  border-radius: 50%;
  border: 2px solid rgba(212, 175, 55, 0.6);
  animation: clickRippleExpand 2.5s ease-out forwards;
}

.click-ripple-ring.ring-1 {
  width: 60px;
  height: 20px;
  border-color: rgba(255, 215, 0, 0.7);
  animation-delay: 0s;
}

.click-ripple-ring.ring-2 {
  width: 100px;
  height: 35px;
  border-color: rgba(212, 175, 55, 0.5);
  animation-delay: 0.15s;
}

.click-ripple-ring.ring-3 {
  width: 150px;
  height: 50px;
  border-color: rgba(212, 175, 55, 0.3);
  animation-delay: 0.3s;
}

.click-ripple-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.9) 0%, rgba(255, 215, 0, 0) 70%);
  border-radius: 50%;
  animation: clickCenterPulse 0.8s ease-out forwards;
}

@keyframes clickRippleExpand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  60% {
    opacity: 0.6;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}

@keyframes clickCenterPulse {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(3);
    opacity: 0;
  }
}

/* ========== 增强水面层效果 ========== */
.water-layer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(to bottom, 
    transparent 0%, 
    rgba(10, 25, 47, 0.3) 30%,
    rgba(5, 20, 40, 0.5) 100%
  );
}

.water-wave {
  animation: waveMove 4s ease-in-out infinite;
  stroke-width: 2;
}

.wave-1 { 
  animation-delay: 0s; 
  stroke: rgba(212,175,55,0.2) !important;
}
.wave-2 { 
  animation-delay: 0.8s; 
  stroke: rgba(212,175,55,0.15) !important;
}
.wave-3 { 
  animation-delay: 1.6s; 
  stroke: rgba(212,175,55,0.1) !important;
}

@keyframes waveMove {
  0%, 100% { 
    transform: translateX(0) translateY(0); 
    opacity: 0.6;
  }
  25% {
    transform: translateX(8px) translateY(-2px);
    opacity: 0.8;
  }
  50% { 
    transform: translateX(15px) translateY(0); 
    opacity: 1;
  }
  75% {
    transform: translateX(8px) translateY(2px);
    opacity: 0.8;
  }
}

/* 增强涟漪效果 */
.ripple-ring {
  width: 60px;
  height: 18px;
  border: 2px solid rgba(255, 215, 0, 0.35);
  /* box-shadow: 0 0 10px rgba(255, 215, 0, 0.2); 移除昂贵的阴影 */
  will-change: transform, opacity;
}

.ripple-ring.delay-1 {
  animation-delay: 1s;
}

@keyframes rippleExpand {
  0% {
    transform: translateX(-50%) scale(0.5);
    opacity: 0.8;
  }
  100% {
    transform: translateX(-50%) scale(2.2);
    opacity: 0;
  }
}

/* 底部导航 - 深色主题 */
.bottom-nav.dark {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 70px;
  background: rgba(10, 10, 26, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(212, 175, 55, 0.2);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1000;
}

.bottom-nav.dark .nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  text-decoration: none;
  color: rgba(245, 230, 211, 0.5);
  transition: all 0.3s ease;
}

.bottom-nav.dark .nav-item.active {
  color: #D4AF37;
}

.bottom-nav.dark .nav-item svg {
  width: 24px;
  height: 24px;
}

.bottom-nav.dark .nav-item span {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
}

/* ========== 更新提示弹窗样式 ========== */
.update-toast {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 380px;
  background: linear-gradient(135deg, rgba(20, 20, 40, 0.95) 0%, rgba(30, 25, 45, 0.95) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 16px;
  padding: 16px;
  z-index: 2000;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(212, 175, 55, 0.15);
}

.toast-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.toast-icon {
  font-size: 20px;
  animation: sparkle 1.5s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
  50% { transform: scale(1.2) rotate(15deg); opacity: 0.8; }
}

.toast-title {
  flex: 1;
  font-size: 16px;
  font-weight: 700;
  color: #D4AF37;
  letter-spacing: 2px;
  font-family: "Noto Serif SC", serif;
}

.toast-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: rgba(245, 230, 211, 0.6);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #f5e6d3;
}

.toast-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.update-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: rgba(212, 175, 55, 0.08);
  border-radius: 10px;
  border-left: 3px solid #D4AF37;
}

.update-lamp {
  font-size: 14px;
  font-weight: 700;
  color: #D4AF37;
  font-family: "Noto Serif SC", serif;
}

.update-metric {
  font-size: 12px;
  color: rgba(245, 230, 211, 0.8);
  padding: 2px 8px;
  background: rgba(212, 175, 55, 0.15);
  border-radius: 10px;
  display: inline-block;
  width: fit-content;
}

.update-question {
  font-size: 11px;
  color: rgba(245, 230, 211, 0.5);
  line-height: 1.4;
  margin-top: 2px;
}

/* Toast 动画 */
.toast-slide-enter-active {
  animation: toastSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-slide-leave-active {
  animation: toastSlideOut 0.3s ease-in forwards;
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

@keyframes toastSlideOut {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px) scale(0.95);
  }
}
</style>

<!-- 报告弹窗样式（非 scoped，用于 Teleport） -->
<style>
.report-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 2000;
  padding: 40px 16px;
  overflow-y: auto;
}

.report-modal {
  width: 100%;
  max-width: 400px;
  background: linear-gradient(180deg, #1a1a2e 0%, #0d1b2a 100%);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(212, 175, 55, 0.1);
}

.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: rgba(212, 175, 55, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.report-title-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.report-icon {
  font-size: 28px;
}

.report-icon-svg {
  width: 32px;
  height: 32px;
  color: #D4AF37;
  flex-shrink: 0;
}

.report-title {
  font-size: 18px;
  font-weight: 900;
  color: #f5e6d3;
  font-family: "Noto Serif SC", serif;
  letter-spacing: 2px;
  margin: 0;
}

.report-date {
  font-size: 12px;
  color: rgba(212, 175, 55, 0.7);
  margin: 4px 0 0;
}

.report-desc {
  font-size: 10px;
  color: rgba(245, 230, 211, 0.4);
  margin-top: 4px;
  line-height: 1.4;
}

.report-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(245, 230, 211, 0.6);
  font-size: 22px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.report-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f5e6d3;
}

.report-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 总体评分卡片 */
.score-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: rgba(212, 175, 55, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(212, 175, 55, 0.15);
}

.score-circle {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.score-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(0deg);
}

.score-value {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.score-num {
  font-size: 24px;
  font-weight: 900;
  color: #D4AF37;
  font-family: "Noto Serif SC", serif;
}

.score-unit {
  font-size: 12px;
  color: rgba(212, 175, 55, 0.7);
  margin-top: 8px;
}

.score-info {
  flex: 1;
}

.score-level {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #D4AF37;
  margin-bottom: 8px;
}

.score-level.good {
  background: rgba(74, 222, 128, 0.2);
  color: #4ADE80;
}

.score-summary {
  font-size: 12px;
  color: rgba(245, 230, 211, 0.7);
  line-height: 1.6;
  margin: 0;
}

/* 区块标题 */
.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #f5e6d3;
  letter-spacing: 2px;
  margin: 0 0 12px;
  font-family: "Noto Serif SC", serif;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  width: 18px;
  height: 18px;
  color: #D4AF37;
  flex-shrink: 0;
}

/* 列表项图标 */
.item-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.item-icon.highlight {
  color: #4ADE80;
}

.item-icon.suggestion {
  color: #F59E0B;
}

/* 趋势箭头 SVG */
.trend-arrow-svg {
  width: 20px;
  height: 20px;
  color: #4ADE80;
}

.trend-direction.down .trend-arrow-svg {
  color: #F59E0B;
}

/* 对比图标 */
.compare-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.compare-icon {
  width: 14px;
  height: 14px;
}

.compare-item.best .compare-icon {
  color: #4ADE80;
}

.compare-item.worst .compare-icon {
  color: #F59E0B;
}

/* 洞察图标 */
.insight-icon {
  width: 10px;
  height: 10px;
  color: #D4AF37;
  flex-shrink: 0;
  margin-top: 4px;
}

/* 七维度列表 */
.dimension-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dimension-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
}

.dim-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dim-name {
  font-size: 13px;
  font-weight: 700;
  color: #f5e6d3;
}

.dim-status {
  font-size: 11px;
  color: rgba(245, 230, 211, 0.5);
}

.dim-score-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dim-bar-bg {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.dim-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.dim-score {
  font-size: 14px;
  font-weight: 900;
  min-width: 28px;
  text-align: right;
}

.dim-trend {
  font-size: 14px;
  min-width: 16px;
}

.dim-trend.up { color: #4ADE80; }
.dim-trend.down { color: #F59E0B; }
.dim-trend.stable { color: rgba(245, 230, 211, 0.5); }

/* 亮点和建议列表 */
.highlight-list,
.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.highlight-item,
.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(74, 222, 128, 0.08);
  border-radius: 10px;
  border-left: 3px solid #4ADE80;
}

.suggestion-item {
  background: rgba(245, 158, 11, 0.08);
  border-left-color: #F59E0B;
}

.highlight-icon,
.suggestion-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.highlight-text,
.suggestion-text {
  font-size: 12px;
  color: rgba(245, 230, 211, 0.8);
  line-height: 1.5;
}

/* 趋势概览 */
.trend-overview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(212, 175, 55, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(212, 175, 55, 0.15);
}

.trend-avg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.trend-avg-label {
  font-size: 11px;
  color: rgba(245, 230, 211, 0.5);
}

.trend-avg-value {
  font-size: 32px;
  font-weight: 900;
  color: #D4AF37;
  font-family: "Noto Serif SC", serif;
}

.trend-direction {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(74, 222, 128, 0.15);
  border-radius: 20px;
}

.trend-direction.up { background: rgba(74, 222, 128, 0.15); }
.trend-direction.down { background: rgba(245, 158, 11, 0.15); }

.trend-arrow {
  font-size: 20px;
  color: #4ADE80;
}

.trend-direction.down .trend-arrow { color: #F59E0B; }

.trend-text {
  font-size: 12px;
  color: #4ADE80;
  font-weight: 600;
}

.trend-direction.down .trend-text { color: #F59E0B; }

/* 周数据图表 */
.week-chart {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
}

.chart-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 120px;
  gap: 8px;
}

.chart-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bar-container {
  width: 100%;
  height: 80px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, #D4AF37 0%, #A83232 100%);
  border-radius: 4px 4px 0 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 4px;
  transition: height 0.5s ease;
}

.bar-value {
  font-size: 9px;
  color: #fff;
  font-weight: 700;
}

.bar-label {
  font-size: 10px;
  color: rgba(245, 230, 211, 0.6);
}

.bar-lit {
  font-size: 9px;
  color: #D4AF37;
}

/* 维度对比 */
.dimension-compare {
  display: flex;
  gap: 12px;
}

.compare-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  border-radius: 12px;
  text-align: center;
}

.compare-item.best {
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.2);
}

.compare-item.worst {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.compare-label {
  font-size: 11px;
  color: rgba(245, 230, 211, 0.6);
}

.compare-name {
  font-size: 13px;
  font-weight: 700;
  color: #f5e6d3;
}

.compare-score {
  font-size: 20px;
  font-weight: 900;
  font-family: "Noto Serif SC", serif;
}

.compare-item.best .compare-score { color: #4ADE80; }
.compare-item.worst .compare-score { color: #F59E0B; }

.compare-desc {
  font-size: 10px;
  color: rgba(245, 230, 211, 0.5);
}

/* 洞察列表 */
.insight-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.insight-bullet {
  color: #D4AF37;
  font-size: 14px;
}

.insight-text {
  font-size: 12px;
  color: rgba(245, 230, 211, 0.8);
  line-height: 1.5;
}

/* 弹窗动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .report-modal,
.modal-leave-to .report-modal {
  transform: scale(0.9) translateY(20px);
}
</style>
