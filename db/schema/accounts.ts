import {
  createTable,
  primaryId,
  uuidCol,
  varchar,
  text,
  timestampCol,
  uniqueIndex,
  index,
  timestamps,
} from '@/db/dialect'
import { users } from './users'

export const accounts = createTable(
  'accounts',
  {
    id: primaryId('id'),
    userId: uuidCol('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Proveedor de autenticacion
    providerId: varchar('provider_id', { length: 255 }).notNull(),
    accountId: varchar('account_id', { length: 255 }).notNull(),

    // Tokens OAuth
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    accessTokenExpiresAt: timestampCol('access_token_expires_at'),
    refreshTokenExpiresAt: timestampCol('refresh_token_expires_at'),

    // ID Token y Scope
    idToken: text('id_token'),
    scope: varchar('scope', { length: 255 }),

    // Password hash (solo para providerId="credential")
    password: text('password'),

    // Timestamps
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('provider_account_idx').on(table.providerId, table.accountId),
    index('account_user_idx').on(table.userId),
  ],
)
