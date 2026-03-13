import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  integer,
  index,
} from 'drizzle-orm/pg-core'
import { userRoleEnum } from './enums'

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: varchar('image', { length: 500 }),
    phone: varchar('phone', { length: 50 }),
    role: userRoleEnum('role').default('user').notNull(),

    // Username (plugin: username)
    username: varchar('username', { length: 255 }).unique(),
    displayUsername: varchar('display_username', { length: 255 }),

    // Admin (plugin: admin)
    banned: boolean('banned').default(false),
    banReason: varchar('ban_reason', { length: 500 }),
    banExpires: timestamp('ban_expires', { withTimezone: true }),

    // 2FA (plugin: twoFactor)
    twoFactorEnabled: boolean('two_factor_enabled').default(false),

    // Estado
    isActive: boolean('is_active').default(true).notNull(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),

    // Bloqueo por intentos fallidos
    failedLoginAttempts: integer('failed_login_attempts').default(0).notNull(),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),

    // Soft delete
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    deletedBy: uuid('deleted_by'),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('user_email_idx').on(table.email),
    index('user_username_idx').on(table.username),
    index('user_role_idx').on(table.role),
  ],
)
