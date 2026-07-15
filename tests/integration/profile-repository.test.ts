// @vitest-environment node
/**
 * Integration test: profileRepository contra Postgres real (pglite).
 */

import { beforeAll, describe, expect, it, vi } from 'vitest'
import * as schema from '@/db/schema'
import { createTestDb, type TestDb } from '../utils/test-db'

const holder = vi.hoisted(() => ({ db: null as unknown }))
vi.mock('@/lib/db', () => ({
  get db() {
    return holder.db
  },
}))

const USER = '00000000-0000-4000-8000-0000000000e1'

let db: TestDb
let repo: (typeof import('@/modules/account/repositories/profile-repository'))['profileRepository']

beforeAll(async () => {
  const testDb = await createTestDb()
  db = testDb.db
  holder.db = db
  await db.insert(schema.users).values({
    id: USER,
    name: 'Original',
    email: 'profile@example.com',
    phone: '+34600000000',
  })
  ;({ profileRepository: repo } =
    await import('@/modules/account/repositories/profile-repository'))
}, 30000)

describe('profileRepository (integration)', () => {
  it('findById devuelve el perfil', async () => {
    const profile = await repo.findById(USER)
    expect(profile).not.toBeNull()
    expect(profile!.name).toBe('Original')
    expect(profile!.email).toBe('profile@example.com')
  })

  it('findById de un id inexistente devuelve null', async () => {
    expect(
      await repo.findById('00000000-0000-4000-8000-0000000000ff'),
    ).toBeNull()
  })

  it('update cambia los campos y devuelve la fila', async () => {
    const updated = await repo.update(USER, { name: 'Nuevo', phone: null })
    expect(updated!.name).toBe('Nuevo')
    expect(updated!.phone).toBeNull()
    expect((await repo.findById(USER))!.name).toBe('Nuevo')
  })

  it('update de un id inexistente devuelve null', async () => {
    expect(
      await repo.update('00000000-0000-4000-8000-0000000000ff', {
        name: 'x',
      }),
    ).toBeNull()
  })
})
