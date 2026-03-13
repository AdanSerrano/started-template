import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core'

export const verifications = pgTable(
  'verifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Identificador del flujo (tipicamente el email del usuario)
    identifier: varchar('identifier', { length: 255 }).notNull(),
    // Valor del token
    value: varchar('value', { length: 255 }).notNull(),

    // Expiracion
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('verification_identifier_idx').on(table.identifier),
    index('verification_expires_idx').on(table.expiresAt),
  ],
)
