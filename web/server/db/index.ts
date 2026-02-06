/**
 * 命续 · 七星灯 APP - 数据库连接
 */

import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'
import { dirname, join } from 'path'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import { QUESTION_TEMPLATES } from '../constants/questionTemplates'

// 数据库文件路径
const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'data', 'sevenstar.db')

// 确保数据目录存在
import { mkdirSync, existsSync } from 'fs'
const dataDir = dirname(dbPath)
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

// 创建 SQLite 连接
const sqlite = new Database(dbPath)

// 启用 WAL 模式提升性能
sqlite.pragma('journal_mode = WAL')

// 创建 Drizzle 实例
export const db = drizzle(sqlite, { schema })

// 导出 schema
export * from './schema'

// 初始化数据库表
export function initDatabase() {
  try {
    // 创建所有表
    sqlite.exec(`
      -- 用户表
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        phone TEXT UNIQUE,
        email TEXT,
        role TEXT DEFAULT 'user',
        status TEXT DEFAULT 'ACTIVE',
        is_pro INTEGER DEFAULT 0,
        pro_until TEXT,
        password_hash TEXT NOT NULL,
        nickname TEXT,
        avatar_url TEXT,
        disabled_at TEXT,
        last_login_at TEXT,
        last_login_ip TEXT,
        failed_login_count INTEGER DEFAULT 0,
        locked_until TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 用户资料表
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id TEXT PRIMARY KEY REFERENCES users(id),
        gender TEXT,
        birth_date TEXT,
        height_cm INTEGER,
        weight_kg REAL,
        bmi REAL,
        goals TEXT,
        chronic_diseases TEXT,
        allergies TEXT,
        sleep_pattern TEXT,
        diet_habit TEXT,
        exercise_freq TEXT,
        water_intake TEXT,
        work_type TEXT,
        late_night INTEGER DEFAULT 0,
        regular_meals INTEGER DEFAULT 0,
        health_concerns TEXT,
        smoke_drink TEXT,
        occupation TEXT,
        notification_settings TEXT,
        settings TEXT,
        privacy_settings TEXT,
        connected_devices TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 灯状态表
      CREATE TABLE IF NOT EXISTS lamp_status (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        dimension_id INTEGER NOT NULL,
        sub_item_id INTEGER NOT NULL,
        state TEXT DEFAULT 'OFF',
        brightness INTEGER DEFAULT 0,
        color TEXT DEFAULT 'GRAY',
        last_value TEXT,
        lit_count INTEGER DEFAULT 0,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, dimension_id, sub_item_id)
      );

      -- 打卡记录表
      CREATE TABLE IF NOT EXISTS checkin_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        request_id TEXT UNIQUE,
        question_id TEXT,
        question TEXT,
        answer_text TEXT,
        input_type TEXT DEFAULT 'TEXT',
        ai_result TEXT,
        dimension_id INTEGER,
        sub_item_id INTEGER,
        metric_name TEXT,
        value_extracted TEXT,
        score INTEGER,
        is_valid INTEGER DEFAULT 0,
        ai_reply TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 打卡统计表
      CREATE TABLE IF NOT EXISTS checkin_stats (
        user_id TEXT PRIMARY KEY REFERENCES users(id),
        total_days INTEGER DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        max_streak INTEGER DEFAULT 0,
        life_seconds INTEGER DEFAULT 0,
        today_answered INTEGER DEFAULT 0,
        last_checkin_date TEXT
      );

      -- 打卡请求状态表
      CREATE TABLE IF NOT EXISTS checkin_requests (
        request_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        status TEXT DEFAULT 'RECEIVED',
        task_id TEXT,
        error_code TEXT,
        error_message TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 提示词模板表
      CREATE TABLE IF NOT EXISTS prompt_templates (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        dimension_id INTEGER,
        sub_item_id INTEGER,
        version TEXT DEFAULT 'v1.0.0',
        status TEXT DEFAULT 'ACTIVE',
        template TEXT NOT NULL,
        json_schema TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS prompt_bundles (
        key TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        version TEXT DEFAULT 'v1.0.0',
        system_template TEXT,
        user_template TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 提示词运行记录表
      CREATE TABLE IF NOT EXISTS prompt_runs (
        id TEXT PRIMARY KEY,
        template_id TEXT REFERENCES prompt_templates(id),
        bundle_key TEXT,
        user_id TEXT REFERENCES users(id),
        request_id TEXT,
        input_snapshot TEXT,
        raw_model_output TEXT,
        parsed_output TEXT,
        is_valid INTEGER,
        latency_ms INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS dimensions (
        id INTEGER PRIMARY KEY,
        key TEXT NOT NULL,
        name TEXT NOT NULL,
        label TEXT NOT NULL,
        category TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS dimension_sub_items (
        id TEXT PRIMARY KEY,
        dimension_id INTEGER NOT NULL REFERENCES dimensions(id),
        sub_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 好友关系表
      CREATE TABLE IF NOT EXISTS social_connections (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        friend_id TEXT NOT NULL REFERENCES users(id),
        status TEXT DEFAULT 'PENDING',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 社交互动日志表
      CREATE TABLE IF NOT EXISTS social_interactions (
        id TEXT PRIMARY KEY,
        from_user_id TEXT NOT NULL REFERENCES users(id),
        to_user_id TEXT NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        content TEXT,
        is_read INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 健康报告归档表
      CREATE TABLE IF NOT EXISTS health_reports (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        report_type TEXT NOT NULL,
        period_start TEXT,
        period_end TEXT,
        summary TEXT,
        keywords TEXT,
        dimension_scores TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- AI 提供商配置表
      CREATE TABLE IF NOT EXISTS ai_providers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        display_name TEXT NOT NULL,
        base_url TEXT NOT NULL,
        api_key TEXT,
        model TEXT,
        enabled INTEGER DEFAULT 0,
        timeout_ms INTEGER DEFAULT 15000,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        value_type TEXT DEFAULT 'STRING',
        description TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id TEXT PRIMARY KEY,
        actor_user_id TEXT REFERENCES users(id),
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        detail TEXT,
        ip TEXT,
        user_agent TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- 创建索引
      CREATE INDEX IF NOT EXISTS idx_lamp_status_user ON lamp_status(user_id);
      CREATE INDEX IF NOT EXISTS idx_lamp_status_user_dim ON lamp_status(user_id, dimension_id);
      CREATE INDEX IF NOT EXISTS idx_checkin_logs_user ON checkin_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_checkin_logs_date ON checkin_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_social_connections_user ON social_connections(user_id);
      CREATE INDEX IF NOT EXISTS idx_social_connections_friend ON social_connections(friend_id);
      CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_actor ON admin_audit_logs(actor_user_id);
      CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_time ON admin_audit_logs(created_at);
    `)

    // 自动迁移逻辑 (Auto-migration)
    const ensureColumn = (table: string, column: string, type: string) => {
      const cols = sqlite.pragma(`table_info(${table})`) as any[]
      if (!cols.find(c => c.name === column)) {
        try {
          sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`)
          console.log(`[Migration] Added column ${column} to ${table}`)
        } catch (e) {
          console.error(`[Migration] Failed to add column ${column} to ${table}:`, e)
        }
      }
    }

    // 确保新增字段存在
    ensureColumn('users', 'role', "TEXT DEFAULT 'user'")
    ensureColumn('users', 'status', "TEXT DEFAULT 'ACTIVE'")
    ensureColumn('users', 'is_pro', 'INTEGER DEFAULT 0')
    ensureColumn('users', 'pro_until', 'TEXT')
    ensureColumn('users', 'disabled_at', 'TEXT')
    ensureColumn('users', 'last_login_at', 'TEXT')
    ensureColumn('users', 'last_login_ip', 'TEXT')
    ensureColumn('users', 'failed_login_count', 'INTEGER DEFAULT 0')
    ensureColumn('users', 'locked_until', 'TEXT')
    ensureColumn('user_profiles', 'occupation', 'TEXT')
    ensureColumn('user_profiles', 'notification_settings', 'TEXT')
    ensureColumn('user_profiles', 'water_intake', 'TEXT')
    ensureColumn('user_profiles', 'work_type', 'TEXT')
    ensureColumn('user_profiles', 'late_night', 'INTEGER DEFAULT 0')
    ensureColumn('user_profiles', 'regular_meals', 'INTEGER DEFAULT 0')
    ensureColumn('user_profiles', 'health_concerns', 'TEXT')
    ensureColumn('user_profiles', 'settings', 'TEXT')
    ensureColumn('user_profiles', 'privacy_settings', 'TEXT')
    ensureColumn('user_profiles', 'connected_devices', 'TEXT')
    ensureColumn('prompt_runs', 'bundle_key', 'TEXT')

    const ensureAdminUser = () => {
      const now = new Date().toISOString()
      const phone = 'admin'
      const passwordHash = bcrypt.hashSync('admin', 10)

      const existing = sqlite
        .prepare('SELECT id, role FROM users WHERE phone = ?')
        .get(phone) as any | undefined

      const upsert = sqlite.transaction(() => {
        const userId = existing?.id ?? uuidv4()

        if (!existing) {
          sqlite
            .prepare(
              `INSERT INTO users (id, phone, email, role, status, is_pro, pro_until, password_hash, nickname, avatar_url, created_at, updated_at)
               VALUES (?, ?, NULL, ?, 'ACTIVE', 1, NULL, ?, ?, NULL, ?, ?)`
            )
            .run(userId, phone, 'admin', passwordHash, '管理员', now, now)
        } else {
          sqlite
            .prepare(`UPDATE users SET role = ?, status = 'ACTIVE', is_pro = 1, password_hash = ?, updated_at = ? WHERE phone = ?`)
            .run('admin', passwordHash, now, phone)
        }

        sqlite
          .prepare(`INSERT OR IGNORE INTO user_profiles (user_id, updated_at) VALUES (?, ?)`)
          .run(userId, now)

        sqlite
          .prepare(
            `INSERT OR IGNORE INTO checkin_stats
              (user_id, total_days, current_streak, max_streak, life_seconds, today_answered, last_checkin_date)
             VALUES (?, 0, 0, 0, 0, 0, NULL)`
          )
          .run(userId)

        const insertLamp = sqlite.prepare(
          `INSERT OR IGNORE INTO lamp_status
            (id, user_id, dimension_id, sub_item_id, state, brightness, color, last_value, lit_count, updated_at)
           VALUES (?, ?, ?, ?, 'OFF', 0, 'GRAY', NULL, 0, ?)`
        )
        for (let dim = 1; dim <= 7; dim++) {
          for (let sub = 1; sub <= 7; sub++) {
            insertLamp.run(uuidv4(), userId, dim, sub, now)
          }
        }
      })

      upsert()
    }

    const seedDefaultAdmin =
      (process.env.SEED_DEFAULT_ADMIN || '').toLowerCase() === 'true' ||
      (process.env.NUXT_DEV || '').toLowerCase() === 'true' ||
      (process.env.NODE_ENV || '').toLowerCase() !== 'production'

    if (seedDefaultAdmin) {
      ensureAdminUser()
    }

    const seedId = (key: string) => `seed_${crypto.createHash('sha1').update(key).digest('hex').slice(0, 24)}`

    const upsertPrompt = (input: { type: string; dimensionId?: number | null; subItemId?: number | null; template: string; notes?: string | null }) => {
      const now = new Date().toISOString()
      const dim = input.dimensionId ?? null
      const sub = input.subItemId ?? null
      const key = `${input.type}|${dim ?? ''}|${sub ?? ''}|${input.template}`
      const id = seedId(key)
      sqlite
        .prepare(
          `INSERT OR IGNORE INTO prompt_templates
            (id, type, dimension_id, sub_item_id, version, status, template, json_schema, notes, created_at, updated_at)
           VALUES
            (?,  ?,    ?,           ?,          'v1.0.0', 'ACTIVE', ?,      NULL,       ?,     ?,          ?)`
        )
        .run(id, input.type, dim, sub, input.template, input.notes || null, now, now)
    }

    const upsertBundle = (input: { key: string; name: string; systemTemplate?: string | null; userTemplate?: string | null; notes?: string | null }) => {
      const now = new Date().toISOString()
      sqlite
        .prepare(
          `INSERT OR IGNORE INTO prompt_bundles
            (key, name, status, version, system_template, user_template, notes, created_at, updated_at)
           VALUES
            (?,   ?,    'ACTIVE', 'v1.0.0', ?,              ?,            ?,     ?,          ?)`
        )
        .run(input.key, input.name, input.systemTemplate || null, input.userTemplate || null, input.notes || null, now, now)
    }

    upsertBundle({
      key: 'PARSE',
      name: '解析打卡回答',
      systemTemplate: `你是"命续 · 七星灯"健康管理系统的AI解析器，风格是道家养生大师。
你的任务是解析用户的健康打卡回答，提取关键信息并评分。

当前问题属于维度: {{expectedDimId}} - {{dimName}}
子项: {{expectedSubId}} - {{subName}}

用户资料: {{userProfileJson}}

请严格按以下JSON格式输出，不要有任何其他文字：
{
  "valid": boolean,
  "dimension_id": {{expectedDimId}},
  "sub_item_id": {{expectedSubId}},
  "metric_name": "{{subName}}",
  "value_extracted": string | number,
  "score": number,
  "reply": string
}

评分标准：
- 10分：非常健康/完全达标
- 7-9分：良好/基本达标
- 4-6分：一般/需要改善
- 1-3分：较差/需要注意

如果回答模糊或无关，设置 valid: false，score: 0。
回复风格要有道家养生韵味，20字以内。`,
      userTemplate: `问题: {{question}}\n用户回答: {{answer}}`,
      notes: '打卡回答解析（系统+用户）'
    })

    upsertBundle({
      key: 'QUESTION_GEN',
      name: '生成每日问题',
      systemTemplate: `你是"命续 · 七星灯"健康管理系统的道家养生大师。
你的任务是根据用户的健康维度和个人资料，生成一个关怀式的健康问询问题。

当前关注维度: {{dimId}} - {{dimName}}
具体指标: {{subId}} - {{subName}}

用户资料: {{userProfileJson}}

请生成一个简短的（30字以内）、口语化的、带有道家养生韵味或温暖关怀感的问题。
直接输出问题内容，不要包含任何前缀或解释。`,
      userTemplate: `请生成一个今日健康问询问题。`,
      notes: 'AI 生成更个性化的问询问题'
    })

    upsertBundle({
      key: 'ENCOURAGE',
      name: '生成鼓励语',
      systemTemplate: `你是"命续 · 七星灯"健康管理系统的道家养生大师。
请根据用户的打卡情况，生成一句简短的鼓励语（20字以内）。
风格要有道家韵味，温暖有力。`,
      userTemplate: `用户: {{userName}}\n连续打卡: {{streak}}天\n今日得分: {{todayScore}}分\n请生成一句鼓励语。`,
      notes: '连续打卡/得分鼓励语'
    })

    upsertBundle({
      key: 'REPORT_DIMENSION',
      name: '生成维度总结',
      systemTemplate: `你是"命续 · 七星灯"健康管理系统的道家养生大师。
你的任务是根据用户的最近打卡记录，为"{{dimName}}"维度生成健康总结和改进建议。

维度: {{dimId}} - {{dimName}}
用户资料: {{userProfileJson}}
最近记录: {{logsJson}}

请生成JSON格式输出：
{
  "summary": "简短总结（50字以内），带有道家韵味，总结最近表现",
  "suggestions": [
    "建议1（简短具体行动）",
    "建议2（简短具体行动）"
  ]
}`,
      notes: '单维度健康总结'
    })

    upsertBundle({
      key: 'AI_TEST',
      name: 'AI 连接测试',
      systemTemplate: '你是一个测试助手。',
      userTemplate: '请回复"连接成功"四个字。',
      notes: '后台测试用'
    })

    sqlite.prepare(`UPDATE prompt_templates SET status = 'DEPRECATED' WHERE type IN ('PARSE_SYSTEM','PARSE_USER','QUESTION_SYSTEM','QUESTION_USER','ENCOURAGE_SYSTEM','ENCOURAGE_USER','REPORT_SYSTEM','AI_TEST_SYSTEM','AI_TEST_USER')`).run()

    for (const [dimIdStr, subMap] of Object.entries(QUESTION_TEMPLATES)) {
      const dimId = Number(dimIdStr)
      for (const [subIdStr, questions] of Object.entries(subMap)) {
        const subId = Number(subIdStr)
        for (const q of questions) {
          upsertPrompt({ type: 'QUESTION', dimensionId: dimId, subItemId: subId, template: q, notes: '内置问题模板' })
        }
      }
    }

    const insertDim = sqlite.prepare(
      `INSERT OR IGNORE INTO dimensions (id, key, name, label, category, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    const insertSub = sqlite.prepare(
      `INSERT OR IGNORE INTO dimension_sub_items (id, dimension_id, sub_id, name, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    const nowDim = new Date().toISOString()
    const dims: Array<{ id: number; key: string; name: string; label: string; category: string; subs: string[] }> = [
      { id: 1, key: 'TIANSHU', name: '天枢', label: '命火', category: '打卡', subs: ['第1天', '第2天', '第3天', '第4天', '第5天', '第6天', '第7天'] },
      { id: 2, key: 'TIANXUAN', name: '天璇', label: '谷神', category: '饮食', subs: ['碳水', '蔬果', '蛋白', '油盐', '饮水', '节律', '知止'] },
      { id: 3, key: 'TIANJI', name: '天玑', label: '动静', category: '运动', subs: ['步数', '心肺', '肌力', '破坐', '拉伸', '姿态', '户外'] },
      { id: 4, key: 'TIANQUAN', name: '天权', label: '归根', category: '睡眠', subs: ['入睡', '时长', '效率', '连续', '醒感', '仪式', '午憩'] },
      { id: 5, key: 'YUHENG', name: '玉衡', label: '调息', category: '心理', subs: ['稳定', '压力', '专注', '社交', '愉悦', '冥想', '截断'] },
      { id: 6, key: 'KAIYANG', name: '开阳', label: '营卫', category: '体征', subs: ['排泄', '皮肤', '痛感', '体温', '视疲', '呼吸', '指标'] },
      { id: 7, key: 'YAOGUANG', name: '摇光', label: '固表', category: '环境', subs: ['光磁', '清气', '节气', '离屏', '噪音', '光合', '温湿'] }
    ]

    for (const d of dims) {
      insertDim.run(d.id, d.key, d.name, d.label, d.category, d.id, nowDim)
      d.subs.forEach((s, idx) => {
        insertSub.run(`${d.id}:${idx + 1}`, d.id, idx + 1, s, idx + 1, nowDim)
      })
    }

    const now = new Date().toISOString()
    const seedProvider = (id: string, name: string, displayName: string, baseUrl: string, model: string) => {
      const stmt = sqlite.prepare(`
        INSERT OR IGNORE INTO ai_providers
          (id, name, display_name, base_url, api_key, model, enabled, timeout_ms, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      stmt.run(id, name, displayName, baseUrl, '', model, 0, 15000, now, now)
    }

    seedProvider(
      'qwen',
      'qwen',
      '通义千问',
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      'qwen-turbo'
    )
    seedProvider(
      'ernie',
      'ernie',
      '文心一言',
      'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions',
      'ernie-speed-128k'
    )
    seedProvider(
      'aiping',
      'aiping',
      '第三方模型',
      'https://aiping.cn/api/v1/chat/completions',
      'MiniMax-M2.1'
    )

    console.log('✅ Database initialized successfully')
  } catch (e) {
    console.error('Database initialization failed:', e)
    throw e
  }
}

// 关闭数据库连接
export function closeDatabase() {
  sqlite.close()
}
