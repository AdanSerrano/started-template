// @vitest-environment node
/**
 * Integration tests for addressRepository contra Postgres real (pglite).
 * Valida ownership (no IDOR), soft-delete (notDeleted) y la transacción de
 * "un solo default" — comportamiento real, no mocks del query builder.
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

const USER_A = '00000000-0000-4000-8000-0000000000a1'
const USER_B = '00000000-0000-4000-8000-0000000000b2'

let db: TestDb
let repo: (typeof import('@/modules/account/repositories/address-repository'))['addressRepository']

const baseAddress = {
  type: 'shipping' as const,
  firstName: 'Ana',
  lastName: 'García',
  street: 'Calle Mayor 1',
  city: 'Madrid',
  postalCode: '28001',
  country: 'ES',
}

beforeAll(async () => {
  const testDb = await createTestDb()
  db = testDb.db
  holder.db = db
  await db.insert(schema.users).values([
    { id: USER_A, name: 'A', email: 'a@example.com' },
    { id: USER_B, name: 'B', email: 'b@example.com' },
  ])
  ;({ addressRepository: repo } =
    await import('@/modules/account/repositories/address-repository'))
}, 30000)

describe('addressRepository (integration)', () => {
  it('create + findByUserId devuelve la dirección del usuario', async () => {
    const created = await repo.create({ ...baseAddress, userId: USER_A })
    expect(created.id).toBeTruthy()

    const list = await repo.findByUserId(USER_A)
    expect(list).toHaveLength(1)
    expect(list[0]!.street).toBe('Calle Mayor 1')
  })

  it('findById NO devuelve la dirección de otro usuario (sin IDOR)', async () => {
    const created = await repo.create({ ...baseAddress, userId: USER_A })
    expect(await repo.findById(created.id, USER_A)).not.toBeNull()
    expect(await repo.findById(created.id, USER_B)).toBeNull()
  })

  it('update de otro usuario devuelve null y no muta', async () => {
    const created = await repo.create({ ...baseAddress, userId: USER_A })
    const result = await repo.update(created.id, USER_B, {
      city: 'Hackerville',
    })
    expect(result).toBeNull()
    const still = await repo.findById(created.id, USER_A)
    expect(still!.city).toBe('Madrid')
  })

  it('remove hace soft-delete (notDeleted lo oculta después)', async () => {
    const created = await repo.create({ ...baseAddress, userId: USER_A })
    expect(await repo.remove(created.id, USER_A)).toBe(true)
    expect(await repo.findById(created.id, USER_A)).toBeNull()
    // remove de nuevo no encuentra nada (ya borrado).
    expect(await repo.remove(created.id, USER_A)).toBe(false)
  })

  it('setDefault deja exactamente una default por usuario', async () => {
    const first = await repo.create({
      ...baseAddress,
      userId: USER_B,
      isDefault: true,
    })
    const second = await repo.create({ ...baseAddress, userId: USER_B })

    await repo.setDefault(second.id, USER_B)

    const list = await repo.findByUserId(USER_B)
    const defaults = list.filter((a) => a.isDefault)
    expect(defaults).toHaveLength(1)
    expect(defaults[0]!.id).toBe(second.id)
    expect(list.find((a) => a.id === first.id)!.isDefault).toBe(false)
  })

  it('countByUserId cuenta solo las no borradas', async () => {
    const before = await repo.countByUserId(USER_A)
    const extra = await repo.create({ ...baseAddress, userId: USER_A })
    expect(await repo.countByUserId(USER_A)).toBe(before + 1)
    await repo.remove(extra.id, USER_A)
    expect(await repo.countByUserId(USER_A)).toBe(before)
  })
})
