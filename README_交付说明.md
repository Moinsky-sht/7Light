# 七星灯 - 健康打卡应用

## 项目概述

七星灯是一款基于中国传统养生文化的健康打卡应用，用户通过每日回答健康问题来"点亮"七星灯阵，记录和追踪自己的健康状态。

## 技术栈

- **前端框架**: Nuxt 3 (Vue 3 + TypeScript)
- **UI框架**: Tailwind CSS
- **状态管理**: Pinia
- **数据库**: SQLite (better-sqlite3 + Drizzle ORM)
- **认证**: JWT Token

## 项目结构

```
7Light/
├── plan.md              # 项目规划文档
├── readme.md            # 原始说明文档
├── README_交付说明.md    # 本文档
└── web/                 # Web应用主目录
    ├── app.vue          # 应用入口
    ├── nuxt.config.ts   # Nuxt配置
    ├── package.json     # 依赖配置
    ├── tailwind.config.js # Tailwind配置
    ├── assets/          # 静态资源
    │   └── css/         # 样式文件
    ├── components/      # Vue组件
    │   ├── icons/       # 图标组件
    │   ├── svg/         # SVG图形组件（灯、莲花等）
    │   └── ui/          # UI组件（导航、卡片、星海等）
    ├── composables/     # 组合式函数
    ├── layouts/         # 布局组件
    ├── middleware/      # 中间件（认证等）
    ├── pages/           # 页面组件
    │   ├── index.vue    # 首页（点灯）
    │   ├── lamps.vue    # 灯阵页面
    │   ├── social.vue   # 灯友星海
    │   ├── profile.vue  # 个人中心
    │   ├── login.vue    # 登录页
    │   ├── register.vue # 注册页
    │   ├── lamp/[id].vue # 单灯详情
    │   └── admin/       # 管理后台
    ├── public/          # 公共静态资源
    │   └── avatars/     # 头像资源
    │       └── sanguo_avatars/ # 三国人物头像（50个）
    ├── server/          # 服务端代码
    │   ├── api/         # API接口
    │   │   ├── auth/    # 认证相关
    │   │   ├── checkin/ # 打卡相关
    │   │   ├── lamps/   # 灯阵相关
    │   │   ├── social/  # 社交相关
    │   │   ├── speech/  # 语音识别
    │   │   └── seed/    # 测试数据
    │   ├── db/          # 数据库配置
    │   ├── services/    # 服务层
    │   └── utils/       # 工具函数
    └── stores/          # Pinia状态管理
```

## 核心功能

### 1. 用户认证
- 手机号注册/登录
- JWT Token认证
- 自动登录状态保持

### 2. 每日打卡
- 七星灯维度：天枢(命火)、天璇(谷神)、天玑(动静)、天权(归根)、玉衡(调息)、开阳(营卫)、摇光(固表)
- 每个维度7个子项，共49盏灯
- 支持文字和语音作答
- 打卡连续天数统计

### 3. 灯阵展示
- 7x7灯阵可视化
- 灯的状态：亮/灭
- 灯的亮度等级
- 点击查看详情

### 4. 灯友星海
- 3D星空效果展示好友
- 三国人物头像（50个）
- 打卡状态可视化
- 好友互动（借火、消息）

### 5. 个人中心
- 用户信息展示
- 打卡统计
- 设置管理

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装步骤

1. **进入项目目录**
```bash
cd 7Light/web
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，配置必要的环境变量
```

4. **启动开发服务器**
```bash
npm run dev
```

5. **访问应用**
打开浏览器访问 http://localhost:3000

### 初始化测试数据

启动服务器后，调用以下API创建测试用户：
```bash
curl -X POST http://localhost:3000/api/seed/mock-users
```

### 测试账号

| 手机号 | 密码 | 昵称 |
|--------|------|------|
| 13800000001 | 123456 | 清风道人 |
| 13800000002 | 123456 | 明月居士 |
| 13800000003 | 123456 | 紫云仙子 |
| ... | 123456 | ... |

共10个测试账号，密码统一为 `123456`

## 生产部署

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## API文档

详见 `web/API_DOCS.md`

## 项目状态

详见 `web/PROJECT_STATUS.md`

## 注意事项

1. **数据库文件**: `web/data/sevenstar.db` 是SQLite数据库文件，首次运行会自动创建
2. **头像资源**: 三国人物头像已包含在 `web/public/avatars/sanguo_avatars/` 目录
3. **环境变量**: 生产环境请务必修改 `.env` 中的 `JWT_SECRET`

## 联系方式

如有问题，请联系开发团队。

---

**版本**: 1.0.0  
**更新日期**: 2026年1月31日
