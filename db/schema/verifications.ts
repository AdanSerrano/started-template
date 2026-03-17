import {
  createTable,
  primaryId,
  varchar,
  timestampCol,
  index,
  timestamps,
} from '@/db/dialect'

export const verifications = createTable(
  'verifications',
  {
    id: primaryId('id'),

    // Identificador del flujo (tipicamente el email del usuario)
    identifier: varchar('identifier', { length: 255 }).notNull(),
    // Valor del token
    value: varchar('value', { length: 255 }).notNull(),

    // Expiracion
    expiresAt: timestampCol('expires_at').notNull(),

    // Timestamps
    ...timestamps(),
  },
  (table) => [
    index('verification_identifier_idx').on(table.identifier),
    index('verification_expires_idx').on(table.expiresAt),
  ],
)
