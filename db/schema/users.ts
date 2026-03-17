import {
  createTable,
  primaryId,
  uuidCol,
  varchar,
  boolean,
  timestampCol,
  integer,
  index,
  timestamps,
} from '@/db/dialect'
import { userRoleEnum } from './enums'

export const users = createTable(
  'users',
  {
    id: primaryId('id'),
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
    banExpires: timestampCol('ban_expires'),

    // 2FA (plugin: twoFactor)
    twoFactorEnabled: boolean('two_factor_enabled').default(false),

    // Estado
    isActive: boolean('is_active').default(true).notNull(),
    lastLoginAt: timestampCol('last_login_at'),

    // Bloqueo por intentos fallidos
    failedLoginAttempts: integer('failed_login_attempts').default(0).notNull(),
    lockedUntil: timestampCol('locked_until'),

    // Soft delete
    deletedAt: timestampCol('deleted_at'),
    deletedBy: uuidCol('deleted_by'),

    // Timestamps
    ...timestamps(),
  },
  (table) => [
    index('user_email_idx').on(table.email),
    index('user_username_idx').on(table.username),
    index('user_role_idx').on(table.role),
  ],
)
