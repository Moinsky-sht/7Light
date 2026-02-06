/**
 * 命续 · 七星灯 APP - 数据库 Schema 定义
 * 使用 Drizzle ORM + SQLite
 */

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// ==================== 用户相关 ====================

// 用户表
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  phone: text('phone').unique(),
  email: text('email'),
  role: text('role').default('user'),
  status: text('status').default('ACTIVE'), // ACTIVE/DISABLED
  isPro: integer('is_pro', { mode: 'boolean' }).default(false),
  proUntil: text('pro_until'),
  disabledAt: text('disabled_at'),
  lastLoginAt: text('last_login_at'),
  lastLoginIp: text('last_login_ip'),
  failedLoginCount: integer('failed_login_count').default(0),
  lockedUntil: text('locked_until'),
  passwordHash: text('password_hash').notNull(),
  nickname: text('nickname'),
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

export const appSettings = sqliteTable('app_settings', {
  key: text('key').primaryKey(),
  value: text('value'),
  valueType: text('value_type').default('STRING'), // STRING/NUMBER/BOOLEAN/JSON
  description: text('description'),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

export const adminAuditLogs = sqliteTable('admin_audit_logs', {
  id: text('id').primaryKey(),
  actorUserId: text('actor_user_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  detail: text('detail'),
  ip: text('ip'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

// 用户资料表
export const userProfiles = sqliteTable('user_profiles', {
  userId: text('user_id').primaryKey().references(() => users.id),
  gender: text('gender'), // M/F
  birthDate: text('birth_date'),
  heightCm: integer('height_cm'),
  weightKg: real('weight_kg'),
  bmi: real('bmi'),
  goals: text('goals'), // JSON数组: ["减脂", "改善睡眠"]
  chronicDiseases: text('chronic_diseases'), // JSON数组
  allergies: text('allergies'), // JSON数组
  sleepPattern: text('sleep_pattern'), // 早睡早起/熬夜/轮班
  dietHabit: text('diet_habit'), // 素食/肉食/均衡
  exerciseFreq: text('exercise_freq'), // 每日/每周2-3次/几乎不运动
  waterIntake: text('water_intake'),
  workType: text('work_type'),
  lateNight: integer('late_night', { mode: 'boolean' }).default(false),
  regularMeals: integer('regular_meals', { mode: 'boolean' }).default(false),
  healthConcerns: text('health_concerns'), // JSON数组
  smokeDrink: text('smoke_drink'), // JSON: {smoke: bool, drink: bool}
  occupation: text('occupation'), // 职业
  notificationSettings: text('notification_settings'), // JSON: {checkin: bool, dimensions: {1: bool, ...}}
  settings: text('settings'), // JSON: {notifications:boolean, dailyReminder:boolean, darkMode:boolean}
  privacySettings: text('privacy_settings'), // JSON
  connectedDevices: text('connected_devices'), // JSON数组
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// ==================== 灯状态相关 ====================

// 灯状态表 (49盏灯 = 7维度 × 7子项)
export const lampStatus = sqliteTable('lamp_status', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  dimensionId: integer('dimension_id').notNull(), // 1-7
  subItemId: integer('sub_item_id').notNull(), // 1-7
  state: text('state').default('OFF'), // ON/OFF
  brightness: integer('brightness').default(0), // 0-3
  color: text('color').default('GRAY'), // GRAY/YELLOW/ORANGE/RED
  lastValue: text('last_value'), // 最后一次记录的值
  litCount: integer('lit_count').default(0), // 累计点亮次数
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// ==================== 打卡相关 ====================

// 打卡记录表
export const checkinLogs = sqliteTable('checkin_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  requestId: text('request_id').unique(), // 幂等ID
  questionId: text('question_id'),
  question: text('question'),
  answerText: text('answer_text'),
  inputType: text('input_type').default('TEXT'), // TEXT/AUDIO_TEXT
  aiResult: text('ai_result'), // JSON: AI解析结果
  dimensionId: integer('dimension_id'),
  subItemId: integer('sub_item_id'),
  metricName: text('metric_name'),
  valueExtracted: text('value_extracted'),
  score: integer('score'), // 1-10
  isValid: integer('is_valid', { mode: 'boolean' }).default(false),
  aiReply: text('ai_reply'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

// 打卡统计表
export const checkinStats = sqliteTable('checkin_stats', {
  userId: text('user_id').primaryKey().references(() => users.id),
  totalDays: integer('total_days').default(0),
  currentStreak: integer('current_streak').default(0),
  maxStreak: integer('max_streak').default(0),
  lifeSeconds: integer('life_seconds').default(0), // 续命总秒数
  todayAnswered: integer('today_answered').default(0), // 今日已答题数
  lastCheckinDate: text('last_checkin_date')
})

// 打卡请求状态表 (异步处理)
export const checkinRequests = sqliteTable('checkin_requests', {
  requestId: text('request_id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  status: text('status').default('RECEIVED'), // RECEIVED/PROCESSING/SUCCEEDED/FAILED
  taskId: text('task_id'),
  errorCode: text('error_code'),
  errorMessage: text('error_message'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// ==================== 提示词管理 ====================

// 提示词模板表
export const promptTemplates = sqliteTable('prompt_templates', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // QUESTION/PARSE/WARNING/REPORT/TAGS
  dimensionId: integer('dimension_id'),
  subItemId: integer('sub_item_id'),
  version: text('version').default('v1.0.0'),
  status: text('status').default('ACTIVE'), // DRAFT/ACTIVE/DEPRECATED
  template: text('template').notNull(),
  jsonSchema: text('json_schema'), // JSON Schema定义
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

export const promptBundles = sqliteTable('prompt_bundles', {
  key: text('key').primaryKey(),
  name: text('name').notNull(),
  status: text('status').default('ACTIVE'), // DRAFT/ACTIVE
  version: text('version').default('v1.0.0'),
  systemTemplate: text('system_template'),
  userTemplate: text('user_template'),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// 提示词运行记录表
export const promptRuns = sqliteTable('prompt_runs', {
  id: text('id').primaryKey(),
  templateId: text('template_id').references(() => promptTemplates.id),
  bundleKey: text('bundle_key'),
  userId: text('user_id').references(() => users.id),
  requestId: text('request_id'),
  inputSnapshot: text('input_snapshot'), // JSON
  rawModelOutput: text('raw_model_output'),
  parsedOutput: text('parsed_output'), // JSON
  isValid: integer('is_valid', { mode: 'boolean' }),
  latencyMs: integer('latency_ms'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

export const dimensions = sqliteTable('dimensions', {
  id: integer('id').primaryKey(),
  key: text('key').notNull(),
  name: text('name').notNull(),
  label: text('label').notNull(),
  category: text('category').notNull(),
  sortOrder: integer('sort_order').default(0),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

export const dimensionSubItems = sqliteTable('dimension_sub_items', {
  id: text('id').primaryKey(),
  dimensionId: integer('dimension_id').notNull().references(() => dimensions.id),
  subId: integer('sub_id').notNull(),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').default(0),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// ==================== 社交相关 ====================

// 好友关系表
export const socialConnections = sqliteTable('social_connections', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  friendId: text('friend_id').notNull().references(() => users.id),
  status: text('status').default('PENDING'), // PENDING/ACCEPTED/BLOCKED
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// 社交互动日志表
export const socialInteractions = sqliteTable('social_interactions', {
  id: text('id').primaryKey(),
  fromUserId: text('from_user_id').notNull().references(() => users.id),
  toUserId: text('to_user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // BOOST(借火)/COMMENT(护法)/LIKE
  content: text('content'),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

// ==================== 健康报告 ====================

// 健康报告归档表
export const healthReports = sqliteTable('health_reports', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  reportType: text('report_type').notNull(), // WEEKLY/MONTHLY
  periodStart: text('period_start'),
  periodEnd: text('period_end'),
  summary: text('summary'), // AI生成的总结
  keywords: text('keywords'), // JSON数组
  dimensionScores: text('dimension_scores'), // JSON: 7维度平均分
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

// ==================== 系统设置 ====================

// AI 提供商配置表
export const aiProviders = sqliteTable('ai_providers', {
  id: text('id').primaryKey(), // qwen/ernie/aiping
  name: text('name').notNull(),
  displayName: text('display_name').notNull(),
  baseUrl: text('base_url').notNull(),
  apiKey: text('api_key'),
  model: text('model'),
  enabled: integer('enabled', { mode: 'boolean' }).default(false),
  timeoutMs: integer('timeout_ms').default(15000),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// ==================== 类型定义 ====================

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserProfile = typeof userProfiles.$inferSelect
export type LampStatus = typeof lampStatus.$inferSelect
export type CheckinLog = typeof checkinLogs.$inferSelect
export type CheckinStats = typeof checkinStats.$inferSelect
export type PromptTemplate = typeof promptTemplates.$inferSelect
export type PromptBundle = typeof promptBundles.$inferSelect
export type Dimension = typeof dimensions.$inferSelect
export type DimensionSubItem = typeof dimensionSubItems.$inferSelect
export type SocialConnection = typeof socialConnections.$inferSelect
export type AiProvider = typeof aiProviders.$inferSelect
