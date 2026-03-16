import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth-server', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/modules/auth/repositories', () => ({
  userRepository: {
    softDelete: vi.fn(),
    restore: vi.fn(),
  },
}))

vi.mock('@/modules/auth/services/auth-security-service', () => ({
  getAuthSecurityService: vi.fn(),
}))

import { authService } from '@/modules/auth/services/auth-service'
import { getServerSession } from '@/lib/auth-server'
import { userRepository } from '@/modules/auth/repositories'
import { getAuthSecurityService } from '@/modules/auth/services/auth-security-service'
import { UnauthorizedError, ForbiddenError } from '@/lib/errors'
import type { AuthSession } from '@/modules/auth/types'

const mockSession: AuthSession = {
  user: {
    id: 'u1',
    name: 'Test User',
    email: 'test@example.com',
    image: null,
    role: 'user',
    isActive: true,
    username: 'testuser',
    displayUsername: 'TestUser',
    twoFactorEnabled: false,
    banned: false,
    banReason: null,
    banExpires: null,
    failedLoginAttempts: 0,
    lockedUntil: null,
    deletedAt: null,
  },
  session: {
    id: 's1',
    userId: 'u1',
    token: 'token123',
    expiresAt: new Date('2030-01-01'),
    impersonatedBy: null,
  },
}

const mockSecurityService = {
  recordFailedLogin: vi.fn(),
  getFailedAttempts: vi.fn(),
  resetFailedAttempts: vi.fn(),
  checkLockStatus: vi.fn(),
  isAccountLocked: vi.fn(),
  lockAccount: vi.fn(),
  unlockAccount: vi.fn(),
  getLockExpiry: vi.fn(),
}

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAuthSecurityService).mockReturnValue(mockSecurityService)
  })

  describe('getSession', () => {
    it('should return session when authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession)

      const result = await authService.getSession()

      expect(getServerSession).toHaveBeenCalled()
      expect(result).toEqual(mockSession)
    })

    it('should return null when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const result = await authService.getSession()

      expect(result).toBeNull()
    })
  })

  describe('requireAuth', () => {
    it('should return session when authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession)

      const result = await authService.requireAuth()

      expect(result).toEqual(mockSession)
    })

    it('should throw UnauthorizedError when no session', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      await expect(authService.requireAuth()).rejects.toThrow(UnauthorizedError)
    })
  })

  describe('requireRole', () => {
    it('should return session when role matches', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession)

      const result = await authService.requireRole('user')

      expect(result).toEqual(mockSession)
    })

    it('should accept multiple roles', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession)

      const result = await authService.requireRole('admin', 'user')

      expect(result).toEqual(mockSession)
    })

    it('should throw ForbiddenError when role does not match', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession)

      await expect(authService.requireRole('admin')).rejects.toThrow(
        ForbiddenError,
      )
    })

    it('should throw UnauthorizedError when no session', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      await expect(authService.requireRole('user')).rejects.toThrow(
        UnauthorizedError,
      )
    })

    it('should allow super_admin role', async () => {
      const adminSession = {
        ...mockSession,
        user: { ...mockSession.user, role: 'super_admin' as const },
      }
      vi.mocked(getServerSession).mockResolvedValue(adminSession)

      const result = await authService.requireRole('super_admin')

      expect(result).toEqual(adminSession)
    })
  })

  describe('recordFailedLogin', () => {
    it('should delegate to security service', async () => {
      mockSecurityService.recordFailedLogin.mockResolvedValue({
        locked: false,
        attempts: 1,
      })

      const result = await authService.recordFailedLogin('u1')

      expect(getAuthSecurityService).toHaveBeenCalled()
      expect(mockSecurityService.recordFailedLogin).toHaveBeenCalledWith('u1')
      expect(result).toEqual({ locked: false, attempts: 1 })
    })

    it('should return locked status when threshold reached', async () => {
      mockSecurityService.recordFailedLogin.mockResolvedValue({
        locked: true,
        attempts: 5,
      })

      const result = await authService.recordFailedLogin('u1')

      expect(result).toEqual({ locked: true, attempts: 5 })
    })
  })

  describe('resetFailedLogin', () => {
    it('should delegate to security service', async () => {
      mockSecurityService.resetFailedAttempts.mockResolvedValue(undefined)

      await authService.resetFailedLogin('u1')

      expect(mockSecurityService.resetFailedAttempts).toHaveBeenCalledWith('u1')
    })
  })

  describe('isAccountLocked', () => {
    it('should return true when account is locked', async () => {
      mockSecurityService.isAccountLocked.mockResolvedValue(true)

      const result = await authService.isAccountLocked('u1')

      expect(result).toBe(true)
    })

    it('should return false when account is not locked', async () => {
      mockSecurityService.isAccountLocked.mockResolvedValue(false)

      const result = await authService.isAccountLocked('u1')

      expect(result).toBe(false)
    })
  })

  describe('getLockExpiry', () => {
    it('should return expiry date when locked', async () => {
      const expiry = new Date('2030-01-01')
      mockSecurityService.getLockExpiry.mockResolvedValue(expiry)

      const result = await authService.getLockExpiry('u1')

      expect(result).toEqual(expiry)
    })

    it('should return null when not locked', async () => {
      mockSecurityService.getLockExpiry.mockResolvedValue(null)

      const result = await authService.getLockExpiry('u1')

      expect(result).toBeNull()
    })
  })

  describe('unlockAccount', () => {
    it('should delegate to security service', async () => {
      mockSecurityService.unlockAccount.mockResolvedValue(undefined)

      await authService.unlockAccount('u1')

      expect(mockSecurityService.unlockAccount).toHaveBeenCalledWith('u1')
    })
  })

  describe('softDeleteUser', () => {
    it('should delegate to userRepository', async () => {
      vi.mocked(userRepository.softDelete).mockResolvedValue(undefined)

      await authService.softDeleteUser('u1', 'admin1')

      expect(userRepository.softDelete).toHaveBeenCalledWith('u1', 'admin1')
    })
  })

  describe('restoreUser', () => {
    it('should delegate to userRepository', async () => {
      vi.mocked(userRepository.restore).mockResolvedValue(undefined)

      await authService.restoreUser('u1')

      expect(userRepository.restore).toHaveBeenCalledWith('u1')
    })
  })
})
