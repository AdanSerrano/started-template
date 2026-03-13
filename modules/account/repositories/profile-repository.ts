import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import type { ProfileUpdateData } from '../types'

const findByIdPrepared = db
  .select({
    id: users.id,
    name: users.name,
    email: users.email,
    phone: users.phone,
    image: users.image,
    createdAt: users.createdAt,
  })
  .from(users)
  .where(eq(users.id, sql.placeholder('id')))
  .prepare('profile_find_by_id')

export async function findById(id: string) {
  const [user] = await findByIdPrepared.execute({ id })
  return user ?? null
}

export async function update(id: string, data: ProfileUpdateData) {
  const [user] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      name: users.name,
      phone: users.phone,
    })
  return user ?? null
}
