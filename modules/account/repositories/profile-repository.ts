import { eq, sql } from 'drizzle-orm'
import { users } from '@/db/schema'
import { db, type DbOrTx } from '@/lib/db'
import type { ProfileUpdateData } from '../types'

// ── Interface ───────────────────────────────────────────────

export interface IProfileRepository {
  findById(id: string): Promise<ProfileRow | null>
  update(
    id: string,
    data: ProfileUpdateData,
    tx?: DbOrTx,
  ): Promise<ProfileRow | null>
}

type ProfileRow = {
  id: string
  name: string
  email: string
  phone: string | null
  image: string | null
  createdAt: Date
}

// ── Prepared statements ─────────────────────────────────────

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

// ── Repository ──────────────────────────────────────────────

export const profileRepository: IProfileRepository = {
  async findById(id: string) {
    const [user] = await findByIdPrepared.execute({ id })
    return user ?? null
  },

  async update(id: string, data: ProfileUpdateData, tx?: DbOrTx) {
    const client = tx ?? db
    const [user] = await client
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        image: users.image,
        createdAt: users.createdAt,
      })
    return user ?? null
  },
}
