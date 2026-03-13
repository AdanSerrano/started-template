import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'
import { users } from './users'

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Proveedor de autenticacion
    providerId: varchar('provider_id', { length: 255 }).notNull(),
    accountId: varchar('account_id', { length: 255 }).notNull(),

    // Tokens OAuth
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
      withTimezone: true,
    }),

    // ID Token y Scope
    idToken: text('id_token'),
    scope: varchar('scope', { length: 255 }),

    // Password hash (solo para providerId="credential")
    password: text('password'),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('provider_account_idx').on(table.providerId, table.accountId),
    index('account_user_idx').on(table.userId),
  ],
)
