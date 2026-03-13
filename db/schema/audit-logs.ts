import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core'
import { auditSeverityEnum } from './enums'
import { users } from './users'

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    timestamp: timestamp('timestamp', { withTimezone: true })
      .defaultNow()
      .notNull(),

    // Quien
    userId: uuid('user_id').references(() => users.id),

    // Que
    action: varchar('action', { length: 100 }).notNull(),
    entityType: varchar('entity_type', { length: 100 }).notNull(),
    entityId: uuid('entity_id'),

    // Cambios (antes -> despues)
    changes: jsonb('changes').$type<{
      before?: Record<string, unknown>
      after?: Record<string, unknown>
    }>(),

    // Contexto
    metadata: jsonb('metadata').$type<{
      ip?: string
      userAgent?: string
      route?: string
      sessionId?: string
      batchId?: string
      affectedCount?: number
      errorDetails?: string
    }>(),

    // Severidad
    severity: auditSeverityEnum('severity').default('medium').notNull(),

    // Descripcion legible
    description: text('description'),
  },
  (table) => [
    index('audit_user_time_idx').on(table.userId, table.timestamp),
    index('audit_entity_idx').on(table.entityType, table.entityId),
    index('audit_action_idx').on(table.action),
    index('audit_severity_idx').on(table.severity),
  ],
)
