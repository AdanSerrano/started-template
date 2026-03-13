import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { addressTypeEnum } from './enums'
import { users } from './users'

export const addresses = pgTable(
  'addresses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    type: addressTypeEnum('type').default('shipping').notNull(),
    isDefault: boolean('is_default').default(false).notNull(),

    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    street: varchar('street', { length: 255 }).notNull(),
    city: varchar('city', { length: 100 }).notNull(),
    province: varchar('province', { length: 100 }),
    postalCode: varchar('postal_code', { length: 20 }).notNull(),
    country: varchar('country', { length: 2 }).default('ES').notNull(),
    phone: varchar('phone', { length: 50 }),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('address_user_idx').on(table.userId),
    index('address_user_type_idx').on(table.userId, table.type),
  ],
)
