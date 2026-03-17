import {
  createTable,
  primaryId,
  uuidCol,
  varchar,
  text,
  timestampCol,
  index,
  timestamps,
} from '@/db/dialect'
import { users } from './users'

export const sessions = createTable(
  'sessions',
  {
    id: primaryId('id'),
    userId: uuidCol('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Token unico de sesion
    token: varchar('token', { length: 255 }).notNull().unique(),
    expiresAt: timestampCol('expires_at').notNull(),

    // Datos de seguridad
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),

    // Admin (plugin: admin — impersonacion)
    impersonatedBy: uuidCol('impersonated_by'),

    // Timestamps
    ...timestamps(),
  },
  (table) => [
    index('session_user_idx').on(table.userId),
    index('session_token_idx').on(table.token),
    index('session_expires_idx').on(table.expiresAt),
  ],
)
