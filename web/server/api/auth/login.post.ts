/**
 * 用户登录 API
 * POST /api/auth/login
 */

import { defineEventHandler, readBody, createError } from 'h3'
import bcrypt from 'bcryptjs'
import { db, users, initDatabase } from '../../db'
import { generateToken, setAuthCookie } from '../../utils/jwt'
import { eq } from 'drizzle-orm'

// 确保数据库初始化
let dbInitialized = false

export default defineEventHandler(async (event) => {
  // 初始化数据库
  if (!dbInitialized) {
    initDatabase()
    dbInitialized = true
  }

  const body = await readBody(event)
  const { phone, password } = body

  // 参数校验
  if (!phone || !password) {
    throw createError({
      statusCode: 400,
      message: '手机号和密码不能为空'
    })
  }

  try {
    // 查找用户
    const user = await db.select().from(users).where(eq(users.phone, phone)).get()
    
    if (!user) {
      throw createError({
        statusCode: 401,
        message: '手机号或密码错误'
      })
    }

    if ((user as any).status && (user as any).status !== 'ACTIVE') {
      throw createError({
        statusCode: 403,
        message: '账号已被禁用'
      })
    }

    const now = new Date()
    const nowIso = now.toISOString()
    const lockedUntil = (user as any).lockedUntil as string | null | undefined
    if (lockedUntil) {
      const lockTime = new Date(lockedUntil)
      if (!Number.isNaN(lockTime.getTime()) && lockTime.getTime() > now.getTime()) {
        throw createError({
          statusCode: 429,
          message: '登录失败次数过多，请稍后再试'
        })
      }
    }

    if (!user.passwordHash) {
      console.error(`User ${phone} has no password hash`)
      throw createError({
        statusCode: 500,
        message: '账户数据异常'
      })
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      const maxAttempts = 8
      const lockMinutes = 15
      const failedCount = ((user as any).failedLoginCount as number | null | undefined) ?? 0
      const nextFailed = failedCount + 1
      const nextLockUntil = nextFailed >= maxAttempts ? new Date(now.getTime() + lockMinutes * 60 * 1000).toISOString() : null
      try {
        await db
          .update(users)
          .set({
            failedLoginCount: nextFailed as any,
            lockedUntil: nextLockUntil as any,
            updatedAt: nowIso as any
          } as any)
          .where(eq(users.id, user.id))
      } catch {}

      throw createError({
        statusCode: 401,
        message: '手机号或密码错误'
      })
    }

    const ipHeader = (event.node.req.headers['x-forwarded-for'] as string | undefined) || ''
    const ip = ipHeader ? ipHeader.split(',')[0].trim() : (event.node.req.socket.remoteAddress || '')

    try {
      await db
        .update(users)
        .set({
          failedLoginCount: 0 as any,
          lockedUntil: null as any,
          lastLoginAt: nowIso as any,
          lastLoginIp: ip as any,
          updatedAt: nowIso as any
        } as any)
        .where(eq(users.id, user.id))
    } catch {}

    // 生成 Token
    const token = generateToken({
      userId: user.id,
      phone: user.phone || undefined,
      nickname: user.nickname || undefined,
      role: user.role || 'user'
    })

    // 设置 Cookie
    setAuthCookie(event, token)

    return {
      success: true,
      message: '登录成功',
      data: {
        userId: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isPro: Boolean((user as any).isPro),
        proUntil: (user as any).proUntil || null,
        token
      }
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Login error:', error)
    throw createError({
      statusCode: 500,
      message: '登录失败，请稍后重试'
    })
  }
})
