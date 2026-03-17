import { relations } from 'drizzle-orm'
import {
  organizations,
  organizationMembers,
  organizationInvitations,
} from '../organizations'
import { users } from '../users'

export const organizationsRelations = relations(
  organizations,
  ({ one, many }) => ({
    owner: one(users, {
      fields: [organizations.ownerId],
      references: [users.id],
    }),
    members: many(organizationMembers),
    invitations: many(organizationInvitations),
  }),
)

export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMembers.organizationId],
      references: [organizations.id],
    }),
    user: one(users, {
      fields: [organizationMembers.userId],
      references: [users.id],
    }),
  }),
)

export const organizationInvitationsRelations = relations(
  organizationInvitations,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationInvitations.organizationId],
      references: [organizations.id],
    }),
    inviter: one(users, {
      fields: [organizationInvitations.invitedBy],
      references: [users.id],
    }),
  }),
)
