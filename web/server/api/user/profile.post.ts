/**
 * 更新用户资料 API
 * POST /api/user/profile
 */

import { defineEventHandler, readBody, createError } from 'h3'
import { db, userProfiles, users } from '../../db'
import { getUserFromEvent } from '../../utils/jwt'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const auth = getUserFromEvent(event)
  
  if (!auth || !auth.userId) {
    throw createError({
      statusCode: 401,
      message: '未登录或登录已过期'
    })
  }

  const body = await readBody(event)
  
  try {
    // 1. 更新基础信息 (users 表)
    const userUpdateData: any = {}
    if (body.nickname !== undefined) userUpdateData.nickname = body.nickname
    if (body.avatarUrl !== undefined) userUpdateData.avatarUrl = body.avatarUrl
    
    let userUpdated = false
    if (Object.keys(userUpdateData).length > 0) {
      userUpdateData.updatedAt = new Date().toISOString()
      const result = await db.update(users)
        .set(userUpdateData)
        .where(eq(users.id, auth.userId))
        .run()
      userUpdated = result.changes > 0
    }

    // 2. 更新详细资料 (userProfiles 表)
    // 检查是否存在 profile
    const existingProfile = await db.select().from(userProfiles).where(eq(userProfiles.userId, auth.userId)).get()

    const updateData: any = {
      updatedAt: new Date().toISOString()
    }

    // 映射字段
    if (body.gender !== undefined) updateData.gender = body.gender
    if (body.birthDate !== undefined) updateData.birthDate = body.birthDate
    if (body.heightCm !== undefined) updateData.heightCm = body.heightCm
    if (body.weightKg !== undefined) updateData.weightKg = body.weightKg
    
    // 计算 BMI
    if (updateData.heightCm && updateData.weightKg) {
      const h = updateData.heightCm / 100
      updateData.bmi = parseFloat((updateData.weightKg / (h * h)).toFixed(1))
    }

    if (body.goals !== undefined) updateData.goals = JSON.stringify(body.goals)
    if (body.chronicDiseases !== undefined) updateData.chronicDiseases = JSON.stringify(body.chronicDiseases)
    if (body.allergies !== undefined) updateData.allergies = JSON.stringify(body.allergies)
    if (body.sleepPattern !== undefined) updateData.sleepPattern = body.sleepPattern
    if (body.dietHabit !== undefined) updateData.dietHabit = body.dietHabit
    if (body.exerciseFreq !== undefined) updateData.exerciseFreq = body.exerciseFreq
    if (body.waterIntake !== undefined) updateData.waterIntake = body.waterIntake
    if (body.workType !== undefined) updateData.workType = body.workType
    if (body.lateNight !== undefined) updateData.lateNight = Boolean(body.lateNight)
    if (body.regularMeals !== undefined) updateData.regularMeals = Boolean(body.regularMeals)
    if (body.healthConcerns !== undefined) updateData.healthConcerns = JSON.stringify(body.healthConcerns)
    if (body.smokeDrink !== undefined) updateData.smokeDrink = JSON.stringify(body.smokeDrink)
    if (body.occupation !== undefined) updateData.occupation = body.occupation
    if (body.notificationSettings !== undefined) updateData.notificationSettings = JSON.stringify(body.notificationSettings)
    if (body.settings !== undefined) updateData.settings = JSON.stringify(body.settings)
    if (body.privacySettings !== undefined) updateData.privacySettings = JSON.stringify(body.privacySettings)
    if (body.connectedDevices !== undefined) updateData.connectedDevices = JSON.stringify(body.connectedDevices)

    let profileUpdated = false
    if (existingProfile) {
      const result = await db.update(userProfiles)
        .set(updateData)
        .where(eq(userProfiles.userId, auth.userId))
        .run()
      profileUpdated = result.changes > 0
    } else {
      updateData.userId = auth.userId
      await db.insert(userProfiles).values(updateData)
      profileUpdated = true
    }

    // 获取更新后的用户信息
    const updatedUser = await db.select().from(users).where(eq(users.id, auth.userId)).get()
    const updatedProfile = await db.select().from(userProfiles).where(eq(userProfiles.userId, auth.userId)).get()

    return {
      success: true,
      message: userUpdated || profileUpdated ? '资料已更新' : '未有任何变更',
      data: {
        user: updatedUser,
        profile: updatedProfile
      }
    }

  } catch (error: any) {
    console.error('Profile update error:', error)
    throw createError({
      statusCode: 500,
      message: '更新失败，请稍后重试: ' + error.message
    })
  }
})
