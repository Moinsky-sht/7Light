/**
 * AI 服务模块
 * 支持多个AI提供商：通义千问、文心一言、aiping.cn
 * 自动降级机制
 */

// AI 提供商配置
import { db, aiProviders, dimensions, dimensionSubItems, promptBundles, promptTemplates, promptRuns } from '../db'
import { and, eq, desc, sql } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

interface AIProvider {
  name: string
  baseUrl: string
  apiKey: string
  model: string
  enabled: boolean
  timeoutMs: number
}

// AI 响应结构
interface AIResponse {
  success: boolean
  content: string
  provider: string
  error?: string
}

// 解析结果结构
export interface AIParseResult {
  valid: boolean
  dimension_id: number
  sub_item_id: number
  metric_name: string
  value_extracted: string | number
  score: number
  reply: string
}

// 维度名称映射
const DIMENSION_NAMES: Record<number, string> = {
  1: '天枢(打卡)', 2: '天璇(饮食)', 3: '天玑(运动)', 4: '天权(睡眠)',
  5: '玉衡(情绪)', 6: '开阳(身体)', 7: '摇光(环境)'
}

// 子项名称映射
const SUB_ITEM_NAMES: Record<number, string[]> = {
  2: ['碳水', '蔬菜', '蛋白质', '油盐', '饮水', '节律', '节制'],
  3: ['步数', '有氧', '力量', '久坐', '拉伸', '姿态', '户外'],
  4: ['入睡', '时长', '效率', '连续', '醒感', '仪式', '午休'],
  5: ['稳定', '压力', '专注', '社交', '愉悦', '冥想', '断联'],
  6: ['排便', '皮肤', '疼痛', '体温', '眼疲', '呼吸', '体征'],
  7: ['蓝光', '空气', '天气', '屏休', '噪音', '日照', '湿度']
}

const PROVIDER_CACHE_TTL = 30 * 1000
let providerCache: { providers: AIProvider[]; loadedAt: number } | null = null

const DIM_CACHE_TTL = 60 * 1000
let dimCache: { loadedAt: number; dims: Array<{ id: number; key: string; name: string; label: string; category: string }>; subs: Array<{ dimensionId: number; subId: number; name: string }> } | null = null

async function getDimensionCache(forceRefresh = false) {
  if (!forceRefresh && dimCache && Date.now() - dimCache.loadedAt < DIM_CACHE_TTL) return dimCache
  try {
    const dims = await db
      .select({ id: dimensions.id, key: dimensions.key, name: dimensions.name, label: dimensions.label, category: dimensions.category })
      .from(dimensions)
      .all()
    const subs = await db
      .select({ dimensionId: dimensionSubItems.dimensionId, subId: dimensionSubItems.subId, name: dimensionSubItems.name })
      .from(dimensionSubItems)
      .all()
    dimCache = { loadedAt: Date.now(), dims, subs }
    return dimCache
  } catch {
    return dimCache
  }
}

async function resolveDimNames(input: { dimId: number; subId: number }) {
  const cache = await getDimensionCache()
  let dimName = DIMENSION_NAMES[input.dimId] || '未知'
  let subName = SUB_ITEM_NAMES[input.dimId]?.[input.subId - 1] || '未知'
  if (cache?.dims?.length) {
    const d = cache.dims.find((x) => x.id === input.dimId)
    if (d) dimName = `${d.name}(${d.category})`
  }
  if (cache?.subs?.length) {
    const s = cache.subs.find((x) => x.dimensionId === input.dimId && x.subId === input.subId)
    if (s) subName = s.name
  }
  const dimensionsJson = cache?.dims?.length
    ? JSON.stringify({
      dimensions: cache.dims,
      subItems: cache.subs
    })
    : ''
  return { dimName, subName, dimensionsJson }
}

function interpolateTemplate(template: string, vars: Record<string, any>) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const v = vars[key]
    if (v === null || v === undefined) return ''
    return String(v)
  })
}

