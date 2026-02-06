# 七星灯续命 APP - 代码审查报告

## 审查日期：2026-01-30

## 已修复的问题

### 1. utils/jwt.ts
- **问题**：`requireAuth` 函数使用了 `createError` 但没有导入
- **修复**：添加了 `createError` 到导入语句

### 2. api/user/home.get.ts
- **问题**：`stats.lifeSeconds` 和 `stats.todayAnswered` 可能为 null，导致 TypeScript 错误
- **修复**：使用可选链和空值合并运算符 `??` 处理 null 值

### 3. api/checkin/answer.post.ts
- **问题1**：文件开头有多余的字符 "5"
- **修复**：删除多余字符
- **问题2**：`litCount` 更新时在 `set` 中使用了 `db.select()`，这是不正确的用法
- **修复**：先查询当前灯状态，再使用查询结果更新

### 4. api/checkin/question.get.ts
- **问题**：导入了 `checkinStats` 和 `and` 但未使用
- **修复**：移除未使用的导入

## 文件结构确认

```
server/
├── db/
│   ├── schema.ts          ✅ 正确
│   └── index.ts           ✅ 正确
├── utils/
│   └── jwt.ts             ✅ 已修复
└── api/
    ├── auth/
    │   ├── register.post.ts   ✅ 正确
    │   ├── login.post.ts      ✅ 正确
    │   └── me.get.ts          ✅ 正确
    ├── user/
    │   └── home.get.ts        ✅ 已修复
    ├── checkin/
    │   ├── question.get.ts    ✅ 已修复
    │   └── answer.post.ts     ✅ 已修复
    ├── lamps/
    │   └── status.get.ts      ✅ 正确
    ├── social/
    │   ├── friends.get.ts     ✅ 正确
    │   ├── add.post.ts        ✅ 正确
    │   ├── boost.post.ts      ✅ 正确
    │   └── starfield.get.ts   ✅ 正确
    └── admin/prompts/
        ├── index.get.ts       ✅ 正确
        └── index.post.ts      ✅ 正确
```

## API 端点清单

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | ❌ |
| POST | /api/auth/login | 用户登录 | ❌ |
| GET | /api/auth/me | 获取当前用户 | ✅ |
| GET | /api/user/home | 首页数据 | ✅ |
| GET | /api/checkin/question | 获取今日问题 | ✅ |
| POST | /api/checkin/answer | 提交回答 | ✅ |
| GET | /api/lamps/status | 获取49灯状态 | ✅ |
| GET | /api/social/friends | 获取灯友列表 | ✅ |
| POST | /api/social/add | 添加好友 | ✅ |
| POST | /api/social/boost | 借火提醒 | ✅ |
| GET | /api/social/starfield | 星阵数据 | ✅ |
| GET | /api/admin/prompts | 获取提示词列表 | ✅ |
| POST | /api/admin/prompts | 创建/更新提示词 | ✅ |

## 数据库表（8张）

1. `users` - 用户表
2. `user_profiles` - 用户资料表
3. `lamp_status` - 灯状态表（49盏灯）
4. `checkin_logs` - 打卡记录表
5. `checkin_stats` - 打卡统计表
6. `checkin_requests` - 打卡请求状态表
7. `prompt_templates` - 提示词模板表
8. `prompt_runs` - 提示词运行记录表
9. `social_connections` - 好友关系表
10. `social_interactions` - 社交互动日志表
11. `health_reports` - 健康报告归档表

## 待优化项（非阻塞）

1. **性能优化**：`friends.get.ts` 中的循环查询可以优化为批量查询
2. **安全性**：admin API 应该添加管理员权限校验
3. **错误处理**：AI 解析失败时可以添加重试机制
4. **日志记录**：可以添加更详细的操作日志

## 运行指南

```bash
# 安装依赖
cd 1.29/7Light/web
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run typecheck
```

## 环境变量

复制 `.env.example` 为 `.env` 并配置：
- `DATABASE_PATH` - SQLite 数据库路径
- `JWT_SECRET` - JWT 密钥
- AI 提供商（地址/模型/Key）通过后台「系统设置」维护
