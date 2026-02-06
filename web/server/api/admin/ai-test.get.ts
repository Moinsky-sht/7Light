/**
 * AI 连接测试 API
 * GET /api/admin/ai-test
 * 
 * 测试AI服务是否正常工作
 */

import { defineEventHandler } from 'h3'
import { testAIConnection, parseAnswerWithAI } from '../../services/ai'

export default defineEventHandler(async (event) => {
  // 测试基本连接
  const connectionTest = await testAIConnection()
  
  // 测试解析功能
  let parseTest = null
  if (connectionTest.success) {
    const result = await parseAnswerWithAI(
      '今天喝了多少水？',
      '喝了8杯水，大概2升',
      2, // 天璇-饮食
      5, // 饮水
      { nickname: '测试用户' }
    )
    parseTest = {
      question: '今天喝了多少水？',
      answer: '喝了8杯水，大概2升',
      result
    }
  }

  return {
    success: connectionTest.success,
    connection: {
      provider: connectionTest.provider,
      latency: connectionTest.latency + 'ms',
      error: connectionTest.error
    },
    parseTest,
    timestamp: new Date().toISOString()
  }
})
