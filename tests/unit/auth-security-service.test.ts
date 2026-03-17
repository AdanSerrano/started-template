import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { userRepository } from '@/modules/auth/repositories'
import {
  getAuthSecurityService,
  resetAuthSecurityInstance,
} from '@/modules/auth/services/auth-security-service'
import type { AuthSecurityService } from '@/modules/auth/services/auth-security-service'

vi.mock('@/modules/auth/repositories', () => ({
  userRepository: {
    getFailedLoginAttempts: vi.fn(),
    updateFailedLoginAttempts: vi.fn(),
    resetFailedLogin: vi.fn(),
    getLockedUntil: vi.fn(),
  },
}))

const LOCK_THRESHOLD = 5
const LOCK_DURATION_SECONDS = 15 * 60

describe('AuthSecurityService', () => {
  let service: AuthSecurityService

  beforeEach(() => {
    vi.clearAllMocks()
    resetAuthSecurityInstance()
    service = getAuthSecurityService()
  })

  afterEach(() => {
    resetAuthSecurityInstance()
  })

  describe('recordFailedLogin', () => {
    it('should increment failed attempts from 0', async () => {
      vi.mocked(userRepository.getFailedLoginAttempts).mockResolvedValue(0)
      vi.mocked(userRepository.updateFailedLoginAttempts).mockResolvedValue(
        undefined,
      )

      const result = await service.recordFailedLogin('u1')

      expect(userRepository.getFailedLoginAttempts).toHaveBeenCalledWith('u1')
      expect(userRepository.updateFailedLoginAttempts).toHaveBeenCalledWith(
        'u1',
        1,
        null,
      )
      expect(result).toEqual({ locked: false, attempts: 1 })
    })

    it('should increment failed attempts from existing count', async () => {
      vi.mocked(userRepository.getFailedLoginAttempts).mockResolvedValue(3)
      vi.mocked(userRepository.updateFailedLoginAttempts).mockResolvedValue(
        undefined,
      )

      const result = await service.recordFailedLogin('u1')

      expect(userRepository.updateFailedLoginAttempts).toHaveBeenCalledWith(
        'u1',
        4,
        null,
      )
      expect(result).toEqual({ locked: false, attempts: 4 })
    })

    it('should handle null from getFailedLoginAttempts as 0', async () => {
      vi.mocked(userRepository.getFailedLoginAttempts).mockResolvedValue(null)
      vi.mocked(userRepository.updateFailedLoginAttempts).mockResolvedValue(
        undefined,
      )

      const result = await service.recordFailedLogin('u1')

      expect(userRepository.updateFailedLoginAttempts).toHaveBeenCalledWith(
        'u1',
        1,
        null,
      )
      expect(result).toEqual({ locked: false, attempts: 1 })
    })

    it('should lock account at threshold (5 attempts)', async () => {
      vi.mocked(userRepository.getFailedLoginAttempts).mockResolvedValue(4)
      vi.mocked(userRepository.updateFailedLoginAttempts).mockResolvedValue(
        undefined,
      )

      const before = Date.now()
      const result = await service.recordFailedLogin('u1')
      const after = Date.now()

      expect(result).toEqual({ locked: true, attempts: 5 })

      const call = vi.mocked(userRepository.updateFailedLoginAttempts).mock
        .calls[0]
      expect(call[0]).toBe('u1')
      expect(call[1]).toBe(5)

      const lockedUntil = call[2] as Date
      expect(lockedUntil).toBeInstanceOf(Date)
      const expectedMin = before + LOCK_DURATION_SECONDS * 1000
      const expectedMax = after + LOCK_DURATION_SECONDS * 1000
      expect(lockedUntil.getTime()).toBeGreaterThanOrEqual(expectedMin)
      expect(lockedUntil.getTime()).toBeLessThanOrEqual(expectedMax)
    })

    it('should lock account when exceeding threshold', async () => {
      vi.mocked(userRepository.getFailedLoginAttempts).mockResolvedValue(6)
      vi.mocked(userRepository.updateFailedLoginAttempts).mockResolvedValue(
        undefined,
      )

      const result = await service.recordFailedLogin('u1')

      expect(result).toEqual({ locked: true, attempts: 7 })

      const call = vi.mocked(userRepository.updateFailedLoginAttempts).mock
        .calls[0]
      expect(call[2]).toBeInstanceOf(Date)
    })

    it('should not lock at 4 attempts (one below threshold)', async () => {
      vi.mocked(userRepository.getFailedLoginAttempts).mockResolvedValue(3)
      vi.mocked(userRepository.updateFailedLoginAttempts).mockResolvedValue(
        undefined,
      )

      const result = await service.recordFailedLogin('u1')

      expect(result).toEqual({ locked: false, attempts: 4 })
      expect(userRepository.updateFailedLoginAttempts).toHaveBeenCalledWith(
        'u1',
        4,
        null,
      )
    })
  })

  describe('getFailedAttempts', () => {
    it('should return current count', async () => {
      vi.mocked(userRepository.getFailedLoginAttempts).mockResolvedValue(3)

      const result = await service.getFailedAttempts('u1')

      expect(userRepository.getFailedLoginAttempts).toHaveBeenCalledWith('u1')
      expect(result).toBe(3)
    })

    it('should return 0 when repository returns null', async () => {
      vi.mocked(userRepository.getFailedLoginAttempts).mockResolvedValue(null)

      const result = await service.getFailedAttempts('u1')

      expect(result).toBe(0)
    })

    it('should return 0 when repository returns 0', async () => {
      vi.mocked(userRepository.getFailedLoginAttempts).mockResolvedValue(0)

      const result = await service.getFailedAttempts('u1')

      expect(result).toBe(0)
    })
  })

  describe('resetFailedAttempts', () => {
    it('should delegate to repository resetFailedLogin', async () => {
      vi.mocked(userRepository.resetFailedLogin).mockResolvedValue(undefined)

      await service.resetFailedAttempts('u1')

      expect(userRepository.resetFailedLogin).toHaveBeenCalledWith('u1')
    })
  })

  describe('checkLockStatus', () => {
    it('should return unlocked when lockedUntil is null', async () => {
      vi.mocked(userRepository.getLockedUntil).mockResolvedValue(null)

      const result = await service.checkLockStatus('u1')

      expect(userRepository.getLockedUntil).toHaveBeenCalledWith('u1')
      expect(result).toEqual({
        locked: false,
        expiresAt: null,
        minutesRemaining: 0,
      })
    })

    it('should return unlocked when lock has expired', async () => {
      const pastDate = new Date(Date.now() - 60000)
      vi.mocked(userRepository.getLockedUntil).mockResolvedValue(pastDate)

      const result = await service.checkLockStatus('u1')

      expect(result).toEqual({
        locked: false,
        expiresAt: null,
        minutesRemaining: 0,
      })
    })

    it('should return unlocked when lockedUntil is exactly now', async () => {
      const now = new Date()
      vi.mocked(userRepository.getLockedUntil).mockResolvedValue(now)

      const result = await service.checkLockStatus('u1')

      expect(result.locked).toBe(false)
    })

    it('should return locked with minutes remaining for future lock', async () => {
      const futureDate = new Date(Date.now() + 10 * 60000) // 10 min from now
      vi.mocked(userRepository.getLockedUntil).mockResolvedValue(futureDate)

      const result = await service.checkLockStatus('u1')

      expect(result.locked).toBe(true)
      expect(result.expiresAt).toEqual(futureDate)
      expect(result.minutesRemaining).toBeGreaterThanOrEqual(9)
      expect(result.minutesRemaining).toBeLessThanOrEqual(10)
    })

    it('should ceil minutes remaining (e.g. 30 seconds = 1 minute)', async () => {
      const futureDate = new Date(Date.now() + 30000) // 30 seconds from now
      vi.mocked(userRepository.getLockedUntil).mockResolvedValue(futureDate)

      const result = await service.checkLockStatus('u1')

      expect(result.locked).toBe(true)
      expect(result.minutesRemaining).toBe(1)
    })

    it('should return 0 minutesRemaining minimum (never negative)', async () => {
      // Edge case: lock expires between getLockedUntil and calculation
      const barelyFuture = new Date(Date.now() + 1)
      vi.mocked(userRepository.getLockedUntil).mockResolvedValue(barelyFuture)

      const result = await service.checkLockStatus('u1')

      // Could be locked or unlocked depending on timing, but minutes should never be negative
      expect(result.minutesRemaining).toBeGreaterThanOrEqual(0)
    })

    it('should return full lock duration for freshly locked account', async () => {
      const futureDate = new Date(Date.now() + LOCK_DURATION_SECONDS * 1000)
      vi.mocked(userRepository.getLockedUntil).mockResolvedValue(futureDate)

      const result = await service.checkLockStatus('u1')

      expect(result.locked).toBe(true)
      expect(result.minutesRemaining).toBeLessThanOrEqual(15)
      expect(result.minutesRemaining).toBeGreaterThanOrEqual(14)
    })
  })

  describe('isAccountLocked', () => {
    it('should return true when account is locked', async () => {
      const futureDate = new Date(Date.now() + 10 * 60000)
      vi.mocked(userRepository.getLockedUntil).mockResolvedValue(futureDate)

      const result = await service.isAccountLocked('u1')

      expect(result).toBe(true)
    })

    it('should return false when account is not locked', async () => {
      vi.mocked(userRepository.getLockedUntil).mockResolvedValue(null)

      const result = await service.isAccountLocked('u1')

      expect(result).toBe(false)
    })

    it('should return false when lock has expired', async () => {
      const pastDate = new Date(Date.now() - 60000)
      vi.mocked(userRepository.getLockedUntil).mockResolvedValue(pastDate)

      const result = await service.isAccountLocked('u1')

      expect(result).toBe(false)
    })
  })

  describe('lockAccount', () => {
    it('should lock with threshold attempts and future expiry', async () => {
      vi.mocked(userRepository.updateFailedLoginAttempts).mockResolvedValue(
        undefined,
      )

      const before = Date.now()
      await service.lockAccount('u1')
      const after = Date.now()

      expect(userRepository.updateFailedLoginAttempts).toHaveBeenCalledTimes(1)

      const call = vi.mocked(userRepository.updateFailedLoginAttempts).mock
        .calls[0]
      expect(call[0]).toBe('u1')
      expect(call[1]).toBe(LOCK_THRESHOLD)

      const lockedUntil = call[2] as Date
      expect(lockedUntil).toBeInstanceOf(Date)
      expect(lockedUntil.getTime()).toBeGreaterThanOrEqual(
        before + LOCK_DURATION_SECONDS * 1000,
      )
      expect(lockedUntil.getTime()).toBeLessThanOrEqual(
        after + LOCK_DURATION_SECONDS * 1000,
      )
    })
  })

  describe('unlockAccount', () => {
    it('should delegate to repository resetFailedLogin', async () => {
      vi.mocked(userRepository.resetFailedLogin).mockResolvedValue(undefined)

      await service.unlockAccount('u1')

      expect(userRepository.resetFailedLogin).toHaveBeenCalledWith('u1')
    })
  })

  describe('getLockExpiry', () => {
    it('should return expiry date from repository', async () => {
      const futureDate = new Date(Date.now() + 10 * 60000)
      vi.mocked(userRepository.getLockedUntil).mockResolvedValue(futureDate)

      const result = await service.getLockExpiry('u1')

      expect(userRepository.getLockedUntil).toHaveBeenCalledWith('u1')
      expect(result).toEqual(futureDate)
    })

    it('should return null when no lock exists', async () => {
      vi.mocked(userRepository.getLockedUntil).mockResolvedValue(null)

      const result = await service.getLockExpiry('u1')

      expect(result).toBeNull()
    })
  })

  describe('singleton management', () => {
    it('should return same instance on multiple calls', () => {
      const instance1 = getAuthSecurityService()
      const instance2 = getAuthSecurityService()

      expect(instance1).toBe(instance2)
    })

    it('should return new instance after reset', () => {
      const instance1 = getAuthSecurityService()
      resetAuthSecurityInstance()
      const instance2 = getAuthSecurityService()

      expect(instance1).not.toBe(instance2)
    })
  })
})
