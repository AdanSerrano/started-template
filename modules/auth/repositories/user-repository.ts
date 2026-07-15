import { eq, sql } from 'drizzle-orm'
import * as schema from '@/db/schema'
import { db, type DbOrTx } from '@/lib/db'

// ── Prepared statements ─────────────────────────────────────

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

// ── Interface ───────────────────────────────────────────────

export interface IUserRepository {
  findIdByEmail(email: string): Promise<string | null>
  findIdByUsername(username: string): Promise<string | null>
  getFailedLoginAttempts(userId: string): Promise<number | null>
  updateFailedLoginAttempts(
    userId: string,
    attempts: number,
    lockedUntil?: Date | null,
    tx?: DbOrTx,
  ): Promise<void>
  resetFailedLogin(userId: string, tx?: DbOrTx): Promise<void>
  getLockedUntil(userId: string): Promise<Date | null>
  softDelete(
    userId: string,
    deletedByUserId: string,
    tx?: DbOrTx,
  ): Promise<void>
  restore(userId: string, tx?: DbOrTx): Promise<void>
}

// ── Repository ──────────────────────────────────────────────

export const userRepository: IUserRepository = {
  async findIdByEmail(email: string) {
    const [user] = await findIdByEmailQuery.execute({
      email: email.toLowerCase().trim(),
    })
    return user?.id ?? null
  },

  async findIdByUsername(username: string) {
    const [user] = await findIdByUsernameQuery.execute({
      username: username.toLowerCase().trim(),
    })
    return user?.id ?? null
  },

  async getFailedLoginAttempts(userId: string) {
    const [user] = await getFailedLoginAttemptsQuery.execute({ userId })
    return user?.failedLoginAttempts ?? null
  },

  async updateFailedLoginAttempts(
    userId: string,
    attempts: number,
    lockedUntil?: Date | null,
    tx?: DbOrTx,
  ) {
    const client = tx ?? db
    const updates: Partial<typeof schema.users.$inferInsert> = {
      failedLoginAttempts: attempts,
      updatedAt: new Date(),
    }
    if (lockedUntil !== undefined) {
      updates.lockedUntil = lockedUntil
    }
    await client
      .update(schema.users)
      .set(updates)
      .where(eq(schema.users.id, userId))
  },

  async resetFailedLogin(userId: string, tx?: DbOrTx) {
    const client = tx ?? db
    await client
      .update(schema.users)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId))
  },

  async getLockedUntil(userId: string) {
    const [user] = await getLockedUntilQuery.execute({ userId })
    return user?.lockedUntil ?? null
  },

  async softDelete(userId: string, deletedByUserId: string, tx?: DbOrTx) {
    const client = tx ?? db
    await client
      .update(schema.users)
      .set({
        deletedAt: new Date(),
        deletedBy: deletedByUserId,
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId))

    // Revocar sesiones activas: sin esto el usuario borrado sigue autenticado
    // hasta 7 días (el hook solo valida al CREAR sesión, no las existentes).
    // Queda una ventana ≤2min por el cookieCache de Better Auth (auth.ts).
    await client
      .delete(schema.sessions)
      .where(eq(schema.sessions.userId, userId))
  },

  async restore(userId: string, tx?: DbOrTx) {
    const client = tx ?? db
    await client
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
