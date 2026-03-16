import { db } from '@/lib/db'
import { auditLogs } from '@/db/schema'

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
  metadata?:
    | { ip?: string; userAgent?: string; [key: string]: unknown }
    | undefined
}

/**
 * Creates an audit log entry for tracking mutations.
 * Should be called in every server action that modifies data.
 *
 * Metadata (IP, userAgent) must be passed explicitly — use
 * getRequestMetadata() from '@/lib/audit-helpers' in actions.
 */
export async function createAuditLog({
  action,
  entityType,
  entityId,
  userId,
  changes,
  severity = 'medium',
  description,
  metadata,
}: CreateAuditLogParams): Promise<void> {
  await db.insert(auditLogs).values({
    action,
    entityType,
    entityId,
    userId,
    changes,
    severity,
    description,
    metadata: metadata ?? {},
  })
}
