/**
 * 添加好友 API
 * POST /api/social/add
 */

import { defineEventHandler, readBody, createError } from 'h3'
import { v4 as uuidv4 } from 'uuid'
import { db, users, socialConnections } from '../../db'
import { getUserFromEvent } from '../../utils/jwt'
import { eq, and, or } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const auth = getUserFromEvent(event)
  
  if (!auth) {
    throw createError({
      statusCode: 401,
      message: '未登录'
    })
  }

  const body = await readBody(event)
  const { friendId, phone } = body

  // 需要提供好友ID或手机号
  if (!friendId && !phone) {
    throw createError({
      statusCode: 400,
      message: '请提供好友ID或手机号'
    })
  }

  try {
    // 查找目标用户
    let targetUser
    if (friendId) {
      targetUser = await db.select().from(users).where(eq(users.id, friendId)).get()
    } else if (phone) {
      targetUser = await db.select().from(users).where(eq(users.phone, phone)).get()
    }

    if (!targetUser) {
      throw createError({
        statusCode: 404,
        message: '未找到该用户'
      })
    }

    // 不能添加自己
    if (targetUser.id === auth.userId) {
      throw createError({
        statusCode: 400,
        message: '不能添加自己为好友'
      })
    }

    // 检查是否已存在关系
    const existingConnection = await db.select()
      .from(socialConnections)
      .where(or(
        and(
          eq(socialConnections.userId, auth.userId),
          eq(socialConnections.friendId, targetUser.id)
        ),
        and(
          eq(socialConnections.userId, targetUser.id),
          eq(socialConnections.friendId, auth.userId)
        )
      ))
      .get()

    if (existingConnection) {
      if (existingConnection.status === 'ACCEPTED') {
        throw createError({
          statusCode: 400,
          message: '你们已经是好友了'
        })
      } else if (existingConnection.status === 'PENDING') {
        // 如果是对方发起的请求，直接接受
        if (existingConnection.userId === targetUser.id) {
          await db.update(socialConnections)
            .set({ 
              status: 'ACCEPTED',
              updatedAt: new Date().toISOString()
            })
            .where(eq(socialConnections.id, existingConnection.id))
          
          return {
            success: true,
            message: '已接受好友请求',
            data: { connectionId: existingConnection.id, status: 'ACCEPTED' }
          }
        } else {
          throw createError({
            statusCode: 400,
            message: '已发送过好友请求，等待对方确认'
          })
        }
      }
    }

    // 创建新的好友请求
    const connectionId = uuidv4()
    await db.insert(socialConnections).values({
      id: connectionId,
      userId: auth.userId,
      friendId: targetUser.id,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    return {
      success: true,
      message: '好友请求已发送',
      data: {
        connectionId,
        status: 'PENDING',
        targetUser: {
          id: targetUser.id,
          nickname: targetUser.nickname,
          avatarUrl: targetUser.avatarUrl
        }
      }
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Add friend error:', error)
    throw createError({
      statusCode: 500,
      message: '添加好友失败'
    })
  }
})
