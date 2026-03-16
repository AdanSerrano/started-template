import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { organizationPlanEnum, orgMemberRoleEnum } from './enums'
import { users } from './users'

export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    plan: organizationPlanEnum('plan').default('free').notNull(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    logo: varchar('logo', { length: 500 }),
    settings: jsonb('settings').$type<Record<string, unknown>>().default({}),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('org_slug_idx').on(table.slug),
    index('org_owner_idx').on(table.ownerId),
  ],
)

export const organizationMembers = pgTable(
  'organization_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: orgMemberRoleEnum('role').default('member').notNull(),
    invitedBy: uuid('invited_by'),

    joinedAt: timestamp('joined_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('org_member_unique_idx').on(table.organizationId, table.userId),
    index('org_member_user_idx').on(table.userId),
  ],
)

export const organizationInvitations = pgTable(
  'organization_invitations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull(),
    role: orgMemberRoleEnum('role').default('member').notNull(),
    token: varchar('token', { length: 255 }).notNull().unique(),
    invitedBy: uuid('invited_by')
      .notNull()
      .references(() => users.id),

    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('org_invitation_token_idx').on(table.token),
    index('org_invitation_email_idx').on(table.email),
  ],
)
