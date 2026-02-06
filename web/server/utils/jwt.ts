/**
 * JWT 工具函数
 */

import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'
import { getCookie, setCookie, deleteCookie, createError } from 'h3'
import { randomBytes } from 'crypto'

// JWT 密钥 (生产环境应从环境变量读取)
const JWT_SECRET = process.env.JWT_SECRET || randomBytes(32).toString('hex')
if (!process.env.JWT_SECRET) {
  console.warn('[Auth] JWT_SECRET 未配置，已使用临时随机密钥（重启后会失效）。')
}
const JWT_EXPIRES_IN = '7d'
const COOKIE_NAME = 'sevenstar_token'

export interface JwtPayload {
  userId: string
  phone?: string
  nickname?: string
  role?: string
}

/**
 * 生成 JWT Token
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * 验证 JWT Token
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch (error) {
    return null
  }
}

/**
 * 从请求中获取用户信息
 */
export function getUserFromEvent(event: H3Event): JwtPayload | null {
  // 优先从 Cookie 获取
  let token = getCookie(event, COOKIE_NAME)
  
  // 其次从 Authorization Header 获取
  if (!token) {
    const authHeader = event.node.req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7)
    }
  }
  
  if (!token) return null
  
  return verifyToken(token)
}

/**
 * 设置认证 Cookie
 */
export function setAuthCookie(event: H3Event, token: string) {
  const forwardedProto = event.node.req.headers['x-forwarded-proto']
  const isHttps =
    forwardedProto === 'https' ||
    Boolean((event.node.req.socket as any)?.encrypted) ||
    process.env.FORCE_SECURE_COOKIE === 'true'
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })
}

/**
 * 清除认证 Cookie
 */
export function clearAuthCookie(event: H3Event) {
  deleteCookie(event, COOKIE_NAME)
}

/**
 * 要求认证的中间件辅助函数
 */
export function requireAuth(event: H3Event): JwtPayload {
  const user = getUserFromEvent(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: '请先登录'
    })
  }
  return user
}
