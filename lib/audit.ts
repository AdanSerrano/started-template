import { db } from '@/lib/db'
import { auditLogs } from '@/db/schema'
import { headers } from 'next/headers'

type AuditSeverity = 'low' | 'medium' | 'high' | 'critical'

interface CreateAuditLogParams {
  action: string
  entityType: string
  entityId?: string | undefined
  userId?: string | undefined
  changes?:
    | {
        before?: Record<string, unknown>
        after?: Record<string, unknown>
      }
    | undefined
  severity?: AuditSeverity | undefined
  description?: string | undefined
}

/**
 * Creates an audit log entry for tracking mutations.
 * Should be called in every server action that modifies data.
 */
export async function createAuditLog({
  action,
  entityType,
  entityId,
  userId,
  changes,
  severity = 'medium',
  description,
}: CreateAuditLogParams): Promise<void> {
  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    'unknown'
  const userAgent = headersList.get('user-agent') ?? 'unknown'

  await db.insert(auditLogs).values({
    action,
    entityType,
    entityId,
    userId,
    changes,
    severity,
    description,
    metadata: { ip, userAgent },
  })
}
