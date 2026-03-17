import { auditLogs } from '@/db/schema'
import { db } from '@/lib/db'

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
 *
 * Fire-and-forget: nunca lanza error para no romper la accion principal.
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
  try {
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
  } catch (error) {
    console.error('[audit] Failed to create audit log:', {
      action,
      entityType,
      entityId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