async function getPromptBundle(
  bundleKey: string
): Promise<{ key: string; name: string; systemTemplate: string | null; userTemplate: string | null } | null> {
  const row = await db
    .select({
      key: promptBundles.key,
      name: promptBundles.name,
      systemTemplate: promptBundles.systemTemplate,
      userTemplate: promptBundles.userTemplate
    })
    .from(promptBundles)
    .where(and(eq(promptBundles.key, bundleKey), eq(promptBundles.status, 'ACTIVE')))
    .limit(1)
    .get()

  if (!row?.key) return null
  return row
}

async function resolveBundle(
  bundleKey: string,
  vars: Record<string, any>,
  fallback: { system?: string | null; user?: string | null }
): Promise<{ bundleKey: string; systemText: string; userText: string }> {
  try {
    const bundle = await getPromptBundle(bundleKey)
    if (bundle) {
      return {
        bundleKey,
        systemText: interpolateTemplate(bundle.systemTemplate || '', vars),
        userText: interpolateTemplate(bundle.userTemplate || '', vars)
      }
    }
  } catch {}

  return {
    bundleKey,
    systemText: fallback.system ? interpolateTemplate(fallback.system, vars) : '',
    userText: fallback.user ? interpolateTemplate(fallback.user, vars) : ''
  }
}

async function getPromptTemplate(
  type: string,
  input?: { dimensionId?: number | null; subItemId?: number | null }
): Promise<{ id: string; template: string } | null> {
  const dim = input?.dimensionId ?? null
  const sub = input?.subItemId ?? null

  const conditions: any[] = [eq(promptTemplates.type, type), eq(promptTemplates.status, 'ACTIVE')]
  if (dim === null) conditions.push(sql`${promptTemplates.dimensionId} IS NULL`)
  else conditions.push(eq(promptTemplates.dimensionId, dim))
  if (sub === null) conditions.push(sql`${promptTemplates.subItemId} IS NULL`)
  else conditions.push(eq(promptTemplates.subItemId, sub))

  const row = await db
    .select({ id: promptTemplates.id, template: promptTemplates.template })
    .from(promptTemplates)
    .where(and(...conditions))
    .orderBy(desc(promptTemplates.updatedAt))
    .limit(1)
    .get()

  if (!row?.id || !row.template) return null
  return row
}

async function resolvePrompt(
  type: string,
  vars: Record<string, any>,
  input?: { dimensionId?: number | null; subItemId?: number | null },
  fallback?: string
): Promise<{ templateId: string | null; text: string }> {
  try {
    const row = await getPromptTemplate(type, input)
    if (row?.template) {
      return { templateId: row.id, text: interpolateTemplate(row.template, vars) }
    }
  } catch {}
  return { templateId: null, text: fallback ? interpolateTemplate(fallback, vars) : '' }
}

async function providersFromDb(): Promise<AIProvider[] | null> {
  try {
    const rows = await db.select().from(aiProviders).all()
    if (!rows.length) return null
    return rows.map((row) => ({
      name: row.name,
      baseUrl: row.baseUrl,
      apiKey: row.apiKey || '',
      model: row.model || '',
      enabled: Boolean(row.enabled) && !!row.apiKey,
      timeoutMs: row.timeoutMs || 15000
    }))
  } catch (e) {
    console.error('[AI] 读取AI配置失败:', e)
    return null
  }
}

/**
 * 获取AI提供商配置
 */
async function getProviders(forceRefresh = false): Promise<AIProvider[]> {
  if (!forceRefresh && providerCache && Date.now() - providerCache.loadedAt < PROVIDER_CACHE_TTL) {
    return providerCache.providers
  }
  const fromDb = await providersFromDb()
  const providers = fromDb && fromDb.length ? fromDb : []
  providerCache = { providers, loadedAt: Date.now() }
  return providers
}

export function clearProviderCache() {
  providerCache = null
}

/**
 * 调用单个AI提供商
 */
