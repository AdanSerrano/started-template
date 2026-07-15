// @vitest-environment node
/**
 * Integration test: userRepository.softDelete debe REVOCAR las sesiones activas
 * (fix de seguridad Tanda A #3) — validado contra Postgres real.
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

const USER = '00000000-0000-4000-8000-0000000000c1'
const ADMIN = '00000000-0000-4000-8000-0000000000c2'

let db: TestDb
let repo: (typeof import('@/modules/auth/repositories/user-repository'))['userRepository']

beforeAll(async () => {
  const testDb = await createTestDb()
  db = testDb.db
  holder.db = db
  await db.insert(schema.users).values([
    { id: USER, name: 'User', email: 'user@example.com' },
    { id: ADMIN, name: 'Admin', email: 'admin@example.com' },
  ])
  ;({ userRepository: repo } =
    await import('@/modules/auth/repositories/user-repository'))
}, 30000)

describe('userRepository.softDelete (integration)', () => {
  it('marca el usuario como borrado/inactivo y revoca sus sesiones', async () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await db.insert(schema.sessions).values([
      { userId: USER, token: 'tok-1', expiresAt: future },
      { userId: USER, token: 'tok-2', expiresAt: future },
    ])

    const before = await db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.userId, USER))
    expect(before).toHaveLength(2)

    await repo.softDelete(USER, ADMIN)

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, USER))
    expect(user!.deletedAt).not.toBeNull()
    expect(user!.isActive).toBe(false)
    expect(user!.deletedBy).toBe(ADMIN)

    // Las sesiones activas ya NO existen: el usuario borrado no sigue logueado.
    const after = await db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.userId, USER))
    expect(after).toHaveLength(0)
  })

  it('restore revierte el soft-delete', async () => {
    await repo.restore(USER)
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, USER))
    expect(user!.deletedAt).toBeNull()
    expect(user!.isActive).toBe(true)
    expect(user!.deletedBy).toBeNull()
  })
})

describe('userRepository lookups & lock counters (integration)', () => {
  it('findIdByEmail/Username normaliza a minúsculas', async () => {
    expect(await repo.findIdByEmail('USER@EXAMPLE.COM')).toBe(USER)
    expect(await repo.findIdByEmail('nope@example.com')).toBeNull()
  })

  it('update/get/reset de intentos fallidos y lockedUntil', async () => {
    const until = new Date(Date.now() + 60_000)
    await repo.updateFailedLoginAttempts(USER, 3, until)
    expect(await repo.getFailedLoginAttempts(USER)).toBe(3)
    expect((await repo.getLockedUntil(USER))?.getTime()).toBe(until.getTime())

    await repo.resetFailedLogin(USER)
    expect(await repo.getFailedLoginAttempts(USER)).toBe(0)
    expect(await repo.getLockedUntil(USER)).toBeNull()
  })
})
