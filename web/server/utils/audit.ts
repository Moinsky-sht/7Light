import type { H3Event } from 'h3'
import { getRequestHeader } from 'h3'
import { v4 as uuidv4 } from 'uuid'
import { db, adminAuditLogs } from '../db'
import { getUserFromEvent } from './jwt'

export async function writeAdminAudit(
  event: H3Event,
  input: {
    action: string
    entityType: string
    entityId?: string | null
    detail?: any
  }
) {
  const auth = getUserFromEvent(event)
  if (!auth) return

  const ipHeader = getRequestHeader(event, 'x-forwarded-for') || ''
  const ip = ipHeader ? ipHeader.split(',')[0].trim() : event.node.req.socket.remoteAddress || ''
  const userAgent = getRequestHeader(event, 'user-agent') || ''
  const now = new Date().toISOString()

  try {
    await db.insert(adminAuditLogs).values({
      id: uuidv4(),
      actorUserId: auth.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId || null,
      detail: input.detail ? JSON.stringify(input.detail) : null,
      ip,
      userAgent,
      createdAt: now
    })
  } catch {}
}

