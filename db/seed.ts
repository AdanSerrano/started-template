import { db } from '@/lib/db'
import * as schema from '@/db/schema'

/**
 * Database seed script — Starter Template
 *
 * Usage: bun run db:seed
 *
 * Idempotente — usa onConflictDoNothing() para no duplicar datos.
 */
async function main() {
  console.log('Seeding database...')

  // ── Users ────────────────────────────────────────────────
  const seedUsers = [
    {
      id: 'seed-admin-1',
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
      id: 'seed-user-1',
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
  console.log(`  Users: ${seedUsers.length} seeded`)

  // ── Addresses ────────────────────────────────────────────
  const seedAddresses = [
    {
      id: 'seed-address-1',
      userId: 'seed-user-1',
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
      id: 'seed-address-2',
      userId: 'seed-user-1',
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
  console.log(`  Addresses: ${seedAddresses.length} seeded`)

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
