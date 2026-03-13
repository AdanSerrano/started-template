import { db } from '@/lib/db'
import * as schema from '@/db/schema'
import { eq } from 'drizzle-orm'

export interface IUserRepository {
  findIdByEmail(email: string): Promise<string | null>
  findIdByUsername(username: string): Promise<string | null>
  getFailedLoginAttempts(userId: string): Promise<number | null>
  updateFailedLoginAttempts(
    userId: string,
    attempts: number,
    lockedUntil?: Date | null,
  ): Promise<void>
  resetFailedLogin(userId: string): Promise<void>
  getLockedUntil(userId: string): Promise<Date | null>
  softDelete(userId: string, deletedByUserId: string): Promise<void>
  restore(userId: string): Promise<void>
}

export const userRepository: IUserRepository = {
  async findIdByEmail(email: string): Promise<string | null> {
    const [user] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase().trim()))

    return user?.id ?? null
  },

  async findIdByUsername(username: string): Promise<string | null> {
    const [user] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.username, username.toLowerCase().trim()))

    return user?.id ?? null
  },

  async getFailedLoginAttempts(userId: string): Promise<number | null> {
    const [user] = await db
      .select({
        failedLoginAttempts: schema.users.failedLoginAttempts,
      })
      .from(schema.users)
      .where(eq(schema.users.id, userId))

    return user?.failedLoginAttempts ?? null
  },

  async updateFailedLoginAttempts(
    userId: string,
    attempts: number,
    lockedUntil?: Date | null,
  ): Promise<void> {
    const updates: Partial<typeof schema.users.$inferInsert> = {
      failedLoginAttempts: attempts,
      updatedAt: new Date(),
    }

    if (lockedUntil !== undefined) {
      updates.lockedUntil = lockedUntil
    }

    await db
      .update(schema.users)
      .set(updates)
      .where(eq(schema.users.id, userId))
  },

  async resetFailedLogin(userId: string): Promise<void> {
    await db
      .update(schema.users)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId))
  },

  async getLockedUntil(userId: string): Promise<Date | null> {
    const [user] = await db
      .select({
        lockedUntil: schema.users.lockedUntil,
      })
      .from(schema.users)
      .where(eq(schema.users.id, userId))

    return user?.lockedUntil ?? null
  },

  async softDelete(userId: string, deletedByUserId: string): Promise<void> {
    await db
      .update(schema.users)
      .set({
        deletedAt: new Date(),
        deletedBy: deletedByUserId,
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId))
  },

  async restore(userId: string): Promise<void> {
    await db
      .update(schema.users)
      .set({
        deletedAt: null,
        deletedBy: null,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId))
  },
}
