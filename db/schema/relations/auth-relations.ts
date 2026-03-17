import { relations } from 'drizzle-orm'
import { accounts } from '../accounts'
import { addresses } from '../addresses'
import { auditLogs } from '../audit-logs'
import { sessions } from '../sessions'
import { twoFactors } from '../two-factors'
import { users } from '../users'

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

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}))
