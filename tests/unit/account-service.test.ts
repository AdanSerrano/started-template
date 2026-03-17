import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock db with transaction support
vi.mock('@/lib/db', () => ({
  db: {
    transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn({})),
  },
}))

vi.mock('@/modules/account/repositories/address-repository', () => ({
  addressRepository: {
    findByUserId: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    setDefault: vi.fn(),
    countByUserId: vi.fn(),
  },
}))

vi.mock('@/modules/account/repositories/profile-repository', () => ({
  profileRepository: {
    findById: vi.fn(),
    update: vi.fn(),
  },
}))

import * as accountService from '@/modules/account/services/account-service'
import { addressRepository } from '@/modules/account/repositories/address-repository'
import { profileRepository } from '@/modules/account/repositories/profile-repository'

describe('AccountService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getProfile', () => {
    it('should return profile by userId', async () => {
      const mock = {
        id: 'u1',
        name: 'Test',
        email: 'test@test.com',
        phone: null,
        image: null,
        createdAt: new Date(),
      }
      vi.mocked(profileRepository.findById).mockResolvedValue(mock)

      const result = await accountService.getProfile('u1')

      expect(profileRepository.findById).toHaveBeenCalledWith('u1')
      expect(result).toEqual(mock)
    })
  })

  describe('createAddress', () => {
    it('should create and set default when isDefault is true', async () => {
      const mockAddr = { id: 'a1', userId: 'u1', isDefault: true }
      vi.mocked(addressRepository.create).mockResolvedValue(mockAddr as never)
      vi.mocked(addressRepository.setDefault).mockResolvedValue(
        mockAddr as never,
      )

      await accountService.createAddress({
        userId: 'u1',
        isDefault: true,
      } as never)

      expect(addressRepository.create).toHaveBeenCalled()
      // With transaction, tx is passed as third arg
      expect(addressRepository.setDefault).toHaveBeenCalledWith(
        'a1',
        'u1',
        expect.anything(),
      )
    })

    it('should not set default when isDefault is false', async () => {
      const mockAddr = { id: 'a2', userId: 'u1', isDefault: false }
      vi.mocked(addressRepository.create).mockResolvedValue(mockAddr as never)

      await accountService.createAddress({
        userId: 'u1',
        isDefault: false,
      } as never)

      expect(addressRepository.create).toHaveBeenCalled()
      expect(addressRepository.setDefault).not.toHaveBeenCalled()
    })
  })

  describe('deleteAddress', () => {
    it('should delegate to repository', async () => {
      vi.mocked(addressRepository.remove).mockResolvedValue(true)

      const result = await accountService.deleteAddress('a1', 'u1')

      expect(addressRepository.remove).toHaveBeenCalledWith('a1', 'u1')
      expect(result).toBe(true)
    })
  })
})
