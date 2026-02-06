# 七星灯续命 APP 开发计划 (Plan)

版本：v0.2（可落地版）
最后更新：2026-01-29

## 1. 目标与范围

### 1.1 产品目标
- 以“七星灯续命”为叙事外壳，实现一个可持续使用的健康打卡系统：每天回答问题、沉淀语料、点亮灯阵。
- 支持移动端与网页端同一套应用与同一套账号体系：优先以 Web + PWA 落地，后续再考虑小程序/原生壳。

### 1.2 MVP 范围（必须可构建可演示）
- 登录/注册 + 基础信息补全（性别、出生日期、身高、体重、目标标签）。
- Tab1「点灯」：每日 3 题闭环（取题 -> 回答 -> 解析 -> 点亮进度/主灯状态）。
- Tab2「亮灯」：49 盏灯状态渲染（7 维度 × 7 子项），点进任意灯展示“当前状态/历史语料摘要/建议”的占位页。
- Prompt 管理后台（最小可用）：按“7 维度 49 子项”管理提示词版本，支持回放与解析成功率统计。

### 1.3 非目标（MVP 不做或降级）
- 真正的穿戴设备/Apple Health 同步。
- Tab3「灯友」的 3D 高保真星阵（MVP 可用 2D/简化交互）。
- 周报/月报的高质量生成（MVP 先保留接口与模板）。

## 2. 端到端核心流程

### 2.1 新用户流程
1) 注册/登录 -> 2) 补全基础信息 -> 3) 初始化 49 盏灯状态与统计 -> 4) 进入 Tab1 开始首日提问。

### 2.2 每日点灯流程（闭环）
1) 前端请求今日问题 `GET /api/checkin/question`（根据“缺失最久/最暗维度”加权）
2) 用户提交回答 `POST /api/checkin/answer`（携带 `request_id` 幂等）
3) 后端落库原始语料 -> 入队 AI 解析任务 -> 立即返回“处理中”
4) Worker 调用大模型进行结构化解析（JSON Only）
5) 后端校验解析结果（Schema + 维度/子项一致性）
6) 校验通过：事务内写入 `Health_Corpus_Log` + 更新 `Star_Lamp_Status` + 更新 `Checkin_Statistics`
7) WebSocket 推送解析完成与点亮结果，前端更新 Tab1/Tab2，并在 Tab2 显示“？”提示更新

## 3. 技术架构（推荐落地方案）

### 3.1 前端（Web + Mobile 同构）
- 框架：Nuxt 3（Vue 3）
- UI：Tailwind CSS
- 状态管理：Pinia
- 动画：Vue Transition + GSAP
- 图形：SVG 为核心（灯盏/星阵 UI），Three.js 仅用于 Tab3 进阶
- 形态：Web 优先 + PWA（安装到桌面、离线缓存静态资源）

建议目录结构（Nuxt）：
- `pages/`：tab 页面与子页路由
- `components/svg/`：所有 SVG 灯盏与图标组件
- `components/ui/`：按钮、卡片、弹层、输入框等
- `stores/`：用户、灯阵、打卡、WebSocket 连接
- `composables/`：`useApi`、`useSocket`、`useSafeArea`、`useResponsive`

### 3.2 后端（API + Worker + WebSocket）
推荐：Node.js + NestJS（REST + WebSocket）
- ORM：Prisma（或 TypeORM）
- 队列：BullMQ（Redis）
- 实时：Socket.io（简单可靠）
- 校验：Ajv（JSON Schema 校验）+ Zod（运行时 DTO 校验）

模块划分：
- `auth`：登录/注册、JWT、会话
- `user`：资料、目标、统计
- `lamps`：49 灯状态读写、维度/子项定义
- `checkin`：问题生成、回答接收、幂等与任务派发
- `ai`：模型调用、prompt 选择、解析校验、重试
- `prompts-admin`：提示词管理后台（鉴权为 admin）
- `social`：灯友关系与“借火”（MVP 可先留接口）

