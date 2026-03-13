/**
 * Auth Security Service — Seguridad de autenticacion.
 *
 * Maneja:
 * - Tracking de intentos fallidos de login (via DB)
 * - Estado de bloqueo de cuentas
 * - Rate limiting en memoria (sliding window)
 */

import { userRepository } from '@/modules/auth/repositories'
import { checkRateLimit } from '@/lib/rate-limit'
import type { RateLimitResult } from '@/lib/interfaces'

// Constantes de configuracion
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
  checkLoginRateLimit(ip: string): Promise<RateLimitResult>
  checkRegisterRateLimit(ip: string): Promise<RateLimitResult>
  checkResetPasswordRateLimit(email: string): Promise<RateLimitResult>
  checkMagicLinkRateLimit(email: string): Promise<RateLimitResult>
}

// Rate limit configurations
const RATE_LIMITS = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 min
  register: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  resetPassword: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  magicLink: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
} as const

class AuthSecurityServiceImpl implements AuthSecurityService {
  async recordFailedLogin(
    userId: string,
  ): Promise<{ locked: boolean; attempts: number }> {
    const currentAttempts = await userRepository.getFailedLoginAttempts(userId)
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

  async checkLoginRateLimit(ip: string): Promise<RateLimitResult> {
    return checkRateLimit(`login:${ip}`, RATE_LIMITS.login)
  }

  async checkRegisterRateLimit(ip: string): Promise<RateLimitResult> {
    return checkRateLimit(`register:${ip}`, RATE_LIMITS.register)
  }

  async checkResetPasswordRateLimit(email: string): Promise<RateLimitResult> {
    return checkRateLimit(`reset:${email}`, RATE_LIMITS.resetPassword)
  }

  async checkMagicLinkRateLimit(email: string): Promise<RateLimitResult> {
    return checkRateLimit(`magic:${email}`, RATE_LIMITS.magicLink)
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
