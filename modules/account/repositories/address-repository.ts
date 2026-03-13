import { db } from '@/lib/db'
import { addresses } from '@/db/schema'
import { eq, and, count, sql } from 'drizzle-orm'
import type { AddressInsert } from '../types'

const findByUserIdPrepared = db
  .select()
  .from(addresses)
  .where(eq(addresses.userId, sql.placeholder('userId')))
  .orderBy(addresses.createdAt)
  .prepare('address_find_by_user_id')

const findByIdPrepared = db
  .select()
  .from(addresses)
  .where(
    and(
      eq(addresses.id, sql.placeholder('id')),
      eq(addresses.userId, sql.placeholder('userId')),
    ),
  )
  .prepare('address_find_by_id')

export async function findByUserId(userId: string) {
  return findByUserIdPrepared.execute({ userId })
}

export async function findById(id: string, userId: string) {
  const [address] = await findByIdPrepared.execute({ id, userId })
  return address ?? null
}

export async function create(data: AddressInsert) {
  const [address] = await db.insert(addresses).values(data).returning()
  return address
}

export async function update(
  id: string,
  userId: string,
  data: Partial<Omit<AddressInsert, 'id' | 'userId'>>,
) {
  const [address] = await db
    .update(addresses)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
    .returning()
  return address ?? null
}

export async function remove(id: string, userId: string) {
  const [deleted] = await db
    .delete(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
    .returning({ id: addresses.id })
  return !!deleted
}

export async function setDefault(id: string, userId: string) {
  // First unset all defaults for user
  await db
    .update(addresses)
    .set({ isDefault: false, updatedAt: new Date() })
    .where(eq(addresses.userId, userId))
  // Set the selected one as default
  const [address] = await db
    .update(addresses)
    .set({ isDefault: true, updatedAt: new Date() })
    .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
    .returning()
  return address ?? null
}

export async function countByUserId(userId: string) {
  const [result] = await db
    .select({ total: count() })
    .from(addresses)
    .where(eq(addresses.userId, userId))
  return result?.total ?? 0
}
