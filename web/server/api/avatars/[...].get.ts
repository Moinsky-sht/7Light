/**
 * 头像文件服务 API
 * GET /api/avatars/sanguo_avatars/01.jpg
 */

import { defineEventHandler, createError, setHeader } from 'h3'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  // Nuxt 3 中 [...].get.ts 的参数名是 _ (下划线)
  const path = event.context.params?._
  
  if (!path) {
    throw createError({
      statusCode: 400,
      message: '缺少文件路径'
    })
  }

  // 安全检查：防止路径遍历攻击
  if (path.includes('..') || path.includes('~')) {
    throw createError({
      statusCode: 400,
      message: '无效的文件路径'
    })
  }

  // 构建文件路径
  const publicDir = join(process.cwd(), 'public', 'avatars')
  const filePath = join(publicDir, path)

  // 检查文件是否存在
  if (!existsSync(filePath)) {
    console.log('头像文件不存在:', filePath)
    throw createError({
      statusCode: 404,
      message: '文件不存在'
    })
  }

  try {
    // 读取文件
    const fileBuffer = readFileSync(filePath)
    
    // 根据扩展名设置 Content-Type
    const ext = path.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    if (ext === 'jpg' || ext === 'jpeg') {
      contentType = 'image/jpeg'
    } else if (ext === 'png') {
      contentType = 'image/png'
    } else if (ext === 'gif') {
      contentType = 'image/gif'
    } else if (ext === 'webp') {
      contentType = 'image/webp'
    }

    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Cache-Control', 'public, max-age=86400') // 缓存1天
    
    return fileBuffer
  } catch (error: any) {
    console.error('读取头像文件失败:', error)
    throw createError({
      statusCode: 500,
      message: '读取文件失败'
    })
  }
})
