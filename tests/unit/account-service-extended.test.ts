/**
 * Extended tests for account-service — covers updateAddress, setDefaultAddress,
 * getAddress, and getAddresses to improve service coverage.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockAddress } from '../factories/address.factory'

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

describe('AccountService — Extended', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAddresses', () => {
    it('returns all addresses for user', async () => {
      const mockAddrs = [createMockAddress(), createMockAddress()]
      vi.mocked(addressRepository.findByUserId).mockResolvedValue(
        mockAddrs as never,
      )

      const result = await accountService.getAddresses('u1')

      expect(addressRepository.findByUserId).toHaveBeenCalledWith('u1')
      expect(result).toHaveLength(2)
    })
  })

  describe('getAddress', () => {
    it('returns address by id and userId', async () => {
      const mockAddr = createMockAddress({ id: 'a1' })
      vi.mocked(addressRepository.findById).mockResolvedValue(mockAddr as never)

      const result = await accountService.getAddress('a1', 'u1')

      expect(addressRepository.findById).toHaveBeenCalledWith('a1', 'u1')
      expect(result).toEqual(mockAddr)
    })

    it('returns null when address not found', async () => {
      vi.mocked(addressRepository.findById).mockResolvedValue(null)

      const result = await accountService.getAddress('nonexistent', 'u1')

      expect(result).toBeNull()
    })
  })

  describe('updateAddress', () => {
    it('calls setDefault when isDefault is true', async () => {
      vi.mocked(addressRepository.setDefault).mockResolvedValue(null)
      vi.mocked(addressRepository.update).mockResolvedValue(
        createMockAddress({ id: 'a1', isDefault: true }) as never,
      )

      await accountService.updateAddress('a1', 'u1', { isDefault: true })

      expect(addressRepository.setDefault).toHaveBeenCalledWith('a1', 'u1')
      expect(addressRepository.update).toHaveBeenCalledWith('a1', 'u1', {
        isDefault: true,
      })
    })

    it('skips setDefault when isDefault is false', async () => {
      vi.mocked(addressRepository.update).mockResolvedValue(
        createMockAddress() as never,
      )

      await accountService.updateAddress('a1', 'u1', { city: 'Madrid' })

      expect(addressRepository.setDefault).not.toHaveBeenCalled()
      expect(addressRepository.update).toHaveBeenCalledWith('a1', 'u1', {
        city: 'Madrid',
      })
    })
  })

  describe('setDefaultAddress', () => {
    it('delegates to repository', async () => {
      vi.mocked(addressRepository.setDefault).mockResolvedValue(
        createMockAddress({ isDefault: true }) as never,
      )

      const result = await accountService.setDefaultAddress('a1', 'u1')

      expect(addressRepository.setDefault).toHaveBeenCalledWith('a1', 'u1')
      expect(result).toBeDefined()
    })
  })

  describe('updateProfile', () => {
    it('delegates to profile repository', async () => {
      const mockProfile = { id: 'u1', name: 'Updated', phone: '+34 600' }
      vi.mocked(profileRepository.update).mockResolvedValue(
        mockProfile as never,
      )

      const result = await accountService.updateProfile('u1', {
        name: 'Updated',
        phone: '+34 600',
      })

      expect(profileRepository.update).toHaveBeenCalledWith('u1', {
        name: 'Updated',
        phone: '+34 600',
      })
      expect(result).toEqual(mockProfile)
    })
  })
})
