import { eq, and, count, sql } from 'drizzle-orm'
import { addresses } from '@/db/schema'
import { db, type DbOrTx } from '@/lib/db'
import { notDeleted } from '@/lib/query-helpers'
import type { Address, AddressInsert } from '../types'

// ── Interface ───────────────────────────────────────────────

export interface IAddressRepository {
  findByUserId(userId: string): Promise<Address[]>
  findById(id: string, userId: string): Promise<Address | null>
  create(data: AddressInsert, tx?: DbOrTx): Promise<Address>
  update(
    id: string,
    userId: string,
    data: Partial<Omit<AddressInsert, 'id' | 'userId'>>,
    tx?: DbOrTx,
  ): Promise<Address | null>
  remove(id: string, userId: string, tx?: DbOrTx): Promise<boolean>
  setDefault(id: string, userId: string, tx?: DbOrTx): Promise<Address | null>
  countByUserId(userId: string): Promise<number>
}

// ── Prepared statements ─────────────────────────────────────

const findByUserIdPrepared = db
  .select()
  .from(addresses)
  .where(
    and(
      eq(addresses.userId, sql.placeholder('userId')),
      notDeleted(addresses.deletedAt),
    ),
  )
  .orderBy(addresses.createdAt)
  .prepare('address_find_by_user_id')

const findByIdPrepared = db
  .select()
  .from(addresses)
  .where(
    and(
      eq(addresses.id, sql.placeholder('id')),
      eq(addresses.userId, sql.placeholder('userId')),
      notDeleted(addresses.deletedAt),
    ),
  )
  .prepare('address_find_by_id')

// ── Repository ──────────────────────────────────────────────

export const addressRepository: IAddressRepository = {
  async findByUserId(userId: string) {
    return findByUserIdPrepared.execute({ userId })
  },

  async findById(id: string, userId: string) {
    const [address] = await findByIdPrepared.execute({ id, userId })
    return address ?? null
  },

  async create(data: AddressInsert, tx?: DbOrTx) {
    const client = tx ?? db
    const [address] = await client.insert(addresses).values(data).returning()
    return address!
  },

  async update(
    id: string,
    userId: string,
    data: Partial<Omit<AddressInsert, 'id' | 'userId'>>,
    tx?: DbOrTx,
  ) {
    const client = tx ?? db
    const [address] = await client
      .update(addresses)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(addresses.id, id),
          eq(addresses.userId, userId),
          notDeleted(addresses.deletedAt),
        ),
      )
      .returning()
    return address ?? null
  },

  async remove(id: string, userId: string, tx?: DbOrTx) {
    const client = tx ?? db
    const [deleted] = await client
      .update(addresses)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(addresses.id, id),
          eq(addresses.userId, userId),
          notDeleted(addresses.deletedAt),
        ),
      )
      .returning({ id: addresses.id })
    return !!deleted
  },

  async setDefault(id: string, userId: string, tx?: DbOrTx) {
    const run = async (client: DbOrTx) => {
      // Unset all defaults for user (only non-deleted)
      await client
        .update(addresses)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(
          and(eq(addresses.userId, userId), notDeleted(addresses.deletedAt)),
        )
      // Set the selected one as default
      const [address] = await client
        .update(addresses)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(
          and(
            eq(addresses.id, id),
            eq(addresses.userId, userId),
            notDeleted(addresses.deletedAt),
          ),
        )
        .returning()
      return address ?? null
    }

    // If already inside a transaction, reuse it; otherwise wrap in one
    if (tx) return run(tx)
    return db.transaction(async (newTx) => run(newTx))
  },

  async countByUserId(userId: string) {
    const [result] = await db
      .select({ total: count() })
      .from(addresses)
      .where(and(eq(addresses.userId, userId), notDeleted(addresses.deletedAt)))
    return result?.total ?? 0
  },
}
