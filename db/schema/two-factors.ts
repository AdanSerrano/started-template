import {
  createTable,
  primaryId,
  uuidCol,
  text,
  index,
  timestamps,
} from '@/db/dialect'
import { users } from './users'

export const twoFactors = createTable(
  'two_factors',
  {
    id: primaryId('id'),
    userId: uuidCol('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    secret: text('secret').notNull(),
    backupCodes: text('backup_codes').notNull(),
    ...timestamps(),
  },
  (table) => [index('two_factor_user_idx').on(table.userId)],
)