async function callProvider(provider: AIProvider, messages: any[]): Promise<AIResponse> {
  try {
    console.log(`[AI] 尝试调用 ${provider.name}...`)
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    // 不同提供商的认证方式
    if (provider.name === 'qwen') {
      headers['Authorization'] = `Bearer ${provider.apiKey}`
    } else if (provider.name === 'ernie') {
      // 百度需要access_token
      headers['Authorization'] = `Bearer ${provider.apiKey}`
    } else {
      headers['Authorization'] = `Bearer ${provider.apiKey}`
    }

    const response = await fetch(provider.baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: provider.model,
        stream: false,
        messages
      }),
      signal: AbortSignal.timeout(provider.timeoutMs || 15000)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[AI] ${provider.name} 返回错误:`, response.status, errorText)
      return {
        success: false,
        content: '',
        provider: provider.name,
        error: `HTTP ${response.status}: ${errorText}`
      }
    }

    const data = await response.json()
    
    if (data.choices?.[0]?.message?.content) {
      console.log(`[AI] ${provider.name} 调用成功`)
      return {
        success: true,
        content: data.choices[0].message.content,
        provider: provider.name
      }
    }

    return {
      success: false,
      content: '',
      provider: provider.name,
      error: 'No content in response'
    }

  } catch (error: any) {
    console.error(`[AI] ${provider.name} 调用失败:`, error.message)
    return {
      success: false,
      content: '',
      provider: provider.name,
      error: error.message
    }
  }
}

/**
 * 调用AI（自动降级）
 */
async function callAI(messages: any[]): Promise<AIResponse> {
  const providers = (await getProviders()).filter(p => p.enabled)
  
  for (const provider of providers) {
    const result = await callProvider(provider, messages)
    if (result.success) {
      return result
    }
  }

  // 所有提供商都失败
  return {
    success: false,
    content: '',
    provider: 'none',
    error: '所有AI服务暂时不可用'
  }
}

/**
 * 生成系统提示词
 */
function generateSystemPrompt(
  expectedDimId: number,
  expectedSubId: number,
  userProfile: any
): string {
  const dimName = DIMENSION_NAMES[expectedDimId] || '未知'
  const subName = SUB_ITEM_NAMES[expectedDimId]?.[expectedSubId - 1] || '未知'
  
  return `你是"命续 · 七星灯"健康管理系统的AI解析器，风格是道家养生大师。
你的任务是解析用户的健康打卡回答，提取关键信息并评分。

当前问题属于维度: ${expectedDimId} - ${dimName}
子项: ${expectedSubId} - ${subName}

用户资料: ${JSON.stringify(userProfile || {})}

请严格按以下JSON格式输出，不要有任何其他文字：
{
  "valid": boolean,        // 回答是否包含有效健康信息
  "dimension_id": ${expectedDimId},  // 维度ID
  "sub_item_id": ${expectedSubId},   // 子项ID
  "metric_name": "${subName}",       // 指标名称
  "value_extracted": string | number,  // 提取的具体数值或描述
  "score": number,         // 健康评分 1-10 (10最好)
  "reply": string          // 道风回复，20字以内，鼓励性质
}

评分标准：
- 10分：非常健康/完全达标
- 7-9分：良好/基本达标
- 4-6分：一般/需要改善
- 1-3分：较差/需要注意

如果回答模糊（如"还行"、"一般"）或无关，设置 valid: false，score: 0。
回复风格要有道家养生韵味，如"善哉"、"功德"、"精进"、"妙极"等。
回复要简短有力，给人温暖鼓励的感觉。`
}

/**
 * 解析用户回答
 */
export async function parseAnswerWithAI(
  question: string,
  answer: string,
  expectedDimId: number,
  expectedSubId: number,
  userProfile: any,
  context?: { userId?: string; requestId?: string; questionId?: string }
): Promise<AIParseResult> {
  const { dimName, subName, dimensionsJson } = await resolveDimNames({ dimId: expectedDimId, subId: expectedSubId })
  const vars = {
    expectedDimId,
    expectedSubId,
    dimName,
    subName,
    userProfileJson: JSON.stringify(userProfile || {}),
    dimensionsJson,
    question,
    answer
  }

  const systemFallback = generateSystemPrompt(expectedDimId, expectedSubId, userProfile)
  const bundle = await resolveBundle('PARSE', vars, { system: systemFallback, user: `问题: {{question}}\n用户回答: {{answer}}` })

  const messages = [
    { role: 'system', content: bundle.systemText },
    { role: 'user', content: bundle.userText }
  ]

  const startTime = Date.now()
  const response = await callAI(messages)
  const latencyMs = Date.now() - startTime

  if (response.success && response.content) {
    try {
      // 清理AI返回内容中的各种格式
      let jsonString = response.content
      
      // 移除 <think>...</think> 标签及其内容
      jsonString = jsonString.replace(/<think>[\s\S]*?<\/think>/g, '')
      
      // 移除 markdown 代码块
      jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '')
      
      // 提取JSON对象（找到第一个 { 和最后一个 }）
      const startIndex = jsonString.indexOf('{')
      const endIndex = jsonString.lastIndexOf('}')
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        jsonString = jsonString.substring(startIndex, endIndex + 1)
      }
      
      jsonString = jsonString.trim()
      
      const result = JSON.parse(jsonString)
      
      // 强制校验维度一致性
      result.dimension_id = expectedDimId
      result.sub_item_id = expectedSubId
      
      // 确保score在有效范围
      result.score = Math.max(0, Math.min(10, result.score || 0))
      
      console.log(`[AI] 解析成功 (${response.provider}):`, result)

      try {
        await db.insert(promptRuns).values({
          id: uuidv4(),
          templateId: null,
          bundleKey: bundle.bundleKey,
          userId: context?.userId || null,
          requestId: context?.requestId || null,
          inputSnapshot: JSON.stringify({
            kind: 'PARSE',
            questionId: context?.questionId || null,
            expectedDimId,
            expectedSubId,
            bundleKey: bundle.bundleKey,
            messages
          }),
          rawModelOutput: response.content,
          parsedOutput: JSON.stringify(result),
          isValid: Boolean(result.valid),
          latencyMs,
          createdAt: new Date().toISOString()
        })
      } catch {}

      return result

    } catch (parseError) {
      console.error('[AI] JSON解析失败:', parseError, response.content)
    }
  }

  try {
    await db.insert(promptRuns).values({
      id: uuidv4(),
      templateId: null,
      bundleKey: bundle.bundleKey,
      userId: context?.userId || null,
      requestId: context?.requestId || null,
      inputSnapshot: JSON.stringify({
        kind: 'PARSE',
        questionId: context?.questionId || null,
        expectedDimId,
        expectedSubId,
        bundleKey: bundle.bundleKey,
        messages
      }),
      rawModelOutput: response.content || null,
      parsedOutput: null,
      isValid: false,
      latencyMs,
      createdAt: new Date().toISOString()
    })
  } catch {}

  // 返回默认结果
  return {
    valid: false,
    dimension_id: expectedDimId,
    sub_item_id: expectedSubId,
    metric_name: SUB_ITEM_NAMES[expectedDimId]?.[expectedSubId - 1] || 'Unknown',
    value_extracted: '',
    score: 0,
    reply: response.error ? '云游未归，稍后再试。' : '天机混沌，请施主明示。'
  }
}

/**
 * 生成AI鼓励语
 */
export async function generateEncouragement(
  userName: string,
  streak: number,
  todayScore: number,
  context?: { userId?: string; requestId?: string }
): Promise<string> {
  const vars = { userName, streak, todayScore }
  const bundle = await resolveBundle('ENCOURAGE', vars, {
    system: `你是"命续 · 七星灯"健康管理系统的道家养生大师。
请根据用户的打卡情况，生成一句简短的鼓励语（20字以内）。
风格要有道家韵味，温暖有力。`,
    user: `用户: {{userName}}
连续打卡: {{streak}}天
今日得分: {{todayScore}}分
请生成一句鼓励语。`
  })

  const messages = [
    { role: 'system', content: bundle.systemText },
    { role: 'user', content: bundle.userText }
  ]

  const startTime = Date.now()
  const response = await callAI(messages)
  const latencyMs = Date.now() - startTime
  
  if (response.success && response.content) {
    try {
      await db.insert(promptRuns).values({
        id: uuidv4(),
        templateId: null,
        bundleKey: bundle.bundleKey,
        userId: context?.userId || null,
        requestId: context?.requestId || null,
        inputSnapshot: JSON.stringify({ kind: 'ENCOURAGE', bundleKey: bundle.bundleKey, messages }),
        rawModelOutput: response.content,
        parsedOutput: null,
        isValid: true,
        latencyMs,
        createdAt: new Date().toISOString()
      })
    } catch {}
    return response.content.trim().slice(0, 50)
  }

  // 默认鼓励语
  const defaults = [
    '善哉！续命之功，日积月累。',
    '精进不止，道心永固。',
    '功德圆满，福寿绑身。',
    '妙极！养生有道，长生可期。'
  ]
  return defaults[Math.floor(Math.random() * defaults.length)]
}

/**
 * 生成AI问题
 */
export async function generateQuestionWithAI(
  dimId: number,
  subId: number,
  dimName: string,
  subName: string,
  userProfile: any,
  context?: { userId?: string; requestId?: string }
): Promise<string | null> {
  const resolved = await resolveDimNames({ dimId, subId })
  const vars = {
    dimId,
    subId,
    dimName: resolved.dimName || dimName,
    subName: resolved.subName || subName,
    userProfileJson: JSON.stringify(userProfile || {}),
    dimensionsJson: resolved.dimensionsJson
  }
  const bundle = await resolveBundle('QUESTION_GEN', vars, {
    system: `你是"命续 · 七星灯"健康管理系统的道家养生大师。
你的任务是根据用户的健康维度和个人资料，生成一个关怀式的健康问询问题。

当前关注维度: {{dimId}} - {{dimName}}
具体指标: {{subId}} - {{subName}}

用户资料: {{userProfileJson}}

请生成一个简短的（30字以内）、口语化的、带有道家养生韵味或温暖关怀感的问题。
直接输出问题内容，不要包含任何前缀或解释。`,
    user: '请生成一个今日健康问询问题。'
  })

  const messages = [
    { role: 'system', content: bundle.systemText },
    { role: 'user', content: bundle.userText }
  ]

  const startTime = Date.now()
  const response = await callAI(messages)
  const latencyMs = Date.now() - startTime

  if (response.success && response.content) {
    // 清理可能存在的引号或多余字符
    let content = response.content.trim()
    content = content.replace(/^["']|["']$/g, '')
    // 移除可能存在的 <think> 标签
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

    try {
      await db.insert(promptRuns).values({
        id: uuidv4(),
        templateId: null,
        bundleKey: bundle.bundleKey,
        userId: context?.userId || null,
        requestId: context?.requestId || null,
        inputSnapshot: JSON.stringify({ kind: 'QUESTION', bundleKey: bundle.bundleKey, messages }),
        rawModelOutput: response.content,
        parsedOutput: JSON.stringify({ question: content }),
        isValid: Boolean(content),
        latencyMs,
        createdAt: new Date().toISOString()
      })
    } catch {}

    return content
  }

  return null
}

/**
 * 生成单盏灯的健康总结和建议
 */
export async function generateLampSummary(
  dimId: number,
  dimName: string,
  logs: any[], // 最近的打卡记录
  userProfile: any,
  context?: { userId?: string; requestId?: string }
): Promise<{ summary: string; suggestions: string[] }> {
  const logsJson = JSON.stringify(
    logs.map((l) => ({
      metric: l.metricName,
      value: l.valueExtracted,
      score: l.score,
      time: l.createdAt
    }))
  )

  const resolved = await resolveDimNames({ dimId, subId: 1 })
  const vars = {
    dimId,
    dimName: resolved.dimName || dimName,
    userProfileJson: JSON.stringify(userProfile || {}),
    logsJson,
    dimensionsJson: resolved.dimensionsJson
  }
  const bundle = await resolveBundle('REPORT_DIMENSION', vars, {
    system: `你是"命续 · 七星灯"健康管理系统的道家养生大师。
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
    user: '请生成健康总结和建议。'
  })
  const messages = [
    { role: 'system', content: bundle.systemText },
    { role: 'user', content: bundle.userText }
  ]

  const startTime = Date.now()
  const response = await callAI(messages)
  const latencyMs = Date.now() - startTime

  if (response.success && response.content) {
    try {
      let jsonString = response.content
      jsonString = jsonString.replace(/<think>[\s\S]*?<\/think>/g, '')
      jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '')
      const startIndex = jsonString.indexOf('{')
      const endIndex = jsonString.lastIndexOf('}')
      if (startIndex !== -1 && endIndex !== -1) {
        jsonString = jsonString.substring(startIndex, endIndex + 1)
      }
      const parsed = JSON.parse(jsonString)
      try {
        await db.insert(promptRuns).values({
          id: uuidv4(),
          templateId: null,
          bundleKey: bundle.bundleKey,
          userId: context?.userId || null,
          requestId: context?.requestId || null,
          inputSnapshot: JSON.stringify({ kind: 'REPORT', bundleKey: bundle.bundleKey, messages }),
          rawModelOutput: response.content,
          parsedOutput: JSON.stringify(parsed),
          isValid: true,
          latencyMs,
          createdAt: new Date().toISOString()
        })
      } catch {}
      return parsed
    } catch (e) {
      console.error('[AI] Summary parse failed:', e)
    }
  }

  // 默认回退
  return {
    summary: 'AI服务暂时不可用，无法生成总结。',
    suggestions: []
  }
}

