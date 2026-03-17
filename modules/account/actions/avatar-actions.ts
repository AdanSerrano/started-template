'use server'

import { createAuditLog } from '@/lib/audit'
import { getRequestMetadata } from '@/lib/audit-helpers'
import { requireAuth } from '@/lib/auth-server'
import type { RateLimitConfig } from '@/lib/interfaces'
import { checkRateLimit } from '@/lib/rate-limit'
import type { ActionResult } from '@/lib/safe-action'
import * as accountService from '../services/account-service'

// Rate limit: 5 upload operations per user per 5 minutes
const UPLOAD_RATE_LIMIT: RateLimitConfig = { limit: 5, windowSeconds: 300 }

export async function uploadAvatarAction(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  const session = await requireAuth()
  const rl = checkRateLimit(
    `account:upload:${session.user.id}`,
    UPLOAD_RATE_LIMIT,
  )
  if (!rl.success) {
    return { success: false, error: 'validation.tooManyRequests' }
  }
  const metadata = await getRequestMetadata()

  const file = formData.get('file') as File | null
  if (!file) {
    return { success: false, error: 'validation.fileRequired' }
  }

  const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ]
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const MIME_TO_EXT: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { success: false, error: 'validation.fileTypeNotAllowed' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'validation.fileTooLarge' }
  }

  const { getStorageService } = await import('@/lib/providers')
  const storage = getStorageService()

  const extension = MIME_TO_EXT[file.type] || 'jpg'
  const uniqueId = crypto.randomUUID().slice(0, 8)
  const key = `public/avatars/${session.user.id}/${uniqueId}.${extension}`

  const publicUrl = await storage.upload(key, file, file.type)

  const profile = await accountService.getProfile(session.user.id)
  await accountService.updateProfile(session.user.id, {
    name: profile?.name ?? '',
    image: publicUrl,
  })

  await createAuditLog({
    action: 'profile.avatar_updated',
    entityType: 'user',
    entityId: session.user.id,
    userId: session.user.id,
    severity: 'low',
    metadata,
  })

  return { success: true, data: { url: publicUrl } }
}
