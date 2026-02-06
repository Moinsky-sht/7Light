# 七星灯续命 APP - API 文档

## 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: JWT Token (Cookie 或 Authorization Header)
- **响应格式**: JSON

---

## 认证模块 `/api/auth`

### 注册
```
POST /api/auth/register
```

**请求体:**
```json
{
  "phone": "13800138000",
  "password": "123456",
  "nickname": "灯友小明"  // 可选
}
```

**响应:**
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "userId": "uuid",
    "phone": "13800138000",
    "nickname": "灯友8000",
    "token": "jwt-token"
  }
}
```

### 登录
```
POST /api/auth/login
```

**请求体:**
```json
{
  "phone": "13800138000",
  "password": "123456"
}
```

**响应:**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "userId": "uuid",
    "phone": "13800138000",
    "nickname": "灯友小明",
    "avatarUrl": null,
    "token": "jwt-token"
  }
}
```

### 获取当前用户
```
GET /api/auth/me
```

**需要认证**: ✅

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "phone": "13800138000",
    "nickname": "灯友小明",
    "avatarUrl": null,
    "createdAt": "2026-01-30T00:00:00.000Z",
    "profile": {
      "gender": "M",
      "birthDate": "1998-01-01",
      "heightCm": 175,
      "weightKg": 70,
      "bmi": 22.86,
      "goals": ["减脂", "改善睡眠"]
    },
    "stats": {
      "totalDays": 15,
      "currentStreak": 3,
      "maxStreak": 7,
      "lifeSeconds": 1296000,
      "todayAnswered": 2
    }
  }
}
```

---

## 用户模块 `/api/user`

### 首页数据
```
GET /api/user/home
```

**需要认证**: ✅

**响应:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "nickname": "灯友小明",
      "avatarUrl": null
    },
    "lifeDays": 15,
    "lifeSeconds": 1296000,
    "totalDays": 15,
    "currentStreak": 3,
    "maxStreak": 7,
    "todayProgress": {
      "answered": 2,
      "required": 3,
      "isLit": false,
      "brightness": 20
    },
    "lampsLit": 12,
    "lampsTotal": 49,
    "bmi": 22.86
  }
}
```

---

## 打卡模块 `/api/checkin`

### 获取今日问题
```
GET /api/checkin/question
```

**需要认证**: ✅

**响应:**
```json
{
  "success": true,
  "data": {
    "questionId": "uuid",
    "dimensionId": 2,
    "subItemId": 5,
    "dimensionName": "天璇",
    "dimensionLabel": "谷神",
    "subItemName": "饮水",
    "question": "今日饮水量大概有多少？达到1500ml了吗？"
  }
}
```

### 提交回答
```
POST /api/checkin/answer
```

**需要认证**: ✅

**请求体:**
```json
{
  "requestId": "uuid",  // 幂等ID，可选
  "questionId": "uuid",
  "question": "今日饮水量大概有多少？",
  "answerText": "今天喝了大概6杯水",
  "dimensionId": 2,
  "subItemId": 5
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "reply": "善哉，水润身心。",
    "dimensionId": 2,
    "subItemId": 5,
    "metricName": "WaterIntake",
    "score": 8
  }
}
```

---

## 灯阵模块 `/api/lamps`

### 获取49盏灯状态
```
GET /api/lamps/status
```

**需要认证**: ✅

**响应:**
```json
{
  "success": true,
  "data": {
    "updatedAt": "2026-01-30T00:00:00.000Z",
    "summary": {
      "totalLamps": 49,
      "litLamps": 12,
      "litPercentage": 24,
      "totalBrightness": 28,
      "avgBrightness": 0.6
    },
    "grid": [
      {
        "dimensionId": 1,
        "dimensionKey": "TIANSHU",
        "name": "天枢",
        "label": "命火",
        "category": "打卡",
        "isLit": true,
        "litCount": 3,
        "totalBrightness": 9,
        "avgBrightness": 1.3,
        "subItems": [
          {
            "subItemId": 1,
            "name": "第一天",
            "state": "ON",
            "brightness": 3,
            "color": "GRAY",
            "lastValue": null,
            "updatedAt": "2026-01-30T00:00:00.000Z"
          }
          // ... 其他6个子项
        ]
      }
      // ... 其他6个维度
    ]
  }
}
```

---

## 社交模块 `/api/social`

### 获取灯友列表
```
GET /api/social/friends?status=ACCEPTED
```

**需要认证**: ✅