/**
 * 测试AI连接
 */
export async function testAIConnection(): Promise<{
  success: boolean
  provider: string
  latency: number
  error?: string
}> {
  const startTime = Date.now()
  
  const bundle = await resolveBundle('AI_TEST', {}, { system: '你是一个测试助手。', user: '请回复"连接成功"四个字。' })
  const messages = [
    { role: 'system', content: bundle.systemText },
    { role: 'user', content: bundle.userText }
  ]

  const response = await callAI(messages)
  const latency = Date.now() - startTime

  try {
    await db.insert(promptRuns).values({
      id: uuidv4(),
      templateId: null,
      bundleKey: bundle.bundleKey,
      userId: null,
      requestId: null,
      inputSnapshot: JSON.stringify({ kind: 'AI_TEST', bundleKey: bundle.bundleKey, messages }),
      rawModelOutput: response.content || null,
      parsedOutput: null,
      isValid: Boolean(response.success),
      latencyMs: latency,
      createdAt: new Date().toISOString()
    })
  } catch {}

  return {
    success: response.success,
    provider: response.provider,
    latency,
    error: response.error
  }
}

/**
 * 测试指定AI提供商连接
 */
export async function testAIProvider(providerName?: string): Promise<{
  success: boolean
  provider: string
  latency: number
  error?: string
}> {
  const providers = await getProviders(true)
  const target = providerName
    ? providers.find(p => p.name === providerName)
    : providers.find(p => p.enabled)

  if (!target) {
    return {
      success: false,
      provider: providerName || 'none',
      latency: 0,
      error: '未配置可用的AI提供商'
    }
  }

  const startTime = Date.now()
  const bundle = await resolveBundle('AI_TEST', {}, { system: '你是一个测试助手。', user: '请回复"连接成功"四个字。' })
  const messages = [
    { role: 'system', content: bundle.systemText },
    { role: 'user', content: bundle.userText }
  ]

  const response = await callProvider(target, messages)
  const latency = Date.now() - startTime

  try {
    await db.insert(promptRuns).values({
      id: uuidv4(),
      templateId: null,
      bundleKey: bundle.bundleKey,
      userId: null,
      requestId: null,
      inputSnapshot: JSON.stringify({ kind: 'AI_TEST_PROVIDER', provider: target.name, bundleKey: bundle.bundleKey, messages }),
      rawModelOutput: response.content || null,
      parsedOutput: null,
      isValid: Boolean(response.success),
      latencyMs: latency,
      createdAt: new Date().toISOString()
    })
  } catch {}

  return {
    success: response.success,
    provider: target.name,
    latency,
    error: response.error
  }
}
