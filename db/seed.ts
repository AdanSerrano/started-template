import { db } from '@/lib/db'
import * as schema from '@/db/schema'

/**
 * Database seed script — Starter Template
 *
 * Usage: bun run db:seed
 *
 * Add your seed data below. Example:
 *
 *   await db.insert(schema.users).values({
 *     id: 'seed-user-1',
 *     name: 'Test User',
 *     email: 'test@example.com',
 *     emailVerified: true,
 *     createdAt: new Date(),
 *     updatedAt: new Date(),
 *   })
 *
 * Tips:
 * - Use `onConflictDoNothing()` to make seeds idempotent
 * - Group related seeds with comments
 * - Keep seed data minimal — just enough to develop against
 */
async function main() {
  console.log('Seeding database...')

  // Add your seed data here
  // Keeping schema import to avoid unused-import warnings in CI
  void schema

  console.log('Seeding complete.')
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    process.exit(0)
  })
