import { relations } from 'drizzle-orm'
import { users } from '../users'
import { accounts } from '../accounts'
import { sessions } from '../sessions'
import { twoFactors } from '../two-factors'
import { auditLogs } from '../audit-logs'
import { addresses } from '../addresses'

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  twoFactors: many(twoFactors),
  auditLogs: many(auditLogs),
  addresses: many(addresses),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const twoFactorsRelations = relations(twoFactors, ({ one }) => ({
  user: one(users, {
    fields: [twoFactors.userId],
    references: [users.id],
  }),
}))
