import { db } from '@/lib/db'
import * as schema from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

// ────────────────────────────────────────────────────────────
// Prepared statements — queries reutilizadas con parametros
// ────────────────────────────────────────────────────────────

const findIdByEmailQuery = db
  .select({ id: schema.users.id })
  .from(schema.users)
  .where(eq(schema.users.email, sql.placeholder('email')))
  .prepare('find_id_by_email')

const findIdByUsernameQuery = db
  .select({ id: schema.users.id })
  .from(schema.users)
  .where(eq(schema.users.username, sql.placeholder('username')))
  .prepare('find_id_by_username')

const getFailedLoginAttemptsQuery = db
  .select({ failedLoginAttempts: schema.users.failedLoginAttempts })
  .from(schema.users)
  .where(eq(schema.users.id, sql.placeholder('userId')))
  .prepare('get_failed_login_attempts')

const getLockedUntilQuery = db
  .select({ lockedUntil: schema.users.lockedUntil })
  .from(schema.users)
  .where(eq(schema.users.id, sql.placeholder('userId')))
  .prepare('get_locked_until')

// ────────────────────────────────────────────────────────────
// Repository
// ────────────────────────────────────────────────────────────

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
    const [user] = await findIdByEmailQuery.execute({
      email: email.toLowerCase().trim(),
    })

    return user?.id ?? null
  },

  async findIdByUsername(username: string): Promise<string | null> {
    const [user] = await findIdByUsernameQuery.execute({
      username: username.toLowerCase().trim(),
    })

    return user?.id ?? null
  },

  async getFailedLoginAttempts(userId: string): Promise<number | null> {
    const [user] = await getFailedLoginAttemptsQuery.execute({ userId })

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
    const [user] = await getLockedUntilQuery.execute({ userId })

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
