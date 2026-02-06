import { defineEventHandler } from 'h3'
import { requireAdmin } from '../utils/admin'

export default defineEventHandler(async (event) => {
  // Only apply to admin routes
  if (!event.path.startsWith('/api/admin')) {
    return
  }
  await requireAdmin(event)
})
