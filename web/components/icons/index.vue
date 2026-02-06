<script setup lang="ts">
/**
 * 统一 SVG 图标组件库
 * 所有图标都使用 SVG 格式，支持自定义大小和颜色
 */

defineProps<{
  name: string
  size?: number | string
  color?: string
}>()
</script>

<template>
  <!-- 星星图标 - 用于 logo -->
  <svg v-if="name === 'star'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
  
  <!-- 实心星星 -->
  <svg v-else-if="name === 'star-filled'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" :fill="color || 'currentColor'">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
  
  <!-- 刷新图标 -->
  <svg v-else-if="name === 'refresh'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M23 4v6h-6"/>
    <path d="M1 20v-6h6"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
  
  <!-- 麦克风图标 -->
  <svg v-else-if="name === 'mic'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
  
  <!-- 笔/编辑图标 -->
  <svg v-else-if="name === 'pen'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z"/>
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
    <path d="M2 2l7.586 7.586"/>
    <circle cx="11" cy="11" r="2"/>
  </svg>
  
  <!-- 停止图标 -->
  <svg v-else-if="name === 'stop'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" :fill="color || 'currentColor'">
    <rect x="6" y="6" width="12" height="12" rx="2"/>
  </svg>
  
  <!-- 音频/声音图标 -->
  <svg v-else-if="name === 'audio'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
  
  <!-- 对勾/检查图标 -->
  <svg v-else-if="name === 'check'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
  
  <!-- 叉号/关闭图标 -->
  <svg v-else-if="name === 'close'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
  
  <!-- 闪光/星光图标 -->
  <svg v-else-if="name === 'sparkle'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" :fill="color || 'currentColor'">
    <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z"/>
  </svg>
  
  <!-- 问号图标 -->
  <svg v-else-if="name === 'question'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
  
  <!-- 用户/好友图标 -->
  <svg v-else-if="name === 'users'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
  
  <!-- 消息/聊天图标 -->
  <svg v-else-if="name === 'message'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
  
  <!-- 火焰图标 -->
  <svg v-else-if="name === 'fire'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" :fill="color || 'currentColor'">
    <path d="M12 23c-4.97 0-9-3.58-9-8 0-2.52 1.17-4.83 3-6.36V8c0-4.42 3.58-8 8-8 .35 0 .69.03 1.03.08C13.77 1.33 13 3.58 13 6c0 2.21.89 4.21 2.34 5.66l.66.66.66-.66C18.11 10.21 19 8.21 19 6c0-2.42-.77-4.67-2.03-6.08.34-.05.68-.08 1.03-.08 4.42 0 8 3.58 8 8v.64c1.83 1.53 3 3.84 3 6.36 0 4.42-4.03 8-9 8z"/>
  </svg>
  
  <!-- 拖动/旋转图标 -->
  <svg v-else-if="name === 'drag'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="5 9 2 12 5 15"/>
    <polyline points="9 5 12 2 15 5"/>
    <polyline points="15 19 12 22 9 19"/>
    <polyline points="19 9 22 12 19 15"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="12" y1="2" x2="12" y2="22"/>
  </svg>
  
  <!-- 返回/左箭头图标 -->
  <svg v-else-if="name === 'back'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
  
  <!-- 右箭头图标 -->
  <svg v-else-if="name === 'arrow-right'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
  
  <!-- 历史/时钟图标 -->
  <svg v-else-if="name === 'history'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
  
  <!-- 分析/图表图标 -->
  <svg v-else-if="name === 'chart'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
  
  <!-- 建议/灯泡图标 -->
  <svg v-else-if="name === 'lightbulb'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 18h6"/>
    <path d="M10 22h4"/>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
  </svg>
  
  <!-- 加号图标 -->
  <svg v-else-if="name === 'plus'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
  
  <!-- 手表图标 -->
  <svg v-else-if="name === 'watch'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="7"/>
    <polyline points="12 9 12 12 13.5 13.5"/>
    <path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"/>
  </svg>
  
  <!-- 手环图标 -->
  <svg v-else-if="name === 'band'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="8" y="2" width="8" height="20" rx="4"/>
    <line x1="10" y1="8" x2="14" y2="8"/>
    <line x1="10" y1="12" x2="14" y2="12"/>
  </svg>
  
  <!-- 心形图标 -->
  <svg v-else-if="name === 'heart'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
  
  <!-- 菜单/列表图标 -->
  <svg v-else-if="name === 'menu'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
  
  <!-- 报告/文档图标 -->
  <svg v-else-if="name === 'report'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
  
  <!-- 导出图标 -->
  <svg v-else-if="name === 'export'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
  
  <!-- 奖杯/成就图标 -->
  <svg v-else-if="name === 'trophy'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
  
  <!-- 设置/齿轮图标 -->
  <svg v-else-if="name === 'settings'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
  
  <!-- 信息图标 -->
  <svg v-else-if="name === 'info'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
  
  <!-- 反馈/评论图标 -->
  <svg v-else-if="name === 'feedback'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
  
  <!-- 退出/电源图标 -->
  <svg v-else-if="name === 'logout'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
  
  <!-- 记录/笔记图标 -->
  <svg v-else-if="name === 'note'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
  
  <!-- 圆圈图标 -->
  <svg v-else-if="name === 'circle'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
  </svg>
  
  <!-- 首页图标 -->
  <svg v-else-if="name === 'home'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
  
  <!-- 灯/灯阵图标 -->
  <svg v-else-if="name === 'lamp'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
  
  <!-- 用户/个人图标 -->
  <svg v-else-if="name === 'user'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
  
  <!-- 编辑图标 -->
  <svg v-else-if="name === 'edit'" :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
  
  <!-- 默认图标 -->
  <svg v-else :width="size || 24" :height="size || 24" viewBox="0 0 24 24" fill="none" :stroke="color || 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
</template>
