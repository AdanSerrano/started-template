import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { DEFAULT_LOGOUT_REDIRECT } from '@/routes'
import { UnauthorizedError, ForbiddenError } from '@/lib/errors'
import { userRepository } from '@/modules/auth/repositories'
import { getAuthSecurityService } from './auth-security-service'
import type { AuthSession } from '@/modules/auth/types'

export const authService = {
  /**
   * Get current session or null if not authenticated.
   * Use in Server Components and Server Actions.
   */
  async getSession(): Promise<AuthSession | null> {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    return session as AuthSession | null
  },

  /**
   * Require authenticated user. Throws UnauthorizedError if no session.
   * Use in Server Actions and protected Server Components.
   */
  async requireAuth(): Promise<AuthSession> {
    const session = await this.getSession()

    if (!session) {
      throw new UnauthorizedError()
    }

    return session
  },

  /**
   * Require authenticated user with specific role.
   * Throws ForbiddenError if role doesn't match.
   */
  async requireRole(
    ...roles: Array<'super_admin' | 'admin' | 'user'>
  ): Promise<AuthSession> {
    const session = await this.requireAuth()

    if (!roles.includes(session.user.role)) {
      throw new ForbiddenError('No tienes permisos para realizar esta accion')
    }

    return session
  },

  /**
   * Redirect to login if not authenticated.
   * Use in Server Components that should redirect.
   */
  async requireAuthOrRedirect(): Promise<AuthSession> {
    const session = await this.getSession()

    if (!session) {
      redirect(DEFAULT_LOGOUT_REDIRECT)
    }

    return session
  },

  /**
   * Record a failed login attempt for a user.
   * Uses Redis for fast tracking (3-5ms vs 50-100ms DB).
   * Locks the account if threshold is reached.
   */
  async recordFailedLogin(
    userId: string,
  ): Promise<{ locked: boolean; attempts: number }> {
    const security = getAuthSecurityService()
    return security.recordFailedLogin(userId)
  },

  /**
   * Reset failed login counter and update lastLoginAt.
   * Clears Redis cache and syncs with DB.
   */
  async resetFailedLogin(userId: string): Promise<void> {
    const security = getAuthSecurityService()
    await security.resetFailedAttempts(userId)
  },

  /**
   * Check if an account is currently locked.
   * Uses Redis cache (3ms) with DB fallback.
   */
  async isAccountLocked(userId: string): Promise<boolean> {
    const security = getAuthSecurityService()
    return security.isAccountLocked(userId)
  },

  /**
   * Get the lock expiry date for an account.
   */
  async getLockExpiry(userId: string): Promise<Date | null> {
    const security = getAuthSecurityService()
    return security.getLockExpiry(userId)
  },

  /**
   * Manually unlock an account.
   */
  async unlockAccount(userId: string): Promise<void> {
    const security = getAuthSecurityService()
    await security.unlockAccount(userId)
  },

  /**
   * Soft delete a user account.
   */
  async softDeleteUser(userId: string, deletedByUserId: string): Promise<void> {
    await userRepository.softDelete(userId, deletedByUserId)
  },

  /**
   * Restore a soft-deleted user account.
   */
  async restoreUser(userId: string): Promise<void> {
    await userRepository.restore(userId)
  },
}
