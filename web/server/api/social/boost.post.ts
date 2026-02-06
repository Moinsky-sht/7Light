/**
 * 借火（提醒打卡）API
 * POST /api/social/boost
 */

import { defineEventHandler, readBody, createError } from 'h3'
import { v4 as uuidv4 } from 'uuid'
import { db, users, socialConnections, socialInteractions, checkinStats } from '../../db'
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
  const { friendId, message } = body

  if (!friendId) {
    throw createError({
      statusCode: 400,
      message: '请指定好友'
    })
  }

  try {
    // 检查是否是好友
    const connection = await db.select()
      .from(socialConnections)
      .where(and(
        or(
          and(
            eq(socialConnections.userId, auth.userId),
            eq(socialConnections.friendId, friendId)
          ),
          and(
            eq(socialConnections.userId, friendId),
            eq(socialConnections.friendId, auth.userId)
          )
        ),
        eq(socialConnections.status, 'ACCEPTED')
      ))
      .get()

    if (!connection) {
      throw createError({
        statusCode: 400,
        message: '你们还不是好友'
      })
    }

    // 获取好友信息
    const friend = await db.select().from(users).where(eq(users.id, friendId)).get()
    if (!friend) {
      throw createError({
        statusCode: 404,
        message: '用户不存在'
      })
    }

    // 获取当前用户信息
    const currentUser = await db.select().from(users).where(eq(users.id, auth.userId)).get()

    // 检查今日是否已借火
    const today = new Date().toISOString().split('T')[0]
    const existingBoost = await db.select()
      .from(socialInteractions)
      .where(and(
        eq(socialInteractions.fromUserId, auth.userId),
        eq(socialInteractions.toUserId, friendId),
        eq(socialInteractions.type, 'BOOST')
      ))
      .all()

    const todayBoost = existingBoost.find(b => b.createdAt?.startsWith(today))
    if (todayBoost) {
      throw createError({
        statusCode: 400,
        message: '今日已向该好友借火，明日再来'
      })
    }

    // 生成借火消息
    const boostMessage = message || `${currentUser?.nickname || '灯友'}向你借火，快来点亮今日星灯！`

    // 创建互动记录
    const interactionId = uuidv4()
    await db.insert(socialInteractions).values({
      id: interactionId,
      fromUserId: auth.userId,
      toUserId: friendId,
      type: 'BOOST',
      content: boostMessage,
      isRead: false,
      createdAt: new Date().toISOString()
    })

    // 获取好友的打卡状态
    const friendStats = await db.select().from(checkinStats).where(eq(checkinStats.userId, friendId)).get()
    const friendTodayCheckedIn = friendStats?.lastCheckinDate === today

    return {
      success: true,
      message: '借火成功，已提醒好友',
      data: {
        interactionId,
        friend: {
          id: friend.id,
          nickname: friend.nickname,
          todayCheckedIn: friendTodayCheckedIn,
          currentStreak: friendStats?.currentStreak || 0
        },
        boostMessage
      }
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Boost error:', error)
    throw createError({
      statusCode: 500,
      message: '借火失败'
    })
  }
})
