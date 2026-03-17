'use server'

import { z } from 'zod/v4'
import { createAuditLog } from '@/lib/audit'
import { TooManyRequestsError } from '@/lib/errors'
import type { RateLimitConfig } from '@/lib/interfaces'
import { getGDPRService } from '@/lib/providers'
import { checkRateLimit } from '@/lib/rate-limit'
import { createSafeAction } from '@/lib/safe-action'

// Rate limit: 3 GDPR operations per user per hour (CPU-intensive, irreversible)
const GDPR_RATE_LIMIT: RateLimitConfig = { limit: 3, windowSeconds: 3600 }

function enforceGDPRLimit(userId: string): void {
  const result = checkRateLimit(`gdpr:${userId}`, GDPR_RATE_LIMIT)
  if (!result.success) {
    throw new TooManyRequestsError('validation.tooManyRequests')
  }
}

export const exportMyDataAction = createSafeAction(
  { auth: true },
  async ({ session, metadata }) => {
    enforceGDPRLimit(session.user.id)

    const gdprService = getGDPRService()
    const exportData = await gdprService.exportUserData(session.user.id)

    await createAuditLog({
      action: 'gdpr.data_exported',
      entityType: 'user',
      entityId: session.user.id,
      userId: session.user.id,
      severity: 'medium',
      metadata,
    })

    return exportData
  },
)

const deleteConfirmationSchema = z.string().refine((val) => val === 'DELETE', {
  error: 'validation.deleteConfirmationRequired',
})

export const deleteMyAccountAction = createSafeAction(
  { schema: deleteConfirmationSchema, auth: true },
  async ({ session, metadata }) => {
    enforceGDPRLimit(session.user.id)

    await createAuditLog({
      action: 'gdpr.account_deleted',
      entityType: 'user',
      entityId: session.user.id,
      userId: session.user.id,
      severity: 'critical',
      metadata,
    })

    const gdprService = getGDPRService()
    await gdprService.deleteUserData(session.user.id)
  },
)
