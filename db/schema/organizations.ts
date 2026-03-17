import {
  createTable,
  primaryId,
  uuidCol,
  varchar,
  timestampCol,
  jsonCol,
  index,
  uniqueIndex,
  timestamps,
} from '@/db/dialect'
import { organizationPlanEnum, orgMemberRoleEnum } from './enums'
import { users } from './users'

export const organizations = createTable(
  'organizations',
  {
    id: primaryId('id'),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    plan: organizationPlanEnum('plan').default('free').notNull(),
    ownerId: uuidCol('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    logo: varchar('logo', { length: 500 }),
    settings: jsonCol('settings').$type<Record<string, unknown>>().default({}),

    ...timestamps(),
  },
  (table) => [
    uniqueIndex('org_slug_idx').on(table.slug),
    index('org_owner_idx').on(table.ownerId),
  ],
)

export const organizationMembers = createTable(
  'organization_members',
  {
    id: primaryId('id'),
    organizationId: uuidCol('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuidCol('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: orgMemberRoleEnum('role').default('member').notNull(),
    invitedBy: uuidCol('invited_by'),

    joinedAt: timestampCol('joined_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('org_member_unique_idx').on(table.organizationId, table.userId),
    index('org_member_user_idx').on(table.userId),
  ],
)

export const organizationInvitations = createTable(
  'organization_invitations',
  {
    id: primaryId('id'),
    organizationId: uuidCol('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull(),
    role: orgMemberRoleEnum('role').default('member').notNull(),
    token: varchar('token', { length: 255 }).notNull().unique(),
    invitedBy: uuidCol('invited_by')
      .notNull()
      .references(() => users.id),

    expiresAt: timestampCol('expires_at').notNull(),
    createdAt: timestampCol('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('org_invitation_token_idx').on(table.token),
    index('org_invitation_email_idx').on(table.email),
  ],
)