### 3.3 数据库与缓存
- PostgreSQL：主数据
- Redis：队列、WebSocket session、灯阵热缓存

## 4. 领域模型：7 维度 × 49 子项

### 4.1 维度 ID 定义
- 1 天枢：命火（打卡）
- 2 天璇：谷神（饮食）
- 3 天玑：动静（运动）
- 4 天权：归根（睡眠）
- 5 玉衡：调息（心理）
- 6 开阳：营卫（体征）
- 7 摇光：固表（环境）

### 4.2 子项 ID（每维度 1-7）
- 天枢（命火）：连续打卡第 1-7 天（子项 ID=1..7 对应 streak 天数）
- 天璇（饮食）：1 碳水、2 蔬果、3 蛋白、4 控油盐、5 水分、6 节律、7 知止
- 天玑（运动）：1 步数、2 心肺、3 肌力、4 破久坐、5 拉伸、6 姿态、7 户外
- 天权（睡眠）：1 入睡时间、2 时长、3 效率/潜伏、4 连续性、5 醒后感、6 仪式感、7 午憩
- 玉衡（心理）：1 稳定度、2 压力感、3 专注度、4 社交、5 愉悦感、6 冥想、7 念头截断
- 开阳（体征）：1 排泄、2 皮肤、3 痛感、4 体温感、5 视疲劳、6 呼吸、7 基础指标
- 摇光（环境）：1 光磁、2 清气、3 节气、4 离屏、5 噪音、6 光合、7 温湿

## 5. 数据库设计（更可实施版本）

### 5.1 核心表

#### `users`
- `id` (uuid, pk)
- `nickname`、`avatar_url`
- `email`/`phone`（可空，取决于登录方式）
- `password_hash`（如使用密码登录）
- `created_at`、`updated_at`

#### `user_profile`
- `user_id` (uuid, pk/fk)
- `gender`（enum）
- `birth_date`（date）
- `height_cm`、`weight_kg`
- `bmi`（numeric，后端计算写入）
- `goals`（jsonb，多选标签）
- `sensitive_extra`（jsonb，加密后存储：慢性病/过敏史等，MVP 可先留字段不启用）

#### `star_lamp_status`
- `id` (uuid, pk)
- `user_id` (uuid, fk)
- `dimension_id` (int, 1-7)
- `sub_item_id` (int, 1-7)
- `state`（enum：`OFF`/`ON`，MVP 先用二元）
- `brightness`（int：0-3，MVP 可 0-1）
- `updated_at`

约束与索引：
- unique(`user_id`,`dimension_id`,`sub_item_id`)
- index(`user_id`,`dimension_id`)

#### `health_corpus_log`
- `id` (uuid, pk)
- `user_id` (uuid, fk)
- `request_id`（uuid，幂等关联）
- `input_type`（enum：`TEXT`/`AUDIO_TEXT`）
- `raw_content`（text）
- `ai_result`（jsonb，结构化解析镜像）
- `dimension_id`、`sub_item_id`
- `score_delta`（int，可选，后续做红橙黄）
- `created_at`

#### `checkin_statistics`
- `user_id` (uuid, pk/fk)
- `total_days`（int）
- `current_streak`（int）
- `max_streak`（int）
- `life_extension_seconds`（bigint，后端计算）
- `last_checkin_date`（date，用于防重复计天）

#### `checkin_requests`（幂等与异步状态）
- `request_id`（uuid, pk）
- `user_id`（uuid, fk）
- `status`（enum：`RECEIVED`/`PROCESSING`/`SUCCEEDED`/`FAILED`）
- `task_id`（string，队列任务标识）
- `error_code`、`error_message`
- `created_at`、`updated_at`

### 5.2 Prompt 管理与观测（关键落地能力）

