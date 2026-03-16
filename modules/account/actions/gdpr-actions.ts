'use server'

import { requireAuth } from '@/lib/auth-server'
import { createAuditLog } from '@/lib/audit'
import { getRequestMetadata } from '@/lib/audit-helpers'
import { getGDPRService } from '@/lib/providers'
import type { ActionResult } from './account-actions'

export async function exportMyDataAction(): Promise<
  ActionResult & { data?: unknown }
> {
  const session = await requireAuth()
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
  const metadata = await getRequestMetadata()

  if (confirmation !== 'DELETE') {
    return {
      success: false,
      error: 'Debes escribir DELETE para confirmar',
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
