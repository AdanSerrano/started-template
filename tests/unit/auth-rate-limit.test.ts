import { describe, it, expect, vi, beforeEach } from 'vitest'

// Stable mock objects that persist across calls
const mockSecurityService = {
  checkLockStatus: vi.fn(),
  recordFailedLogin: vi.fn(),
  getFailedAttempts: vi.fn(),
  resetFailedAttempts: vi.fn(),
  isAccountLocked: vi.fn(),
  lockAccount: vi.fn(),
  unlockAccount: vi.fn(),
  getLockExpiry: vi.fn(),
}

const mockRepo = {
  findIdByEmail: vi.fn(),
  findIdByUsername: vi.fn(),
  getFailedLoginAttempts: vi.fn(),
  updateFailedLoginAttempts: vi.fn(),
  resetFailedLogin: vi.fn(),
  getLockedUntil: vi.fn(),
  softDelete: vi.fn(),
  restore: vi.fn(),
}

vi.mock('@/modules/auth/repositories', () => ({
  get userRepository() {
    return mockRepo
  },
}))

vi.mock('@/modules/auth/services/auth-security-service', () => ({
  getAuthSecurityService: () => mockSecurityService,
}))

import {
  extractCredentialsFromRequest,
  checkAccountLockByEmail,
  checkAccountLockByUsername,
  handleFailedLogin,
} from '@/modules/auth/services/auth-rate-limit'

// ── Helpers ─────────────────────────────────────────────────

function createMockRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/auth/sign-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as Request
}

// ── Tests ───────────────────────────────────────────────────

describe('extractCredentialsFromRequest', () => {
  it('should extract and normalize email from request body', async () => {
    const request = createMockRequest({ email: '  TEST@Example.COM  ' })
    const result = await extractCredentialsFromRequest(request as never)

    expect(result).toEqual({
      email: 'test@example.com',
      username: undefined,
    })
  })

  it('should extract and normalize username from request body', async () => {
    const request = createMockRequest({ username: ' MyUser ' })
    const result = await extractCredentialsFromRequest(request as never)

    expect(result).toEqual({
      email: undefined,
      username: 'myuser',
    })
  })

  it('should extract both email and username', async () => {
    const request = createMockRequest({
      email: 'User@Test.com',
      username: 'TestUser',
    })
    const result = await extractCredentialsFromRequest(request as never)

    expect(result).toEqual({
      email: 'user@test.com',
      username: 'testuser',
    })
  })

  it('should return null when body is not valid JSON', async () => {
    const request = new Request('http://localhost/api/auth/sign-in', {
      method: 'POST',
      body: 'not-json',
    })
    const result = await extractCredentialsFromRequest(request as never)

    expect(result).toBeNull()
  })
})

describe('checkAccountLockByEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return unlocked when user is not found', async () => {
    mockRepo.findIdByEmail.mockResolvedValue(null)

    const result = await checkAccountLockByEmail('unknown@example.com')

    expect(result).toEqual({ locked: false, userId: null })
    expect(mockSecurityService.checkLockStatus).not.toHaveBeenCalled()
  })

  it('should return unlocked when account is not locked', async () => {
    mockRepo.findIdByEmail.mockResolvedValue('user-1')
    mockSecurityService.checkLockStatus.mockResolvedValue({
      locked: false,
      expiresAt: null,
      minutesRemaining: 0,
    })

    const result = await checkAccountLockByEmail('user@example.com')

    expect(result).toEqual({ locked: false, userId: 'user-1' })
  })

  it('should return locked with minutes remaining when account is locked', async () => {
    mockRepo.findIdByEmail.mockResolvedValue('user-1')
    mockSecurityService.checkLockStatus.mockResolvedValue({
      locked: true,
      expiresAt: new Date(Date.now() + 10 * 60000),
      minutesRemaining: 10,
    })

    const result = await checkAccountLockByEmail('user@example.com')

    expect(result.locked).toBe(true)
    expect(result.userId).toBe('user-1')
    expect(result.minutesRemaining).toBe(10)
    expect(result.message).toContain('10 minutos')
  })

  it('should return unlocked on repository error', async () => {
    mockRepo.findIdByEmail.mockRejectedValue(new Error('DB error'))

    const result = await checkAccountLockByEmail('user@example.com')

    expect(result).toEqual({ locked: false, userId: null })
  })
})

describe('checkAccountLockByUsername', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return unlocked when user is not found', async () => {
    mockRepo.findIdByUsername.mockResolvedValue(null)

    const result = await checkAccountLockByUsername('unknown')

    expect(result).toEqual({ locked: false, userId: null })
    expect(mockSecurityService.checkLockStatus).not.toHaveBeenCalled()
  })

  it('should return unlocked when account is not locked', async () => {
    mockRepo.findIdByUsername.mockResolvedValue('user-2')
    mockSecurityService.checkLockStatus.mockResolvedValue({
      locked: false,
      expiresAt: null,
      minutesRemaining: 0,
    })

    const result = await checkAccountLockByUsername('testuser')

    expect(result).toEqual({ locked: false, userId: 'user-2' })
  })

  it('should return locked with message when account is locked', async () => {
    mockRepo.findIdByUsername.mockResolvedValue('user-2')
    mockSecurityService.checkLockStatus.mockResolvedValue({
      locked: true,
      expiresAt: new Date(Date.now() + 5 * 60000),
      minutesRemaining: 5,
    })

    const result = await checkAccountLockByUsername('testuser')

    expect(result.locked).toBe(true)
    expect(result.userId).toBe('user-2')
    expect(result.minutesRemaining).toBe(5)
    expect(result.message).toContain('5 minutos')
  })

  it('should return unlocked on repository error', async () => {
    mockRepo.findIdByUsername.mockRejectedValue(new Error('DB error'))

    const result = await checkAccountLockByUsername('testuser')

    expect(result).toEqual({ locked: false, userId: null })
  })
})

describe('handleFailedLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should record failed login and return result', async () => {
    mockSecurityService.recordFailedLogin.mockResolvedValue({
      locked: false,
      attempts: 2,
    })

    const result = await handleFailedLogin('user-1')

    expect(result).toEqual({ locked: false, attempts: 2 })
    expect(mockSecurityService.recordFailedLogin).toHaveBeenCalledWith('user-1')
  })

  it('should return locked true when threshold is reached', async () => {
    mockSecurityService.recordFailedLogin.mockResolvedValue({
      locked: true,
      attempts: 5,
    })

    const result = await handleFailedLogin('user-1')

    expect(result).toEqual({ locked: true, attempts: 5 })
  })

  it('should return null on error', async () => {
    mockSecurityService.recordFailedLogin.mockRejectedValue(
      new Error('DB error'),
    )

    const result = await handleFailedLogin('user-1')

    expect(result).toBeNull()
  })
})