**查询参数:**
- `status`: `PENDING` | `ACCEPTED` | `ALL`

**响应:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "friends": [
      {
        "id": "uuid",
        "nickname": "灯友小红",
        "avatarUrl": null,
        "currentStreak": 7,
        "totalDays": 30,
        "todayCheckedIn": true,
        "litLamps": 25,
        "connectionStatus": "ACCEPTED",
        "connectionId": "uuid",
        "isRequester": true
      }
    ]
  }
}
```

### 添加好友
```
POST /api/social/add
```

**需要认证**: ✅

**请求体:**
```json
{
  "friendId": "uuid",  // 或
  "phone": "13800138001"
}
```

**响应:**
```json
{
  "success": true,
  "message": "好友请求已发送",
  "data": {
    "connectionId": "uuid",
    "status": "PENDING",
    "targetUser": {
      "id": "uuid",
      "nickname": "灯友小红",
      "avatarUrl": null
    }
  }
}
```

### 借火（提醒打卡）
```
POST /api/social/boost
```

**需要认证**: ✅

**请求体:**
```json
{
  "friendId": "uuid",
  "message": "快来点灯！"  // 可选
}
```

**响应:**
```json
{
  "success": true,
  "message": "借火成功，已提醒好友",
  "data": {
    "interactionId": "uuid",
    "friend": {
      "id": "uuid",
      "nickname": "灯友小红",
      "todayCheckedIn": false,
      "currentStreak": 6
    },
    "boostMessage": "灯友小明向你借火，快来点亮今日心灯！"
  }
}
```

### 获取星阵数据
```
GET /api/social/starfield
```

**需要认证**: ✅

**响应:**
```json
{
  "success": true,
  "data": {
    "updatedAt": "2026-01-30T00:00:00.000Z",
    "summary": {
      "totalStars": 6,
      "checkedInToday": 4,
      "notCheckedIn": 2,
      "checkedInPercentage": 67
    },
    "stars": [
      {
        "id": "uuid",
        "nickname": "我",
        "avatarUrl": null,
        "isSelf": true,
        "position": { "x": 0, "y": 0, "z": 0 },
        "brightness": 1.0,
        "todayCheckedIn": true,
        "currentStreak": 3,
        "totalDays": 15,
        "litLamps": 12,
        "starColor": "#4ECDC4"
      }
    ]
  }
}
```

---

## 管理后台 `/api/admin`

### 获取 AI 提示词（合并后的系统/用户提示词）
```
GET /api/admin/ai-prompts
```

**需要认证**: ✅（管理员）

### 保存 AI 提示词（按 key 覆盖更新）
```
POST /api/admin/ai-prompts
```

**需要认证**: ✅（管理员）

**请求体示例:**
```json
{
  "key": "PARSE",
  "name": "解析打卡回答",
  "status": "ACTIVE",
  "version": "v1.0.0",
  "systemTemplate": "....",
  "userTemplate": "....",
  "notes": "可选"
}
```

---

### 获取维度与子项（7×7）
```
GET /api/admin/dimensions
```

### 保存维度与子项（批量）
```
POST /api/admin/dimensions
```

**请求体示例:**
```json
{
  "dimensions": [
    {
      "id": 2,
      "key": "TIANXUAN",
      "name": "天璇",
      "label": "谷神",
      "category": "饮食",
      "subItems": [
        { "subId": 1, "name": "碳水" }
      ]
    }
  ]
}
```

### 获取提示词类型列表
```
GET /api/admin/prompts/types
```

**需要认证**: ✅（管理员）

### 获取提示词列表
```
GET /api/admin/prompts?type=PARSE&dimensionId=2
```

**需要认证**: ✅

**查询参数:**
- `type`: `QUESTION` | `PARSE` | `WARNING` | `REPORT` | `TAGS`
- `dimensionId`: 1-7
- `subItemId`: 1-7
- `status`: `DRAFT` | `ACTIVE` | `DEPRECATED`

### 创建/更新提示词
```
POST /api/admin/prompts
```

**需要认证**: ✅

**请求体:**
```json
{
  "id": "uuid",  // 更新时提供
  "type": "PARSE",
  "dimensionId": 2,
  "subItemId": 5,
  "version": "v1.0.0",
  "status": "ACTIVE",
  "template": "你是健康解析器...",
  "jsonSchema": { ... },
  "notes": "饮水量解析模板"
}
```

### 发布提示词（设为 ACTIVE 并废弃同组其它版本）
```
POST /api/admin/prompts/publish
```

**需要认证**: ✅（管理员）

**请求体:**
```json
{ "id": "uuid" }
```

### 删除提示词
```
DELETE /api/admin/prompts/:id
```

**需要认证**: ✅（管理员）

---

### 获取用户列表
```
GET /api/admin/users?q=xxx&role=admin&status=ACTIVE&limit=50&offset=0
```

**需要认证**: ✅（管理员）

**查询参数:**
- `q`: 模糊搜索（手机号/昵称/邮箱）
- `role`: `user` | `admin`
- `status`: `ACTIVE` | `DISABLED`
- `limit`: 1-200
- `offset`: >= 0

### 获取用户详情
```
GET /api/admin/users/:id
```

**需要认证**: ✅（管理员）

**响应包含:**
- `user`: 基础信息（含 status / lastLogin）
- `profile`: 资料
- `stats`: 打卡统计
- `latestLogs`: 最近 10 条打卡

### 更新用户信息
```
POST /api/admin/users/update
```

**需要认证**: ✅（管理员）

**请求体:**
```json
{
  "userId": "uuid",
  "phone": "可选",
  "email": "可选",
  "nickname": "可选"
}
```

### 更新用户角色
```
POST /api/admin/users/role
```

**请求体:**
```json
{ "userId": "uuid", "role": "user|admin" }
```

### 更新用户状态（禁用/启用）
```
POST /api/admin/users/status
```

**请求体:**
```json
{ "userId": "uuid", "status": "ACTIVE|DISABLED" }
```

### 重置用户密码
```
POST /api/admin/users/reset-password
```

**请求体:**
```json
{ "userId": "uuid", "password": "可选，不传则自动生成" }
```

### 更新用户 VIP 状态
```
POST /api/admin/users/vip
```

**请求体:**
```json
{ "userId": "uuid", "isPro": true, "proUntil": "可选 ISO 时间" }
```

### 导出用户数据（用户数据库快照）
```
GET /api/admin/users/:id/export
```

---

### 获取打卡记录（全站）
```
GET /api/admin/checkins?q=xxx&userId=uuid&dimensionId=2&subItemId=5&inputType=TEXT&from=ISO&to=ISO&isValid=true&limit=50&offset=0
```

**需要认证**: ✅（管理员）

---

### 获取提示词运行记录
```
GET /api/admin/prompt-runs?q=xxx&userId=uuid&templateId=uuid&limit=50&offset=0
```

**需要认证**: ✅（管理员）

---

### 获取审计日志
```
GET /api/admin/audit?q=xxx&action=USER_ROLE_UPDATE&entityType=user&limit=50&offset=0
```

**需要认证**: ✅（管理员）

---

### 获取 AI 提供商配置
```
GET /api/admin/settings/ai
```

### 更新 AI 提供商配置
```
POST /api/admin/settings/ai
```

### 测试 AI 提供商连接
```
POST /api/admin/settings/ai-test
```

---

### 获取通用系统设置
```
GET /api/admin/settings/app
```

### 更新通用系统设置
```
POST /api/admin/settings/app
```

**请求体:**
```json
{
  "settings": [
    { "key": "DAILY_QUESTION_LIMIT", "valueType": "NUMBER", "value": "10", "description": "每日答题上限" }
  ]
}
```

---

## 错误响应格式

```json
{
  "statusCode": 400,
  "message": "错误描述"
}
```

**常见错误码:**
- `400`: 请求参数错误
- `401`: 未登录或 Token 过期
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 维度与子项 ID 对照表

| 维度ID | 维度Key | 名称 | 标签 | 子项 |
|--------|---------|------|------|------|
| 1 | TIANSHU | 天枢 | 命火 | 第1-7天 |
| 2 | TIANXUAN | 天璇 | 谷神 | 碳水/蔬果/蛋白/油盐/饮水/节律/知止 |
| 3 | TIANJI | 天玑 | 动静 | 步数/心肺/肌力/破坐/拉伸/姿态/户外 |
| 4 | TIANQUAN | 天权 | 归根 | 入睡/时长/效率/连续/醒感/仪式/午憩 |
| 5 | YUHENG | 玉衡 | 调息 | 稳定/压力/专注/社交/愉悦/冥想/截断 |
| 6 | KAIYANG | 开阳 | 营卫 | 排泄/皮肤/痛感/体温/视疲/呼吸/指标 |
| 7 | YAOGUANG | 摇光 | 固表 | 光磁/清气/节气/离屏/噪音/光合/温湿 |
