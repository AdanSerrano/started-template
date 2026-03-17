'use server'

import { requireAuth } from '@/lib/auth-server'
import { createAuditLog } from '@/lib/audit'
import { getRequestMetadata } from '@/lib/audit-helpers'
import { checkRateLimit } from '@/lib/rate-limit'
import { getGDPRService } from '@/lib/providers'
import type { ActionResult } from './account-actions'

// Rate limit: 3 GDPR operations per user per hour (CPU-intensive, irreversible)
const GDPR_RATE_LIMIT = { maxAttempts: 3, windowMs: 60 * 60 * 1000 }

export async function exportMyDataAction(): Promise<
  ActionResult & { data?: unknown }
> {
  const session = await requireAuth()
  const rl = checkRateLimit(`gdpr:${session.user.id}`, GDPR_RATE_LIMIT)
  if (!rl.success) {
    return { success: false, error: 'validation.tooManyRequests' }
  }
  const metadata = await getRequestMetadata()

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

  return { success: true, data: exportData }
}

export async function deleteMyAccountAction(
  confirmation: string,
): Promise<ActionResult> {
  const session = await requireAuth()
  const rl = checkRateLimit(`gdpr:${session.user.id}`, GDPR_RATE_LIMIT)
  if (!rl.success) {
    return { success: false, error: 'validation.tooManyRequests' }
  }
  const metadata = await getRequestMetadata()

  if (confirmation !== 'DELETE') {
    return {
      success: false,
      error: 'validation.deleteConfirmationRequired',
    }
  }

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

  return { success: true }
}
