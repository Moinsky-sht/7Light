# 前端初始化与基础架构搭建 (Phase 1)

## 1. 项目初始化
1.  在当前目录下创建 Nuxt 3 项目（命名为 `web`，保持前后端分离结构）。
2.  配置 Git 忽略文件。

## 2. 依赖安装与配置
1.  **UI 框架**: 安装并配置 **Tailwind CSS** (及 PostCSS, Autoprefixer)。
2.  **状态管理**: 安装并配置 **Pinia** (`@pinia/nuxt`)。
3.  **工具库**: 安装 **VueUse** (`@vueuse/nuxt`) 用于响应式与设备交互。
4.  **动画**: 安装 **GSAP** 或配置 Vue Transition 默认样式。

## 3. 目录结构规范化 (遵循 Plan.md)
1.  创建 `components/svg/`：存放七星灯 SVG 组件。
2.  创建 `components/ui/`：存放通用 UI 组件。
3.  创建 `stores/`：存放 Pinia store (user, lamps, checkin)。
4.  创建 `composables/`：存放逻辑复用函数。
5.  创建 `layouts/`：定义移动端主布局。

## 4. 核心页面与导航实现
1.  **全局布局 (`layouts/default.vue`)**: 实现底部导航栏 (Bottom Navigation)，包含 4 个 Tab 图标（点灯、亮灯、灯友、我的）。
2.  **页面路由 (`pages/`)**:
    *   `index.vue` (Tab 1: 点灯/首页)
    *   `lamps.vue` (Tab 2: 亮灯/灯阵)
    *   `social.vue` (Tab 3: 灯友/星空)
    *   `profile.vue` (Tab 4: 我的)
3.  **基础样式**: 设置全局深色背景（深邃夜空蓝）与基础字体颜色。