#### `prompt_templates`
- `id` (uuid, pk)
- `type`（enum：`QUESTION`/`PARSE`/`WARNING`/`REPORT`/`TAGS`）
- `dimension_id`（int, nullable）
- `sub_item_id`（int, nullable）
- `version`（string，例如 `v1.0.3`）
- `status`（enum：`DRAFT`/`ACTIVE`/`DEPRECATED`）
- `template`（text）
- `json_schema`（jsonb，解析/输出严格结构）
- `notes`（text）
- `created_at`、`updated_at`

#### `prompt_runs`
- `id` (uuid, pk)
- `template_id`（uuid, fk）
- `user_id`（uuid, fk, nullable）
- `request_id`（uuid, nullable）
- `input_snapshot`（jsonb）
- `raw_model_output`（text）
- `parsed_output`（jsonb, nullable）
- `is_valid`（bool）
- `latency_ms`（int）
- `created_at`

## 6. AI 调用与校验策略（防“瞎解析”）

### 6.1 模型访问方式
- 通过 OpenAI 兼容协议访问 MiniMax-M2.1（`base_url` 与 `api_key` 必须放入环境变量，严禁写入仓库与文档示例中）

### 6.2 Prompt 选择
- `QUESTION`：按“缺失最久/最暗维度”加权抽样选择维度与子项，再选对应 `prompt_templates` 的 `ACTIVE` 版本
- `PARSE`：按“预期维度/子项”选模板，确保解析结果强约束

### 6.3 输出要求（强约束）
- 必须 `JSON Only`，禁止夹带解释文字
- 必须满足 `json_schema`
- 必须满足业务一致性：`dimension_id/sub_item_id` 必须等于本次任务的“预期维度/子项”

### 6.4 后端校验与重生成
对每次模型输出执行：
1) JSON 解析（失败 -> 重试）
2) Schema 校验（失败 -> 重试）
3) 维度/子项一致性校验（失败 -> 驳回并重试）

重试策略：
- 同一任务最多重试 2 次
- 超过重试：标记 `FAILED`，前端提示用户“未检测到有效健康信息，请补充更具体状态”

## 7. API 设计（可直接进入实现）

约定：
- 认证：`Authorization: Bearer <jwt>`
- 幂等：写操作必须带 `request_id`（uuid）

### 7.1 Auth

#### `POST /api/auth/login`
请求（示例：密码登录，实际可替换为验证码登录）：
```json
{ "email": "a@b.com", "password": "***" }
```
响应：
```json
{ "token": "jwt", "user": { "id": "uuid", "nickname": "..." } }
```

### 7.2 用户资料

#### `POST /api/user/init`
请求：
```json
{
  "gender": "M",
  "birth_date": "1998-10-01",
  "height_cm": 175,
  "weight_kg": 70,
  "goals": ["减脂", "改善睡眠"]
}
```
响应：
```json
{ "bmi": 22.86 }
```

#### `GET /api/user/home`
响应：
```json
{
  "life_extension_seconds": 86400,
  "total_days": 12,
  "current_streak": 3,
  "bmi": 22.86,
  "today_progress": { "answered": 1, "required": 3, "is_lit": false }
}
```

### 7.3 打卡与 AI

#### `GET /api/checkin/question`
响应：
```json
{
  "question_id": "uuid",
  "dimension_id": 2,
  "sub_item_id": 5,
  "question": "今日饮水量大概有 1500ml 吗？"
}
```

#### `POST /api/checkin/answer`
请求：
```json
{
  "request_id": "uuid",
  "question_id": "uuid",
  "answer_text": "今天喝了大概 6 杯水。"
}
```
响应（立即返回，异步处理）：
```json
{ "task_id": "queue-task-id", "status": "PROCESSING" }
```

### 7.4 灯阵

#### `GET /api/lamps/status`
响应：
```json
{
  "updated_at": "2026-01-29T00:00:00Z",
  "grid": [
    { "dimension_id": 1, "sub_item_id": 1, "state": "ON", "brightness": 1 },
    { "dimension_id": 1, "sub_item_id": 2, "state": "OFF", "brightness": 0 }
  ]
}
```

