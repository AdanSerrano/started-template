import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { users } from './users'

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Token unico de sesion
    token: varchar('token', { length: 255 }).notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),

    // Datos de seguridad
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),

    // Admin (plugin: admin — impersonacion)
    impersonatedBy: uuid('impersonated_by'),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('session_user_idx').on(table.userId),
    index('session_token_idx').on(table.token),
    index('session_expires_idx').on(table.expiresAt),
  ],
)
