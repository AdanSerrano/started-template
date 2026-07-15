// @vitest-environment node
/**
 * Integration test: GDPRService.deleteUserData debe borrar TODA credencial/PII
 * (fix Tanda A #4) — accounts (password hash + OAuth), twoFactors (secreto TOTP),
 * verifications, sessions y addresses — validado contra Postgres real.
 */

import { eq } from 'drizzle-orm'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import * as schema from '@/db/schema'
import { createTestDb, type TestDb } from '../utils/test-db'

const holder = vi.hoisted(() => ({ db: null as unknown }))
vi.mock('@/lib/db', () => ({
  get db() {
    return holder.db
  },
}))

const USER = '00000000-0000-4000-8000-0000000000d1'
const EMAIL = 'erase-me@example.com'

let db: TestDb
let GDPRService: (typeof import('@/lib/adapters/gdpr'))['GDPRService']

beforeAll(async () => {
  const testDb = await createTestDb()
  db = testDb.db
  holder.db = db
  await db
    .insert(schema.users)
    .values({ id: USER, name: 'Erase', email: EMAIL })
  await db.insert(schema.accounts).values({
    userId: USER,
    providerId: 'credential',
    accountId: USER,
    password: 'hashed-password-secret',
  })
  await db.insert(schema.twoFactors).values({
    userId: USER,
    secret: 'TOTP-SHARED-SECRET',
    backupCodes: 'a,b,c',
  })
  await db.insert(schema.verifications).values({
    identifier: EMAIL,
    value: 'pending-token',
    expiresAt: new Date(Date.now() + 3600_000),
  })
  await db.insert(schema.sessions).values({
    userId: USER,
    token: 'sess-1',
    expiresAt: new Date(Date.now() + 3600_000),
  })
  await db.insert(schema.addresses).values({
    userId: USER,
    firstName: 'E',
    lastName: 'R',
    street: 'x',
    city: 'y',
    postalCode: '00000',
  })
  ;({ GDPRService } = await import('@/lib/adapters/gdpr'))
}, 30000)

describe('GDPRService.deleteUserData (integration)', () => {
  it('elimina credenciales, secreto TOTP, tokens, sesiones y direcciones', async () => {
    await new GDPRService().deleteUserData(USER)

    const accounts = await db
      .select()
      .from(schema.accounts)
      .where(eq(schema.accounts.userId, USER))
    const twoFactors = await db
      .select()
      .from(schema.twoFactors)
      .where(eq(schema.twoFactors.userId, USER))
    const verifications = await db
      .select()
      .from(schema.verifications)
      .where(eq(schema.verifications.identifier, EMAIL))
    const sessions = await db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.userId, USER))
    const addresses = await db
      .select()
      .from(schema.addresses)
      .where(eq(schema.addresses.userId, USER))

    expect(accounts).toHaveLength(0) // password hash + tokens OAuth
    expect(twoFactors).toHaveLength(0) // secreto TOTP
    expect(verifications).toHaveLength(0)
    expect(sessions).toHaveLength(0)
    expect(addresses).toHaveLength(0)

    // El usuario se anonimiza (soft-delete), no se borra la fila.
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, USER))
    expect(user!.isActive).toBe(false)
    expect(user!.deletedAt).not.toBeNull()
    expect(user!.email).not.toBe(EMAIL)
  })
})