### 7.5 Prompt 管理后台（admin）

#### `GET /api/admin/prompts?type=PARSE&dimension_id=2&sub_item_id=5`
#### `POST /api/admin/prompts`
#### `POST /api/admin/prompts/:id/activate`
#### `GET /api/admin/prompt-runs?dimension_id=2&sub_item_id=5&from=...&to=...`

## 8. WebSocket 事件（点亮即时反馈）

连接：`/ws/checkin`（携带 JWT）

事件：
- `checkin.task.updated`：`{ task_id, status }`
- `checkin.task.succeeded`：`{ task_id, dimension_id, sub_item_id, lamp_patch, today_progress }`
- `checkin.task.failed`：`{ task_id, error_code, message }`

## 9. UI/UX 规划（更可执行）

### 9.1 总体风格
- 背景：深邃夜空（渐变 + 星点噪声）
- 文字：水墨灰与暖白
- 强调色：暖金/烛红

### 9.2 SVG 设计规范（确保工程化）
- 每个灯盏 SVG 必须固定 `viewBox`，避免因缩放导致位置漂移
- 灯光采用 `filter`（高斯模糊/外发光）并通过参数控制强度
- 所有颜色与亮度映射由统一的 `lampTheme`（前端常量）提供

### 9.3 四个 Tab（与需求对齐）

#### Tab1 点灯
- 顶部：续命时长（以“天”为展示单位，底层存秒）
- 中部：今日题卡（支持“换题”但受限频率）
- 底部：主灯（按当日回答进度 0/1/2/3 逐级点亮）

#### Tab2 亮灯
- 7 盏大灯总览（点击进入子页）
- 子页展示 7 盏小灯（49 子项）
- 若 Tab1 有新解析写入，Tab2 导航显示“？”提示

#### Tab3 灯友
- MVP：2D 星空 + 头像发光点（无需 3D）
- 互动：借火（触发提醒 + 互动日志落库）

#### Tab4 我的
- 基础信息与 BMI
- 打卡统计（总天数、连续、最高连续）
- 语料归纳与报告入口（MVP 可先展示占位）

## 10. 工程与部署（确保可构建）

### 10.1 环境变量（示例）
- `NODE_ENV`
- `APP_URL`
- `CORS_ORIGIN`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- AI 提供商（地址/模型/Key）通过后台「系统设置」维护，不放在环境变量里

### 10.2 本地与线上
- 本地：建议 docker-compose（Postgres + Redis）+ 前后端各自启动
- 线上：API 与 Worker 分开部署，Redis/DB 使用托管服务

### 10.3 安全与隐私（MVP 也要做到位）
- 账号安全：密码登录则使用强哈希（bcrypt/argon2），并做登录与验证码接口限流
- 鉴权：JWT + 短期有效期 + 刷新策略（或服务端 session），关键写接口必须鉴权
- 幂等：所有打卡写入路径以 `request_id` 去重，杜绝重复计时长
- 数据保护：慢性病/过敏史等敏感字段做字段级加密，默认不返回给任何非本人请求
- 审计回放：Prompt 回放数据仅 admin 可访问，且禁止在日志中输出密钥与原始隐私文本

## 11. 里程碑与验收标准

### M0（可跑通的骨架）
- 前端 4 个 Tab 路由完成，SVG 灯组件可渲染
- 后端 Auth + 用户资料接口可用

### M1（核心闭环演示）
- `checkin/question` -> `checkin/answer` -> 异步解析 -> WebSocket 推送 -> Tab2 灯阵更新
- 幂等生效：同一 `request_id` 重复提交不重复计入

### M2（Prompt 管理后台可用）
- 可按维度/子项维护提示词版本
- 可查看解析成功率与失败样本（`prompt_runs` 回放）
