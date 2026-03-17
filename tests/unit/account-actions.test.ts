/**
 * Unit tests for account actions — validation, error codes, audit logging.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockAddress } from '../factories/address.factory'

// Mock env + db
vi.mock('@/lib/env', () => ({
  env: {
    DATABASE_URL: 'postgresql://test:test@localhost/test',
    BETTER_AUTH_SECRET: 'a'.repeat(32),
    APP_URL: 'http://localhost:3000',
    RESEND_API_KEY: '',
  },
}))
vi.mock('@/lib/db', () => ({
  db: {},
}))

vi.mock('@/lib/providers', () => ({
  getLogger: () => ({
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }),
}))

// Mock auth
vi.mock('@/lib/auth-server', () => ({
  requireAuth: vi.fn().mockResolvedValue({
    user: { id: 'test-user-1', name: 'Test', email: 'test@test.com' },
  }),
}))

// Mock rate limit — always allow
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({
    success: true,
    remaining: 19,
    reset: Date.now() + 300000,
    limit: 20,
  }),
}))

// Mock audit
vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/lib/audit-helpers', () => ({
  getRequestMetadata: vi
    .fn()
    .mockResolvedValue({ ip: '127.0.0.1', userAgent: 'test' }),
}))

// Mock repositories
const mockAddressRepo = {
  findByUserId: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  setDefault: vi.fn(),
  countByUserId: vi.fn(),
}
vi.mock('@/modules/account/repositories/address-repository', () => ({
  addressRepository: mockAddressRepo,
}))

const mockProfileRepo = {
  findById: vi.fn(),
  update: vi.fn(),
}
vi.mock('@/modules/account/repositories/profile-repository', () => ({
  profileRepository: mockProfileRepo,
}))

describe('Account Actions — Validation & Error Codes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updateProfileAction', () => {
    it('returns i18n error code on invalid input', async () => {
      const { updateProfileAction } =
        await import('@/modules/account/actions/account-actions')

      const result = await updateProfileAction({})
      expect(result.success).toBe(false)
      expect(result.error).toBe('Datos invalidos')
      expect(result.fieldErrors).toBeDefined()
    })

    it('updates profile and creates audit log', async () => {
      mockProfileRepo.update.mockResolvedValue({
        id: 'test-user-1',
        name: 'Updated',
        phone: null,
      })
      const { createAuditLog } = await import('@/lib/audit')
      const { updateProfileAction } =
        await import('@/modules/account/actions/account-actions')

      const result = await updateProfileAction({ name: 'Updated', phone: '' })
      expect(result.success).toBe(true)
      expect(createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'profile.updated',
          entityType: 'user',
          severity: 'low',
        }),
      )
    })
  })

  describe('createAddressAction', () => {
    it('returns i18n error code on invalid input', async () => {
      const { createAddressAction } =
        await import('@/modules/account/actions/account-actions')

      const result = await createAddressAction({})
      expect(result.success).toBe(false)
      expect(result.error).toBe('Datos invalidos')
    })

    it('creates address and logs audit with entity id', async () => {
      const mockAddress = createMockAddress({ id: 'addr-new-1' })
      mockAddressRepo.create.mockResolvedValue(mockAddress)
      const { createAuditLog } = await import('@/lib/audit')

      const { createAddressAction } =
        await import('@/modules/account/actions/account-actions')

      const result = await createAddressAction({
        type: 'shipping',
        isDefault: false,
        firstName: 'Test',
        lastName: 'User',
        street: 'Calle Test 1',
        city: 'Barcelona',
        postalCode: '08001',
        country: 'ES',
      })

      expect(result.success).toBe(true)
      expect(createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'address.created',
          entityType: 'address',
          entityId: 'addr-new-1',
        }),
      )
    })
  })

  describe('updateAddressAction', () => {
    it('returns error when id is missing', async () => {
      const { updateAddressAction } =
        await import('@/modules/account/actions/account-actions')

      const result = await updateAddressAction({
        id: '',
        type: 'shipping',
        isDefault: false,
        firstName: 'Test',
        lastName: 'User',
        street: 'Calle Test 1',
        city: 'Barcelona',
        postalCode: '08001',
        country: 'ES',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('validation.addressIdRequired')
    })

    it('updates address and logs audit', async () => {
      mockAddressRepo.update.mockResolvedValue(
        createMockAddress({ id: 'addr-1' }),
      )
      const { createAuditLog } = await import('@/lib/audit')

      const { updateAddressAction } =
        await import('@/modules/account/actions/account-actions')

      const result = await updateAddressAction({
        id: 'addr-1',
        type: 'shipping',
        isDefault: false,
        firstName: 'Updated',
        lastName: 'Name',
        street: 'New Street',
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
      })

      expect(result.success).toBe(true)
      expect(createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'address.updated',
          entityId: 'addr-1',
        }),
      )
    })
  })

  describe('setDefaultAddressAction', () => {
    it('sets default and logs audit', async () => {
      mockAddressRepo.setDefault.mockResolvedValue(
        createMockAddress({ id: 'addr-2', isDefault: true }),
      )
      const { createAuditLog } = await import('@/lib/audit')

      const { setDefaultAddressAction } =
        await import('@/modules/account/actions/account-actions')

      const result = await setDefaultAddressAction('addr-2')

      expect(result.success).toBe(true)
      expect(createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'address.set_default',
          entityId: 'addr-2',
          severity: 'low',
        }),
      )
    })
  })

  describe('getProfileAction', () => {
    it('returns profile for authenticated user', async () => {
      const mockProfile = {
        id: 'test-user-1',
        name: 'Test',
        email: 'test@test.com',
        phone: null,
        image: null,
      }
      mockProfileRepo.findById.mockResolvedValue(mockProfile)

      const { getProfileAction } =
        await import('@/modules/account/actions/account-actions')

      const result = await getProfileAction()
      expect(result).toEqual(mockProfile)
    })
  })

  describe('getAddressesAction', () => {
    it('returns addresses for authenticated user', async () => {
      const mockAddresses = [createMockAddress(), createMockAddress()]
      mockAddressRepo.findByUserId.mockResolvedValue(mockAddresses)

      const { getAddressesAction } =
        await import('@/modules/account/actions/account-actions')

      const result = await getAddressesAction()
      expect(result).toHaveLength(2)
    })
  })
})
