import * as schema from '@/db/schema'
import { db } from '@/lib/db'

/**
 * Database seed script — Starter Template
 *
 * Usage: bun run db:seed
 *
 * Idempotente — usa onConflictDoNothing() para no duplicar datos.
 */
async function main() {
  // eslint-disable-next-line no-console
  console.log('Seeding database...')

  // IDs fijos (UUID válidos) para que el seed sea idempotente. Las columnas
  // son `uuid` en PG: un id string tipo 'seed-admin-1' hace fallar el insert.
  const ADMIN_ID = '00000000-0000-4000-8000-000000000001'
  const USER_ID = '00000000-0000-4000-8000-000000000002'

  // ── Users ────────────────────────────────────────────────
  const seedUsers = [
    {
      id: ADMIN_ID,
      name: 'Admin User',
      email: 'admin@example.com',
      emailVerified: true,
      role: 'admin' as const,
      username: 'admin',
      displayUsername: 'Admin',
      isActive: true,
      failedLoginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: USER_ID,
      name: 'Test User',
      email: 'user@example.com',
      emailVerified: true,
      role: 'user' as const,
      username: 'testuser',
      displayUsername: 'TestUser',
      isActive: true,
      failedLoginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  for (const user of seedUsers) {
    // PG/SQLite: onConflictDoNothing
    // MySQL: usar .onDuplicateKeyUpdate({ set: { id: sql`id` } })
    await db
      .insert(schema.users)
      .values(user)
      .onConflictDoNothing({ target: schema.users.id })
  }
  // eslint-disable-next-line no-console
  console.log(`  Users: ${seedUsers.length} seeded`)

  // ── Addresses ────────────────────────────────────────────
  const seedAddresses = [
    {
      id: '00000000-0000-4000-8000-000000000101',
      userId: USER_ID,
      type: 'shipping' as const,
      isDefault: true,
      firstName: 'Test',
      lastName: 'User',
      street: 'Carrer de Balmes 100',
      city: 'Barcelona',
      province: 'Barcelona',
      postalCode: '08008',
      country: 'ES',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '00000000-0000-4000-8000-000000000102',
      userId: USER_ID,
      type: 'billing' as const,
      isDefault: false,
      firstName: 'Test',
      lastName: 'User',
      street: 'Gran Via 500',
      city: 'Barcelona',
      province: 'Barcelona',
      postalCode: '08015',
      country: 'ES',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  for (const address of seedAddresses) {
    // PG/SQLite: onConflictDoNothing
    // MySQL: usar .onDuplicateKeyUpdate({ set: { id: sql`id` } })
    await db
      .insert(schema.addresses)
      .values(address)
      .onConflictDoNothing({ target: schema.addresses.id })
  }
  // eslint-disable-next-line no-console
  console.log(`  Addresses: ${seedAddresses.length} seeded`)

  // eslint-disable-next-line no-console
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
