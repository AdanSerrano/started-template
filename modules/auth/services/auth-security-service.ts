/**
 * Auth Security Service — Seguridad de autenticacion.
 *
 * Maneja:
 * - Tracking de intentos fallidos de login (via DB)
 * - Estado de bloqueo de cuentas
 *
 * Rate limiting ahora lo maneja Better Auth built-in (config en lib/auth.ts).
 */

import { userRepository } from '@/modules/auth/repositories'

const LOCK_THRESHOLD = 5
const LOCK_DURATION_SECONDS = 15 * 60

export interface LockStatus {
  locked: boolean
  expiresAt: Date | null
  minutesRemaining: number
}

export interface AuthSecurityService {
  recordFailedLogin(
    userId: string,
  ): Promise<{ locked: boolean; attempts: number }>
  getFailedAttempts(userId: string): Promise<number>
  resetFailedAttempts(userId: string): Promise<void>
  checkLockStatus(userId: string): Promise<LockStatus>
  isAccountLocked(userId: string): Promise<boolean>
  lockAccount(userId: string): Promise<void>
  unlockAccount(userId: string): Promise<void>
  getLockExpiry(userId: string): Promise<Date | null>
}

class AuthSecurityServiceImpl implements AuthSecurityService {
  async recordFailedLogin(
    userId: string,
  ): Promise<{ locked: boolean; attempts: number }> {
    // Si el bloqueo anterior ya expiró, el contador arranca de cero: sin esto
    // un único fallo tras la expiración re-bloquea la cuenta (contador que
    // solo bajaba con login exitoso o unlock manual).
    const lockedUntil = await userRepository.getLockedUntil(userId)
    const lockExpired = lockedUntil !== null && lockedUntil <= new Date()
    const currentAttempts = lockExpired
      ? 0
      : await userRepository.getFailedLoginAttempts(userId)
    const attempts = (currentAttempts ?? 0) + 1

    if (attempts >= LOCK_THRESHOLD) {
      const lockedUntil = new Date(Date.now() + LOCK_DURATION_SECONDS * 1000)
      await userRepository.updateFailedLoginAttempts(
        userId,
        attempts,
        lockedUntil,
      )
      return { locked: true, attempts }
    }

    await userRepository.updateFailedLoginAttempts(userId, attempts, null)
    return { locked: false, attempts }
  }

  async getFailedAttempts(userId: string): Promise<number> {
    return (await userRepository.getFailedLoginAttempts(userId)) ?? 0
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    await userRepository.resetFailedLogin(userId)
  }

  async checkLockStatus(userId: string): Promise<LockStatus> {
    const lockedUntil = await userRepository.getLockedUntil(userId)

    if (!lockedUntil || lockedUntil <= new Date()) {
      return { locked: false, expiresAt: null, minutesRemaining: 0 }
    }

    const minutesRemaining = Math.max(
      0,
      Math.ceil((lockedUntil.getTime() - Date.now()) / 60000),
    )

    return { locked: true, expiresAt: lockedUntil, minutesRemaining }
  }

  async isAccountLocked(userId: string): Promise<boolean> {
    const status = await this.checkLockStatus(userId)
    return status.locked
  }

  async lockAccount(userId: string): Promise<void> {
    const lockedUntil = new Date(Date.now() + LOCK_DURATION_SECONDS * 1000)
    await userRepository.updateFailedLoginAttempts(
      userId,
      LOCK_THRESHOLD,
      lockedUntil,
    )
  }

  async unlockAccount(userId: string): Promise<void> {
    await userRepository.resetFailedLogin(userId)
  }

  async getLockExpiry(userId: string): Promise<Date | null> {
    return userRepository.getLockedUntil(userId)
  }
}

let instance: AuthSecurityService | null = null

export function getAuthSecurityService(): AuthSecurityService {
  if (!instance) {
    instance = new AuthSecurityServiceImpl()
  }
  return instance
}

export function setAuthSecurityInstance(service: AuthSecurityService): void {
  instance = service
}

export function resetAuthSecurityInstance(): void {
  instance = null
}

export const authSecurityService = {
  get instance() {
    return getAuthSecurityService()
  },
}
