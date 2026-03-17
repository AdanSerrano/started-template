'use server'

import { createAuditLog } from '@/lib/audit'
import { TooManyRequestsError, ValidationError } from '@/lib/errors'
import type { RateLimitConfig } from '@/lib/interfaces'
import { checkRateLimit } from '@/lib/rate-limit'
import { createSafeFormAction } from '@/lib/safe-action'
import { validateFile } from '@/lib/upload-validation'
import * as accountService from '../services/account-service'

// Rate limit: 5 upload operations per user per 5 minutes
const UPLOAD_RATE_LIMIT: RateLimitConfig = { limit: 5, windowSeconds: 300 }

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export const uploadAvatarAction = createSafeFormAction(
  async ({ formData, session, metadata }) => {
    const rl = checkRateLimit(
      `account:upload:${session.user.id}`,
      UPLOAD_RATE_LIMIT,
    )
    if (!rl.success) {
      throw new TooManyRequestsError(
        'validation.tooManyRequests',
        rl.reset - Date.now(),
      )
    }

    const file = formData.get('file') as File | null
    if (!file) {
      throw new ValidationError('validation.fileRequired')
    }

    // Validacion completa: MIME, extension y magic bytes
    const validation = await validateFile(file, {
      maxSizeBytes: MAX_FILE_SIZE,
      allowedMimeTypes: ALLOWED_MIME_TYPES,
      allowedExtensions: ALLOWED_EXTENSIONS,
    })
    if (!validation.valid) {
      throw new ValidationError(validation.error!)
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

    return { url: publicUrl }
  },
)
