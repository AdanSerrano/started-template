/**
 * Integration test example — Account actions.
 *
 * Patron: mock auth + mock repository, test action completa.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockAddress } from '../factories/address.factory'

// Mock env + db (prevent DATABASE_URL requirement)
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

// Mock rate limit — always allow
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({
    success: true,
    remaining: 19,
    reset: Date.now() + 300000,
    limit: 20,
  }),
}))

// Mock auth
vi.mock('@/lib/auth-server', () => ({
  requireAuth: vi.fn().mockResolvedValue({
    user: { id: 'test-user-1', name: 'Test', email: 'test@test.com' },
  }),
}))

// Mock audit
vi.mock('@/lib/audit', () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/audit-helpers', () => ({
  getRequestMetadata: vi.fn().mockResolvedValue({
    ip: '127.0.0.1',
    userAgent: 'test',
  }),
}))

// Mock repositories (need to mock at module level since they use db for prepared statements)
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

describe('Account Actions - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createAddressAction valida input con Zod', async () => {
    const { createAddressAction } =
      await import('@/modules/account/actions/account-actions')

    const result = await createAddressAction({}) // Invalid data
    expect(result.success).toBe(false)
    expect(result.error).toBe('Datos invalidos')
    expect(result.fieldErrors).toBeDefined()
  })

  it('createAddressAction crea direccion con datos validos', async () => {
    const mockAddress = createMockAddress()
    mockAddressRepo.create.mockResolvedValue(mockAddress)

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
  })

  it('deleteAddressAction elimina y audita', async () => {
    mockAddressRepo.remove.mockResolvedValue(true)
    const { createAuditLog } = await import('@/lib/audit')

    const { deleteAddressAction } =
      await import('@/modules/account/actions/account-actions')

    const result = await deleteAddressAction('test-address-1')

    expect(result.success).toBe(true)
    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'address.deleted',
        entityId: 'test-address-1',
      }),
    )
  })
})
