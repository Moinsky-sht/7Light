/**
 * 用户注册 API
 * POST /api/auth/register
 */

import { defineEventHandler, readBody, createError } from 'h3'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { db, users, userProfiles, checkinStats, lampStatus, initDatabase } from '../../db'
import { generateToken, setAuthCookie } from '../../utils/jwt'
import { eq, sql } from 'drizzle-orm'

// 确保数据库初始化
let dbInitialized = false

export default defineEventHandler(async (event) => {
  // 初始化数据库
  if (!dbInitialized) {
    initDatabase()
    dbInitialized = true
  }

  const body = await readBody(event)
  const { phone, password, nickname } = body

  // 参数校验
  if (!phone || !password) {
    throw createError({
      statusCode: 400,
      message: '手机号和密码不能为空'
    })
  }

  // 手机号格式校验
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    throw createError({
      statusCode: 400,
      message: '手机号格式不正确'
    })
  }

  // 密码长度校验
  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      message: '密码长度至少6位'
    })
  }

  try {
    // 检查手机号是否已注册
    const existingUser = await db.select().from(users).where(eq(users.phone, phone)).get()
    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: '该手机号已注册'
      })
    }

    // 如果还没有管理员，首位注册用户自动成为管理员
    const adminCount = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, 'admin'))
      .get()
    const role = adminCount?.count ? 'user' : 'admin'

    // 生成用户ID和密码哈希
    const userId = uuidv4()
    const passwordHash = await bcrypt.hash(password, 10)
    const userNickname = nickname || `灯友${phone.slice(-4)}`

    // 创建用户
    await db.insert(users).values({
      id: userId,
      phone,
      role,
      passwordHash,
      nickname: userNickname,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    // 创建用户资料
    await db.insert(userProfiles).values({
      userId,
      updatedAt: new Date().toISOString()
    })

    // 创建打卡统计
    await db.insert(checkinStats).values({
      userId,
      totalDays: 0,
      currentStreak: 0,
      maxStreak: 0,
      lifeSeconds: 0,
      todayAnswered: 0
    })

    // 初始化49盏灯状态
    const lampInserts = []
    for (let dim = 1; dim <= 7; dim++) {
      for (let sub = 1; sub <= 7; sub++) {
        lampInserts.push({
          id: uuidv4(),
          userId,
          dimensionId: dim,
          subItemId: sub,
          state: 'OFF',
          brightness: 0,
          color: 'GRAY',
          litCount: 0,
          updatedAt: new Date().toISOString()
        })
      }
    }
    await db.insert(lampStatus).values(lampInserts)

    // 生成 Token
    const token = generateToken({
      userId,
      phone,
      nickname: userNickname,
      role
    })

    // 设置 Cookie
    setAuthCookie(event, token)

    return {
      success: true,
      message: '注册成功',
      data: {
        userId,
        phone,
        nickname: userNickname,
        role,
        token
      }
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Register error:', error)
    throw createError({
      statusCode: 500,
      message: '注册失败，请稍后重试'
    })
  }
})
