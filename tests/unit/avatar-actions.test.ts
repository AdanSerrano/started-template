/**
 * Unit tests for avatar upload action — file validation, rate limiting,
 * storage upload, audit logging, and error scenarios.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

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
  getStorageService: () => mockStorage,
}))

// Mock auth
vi.mock('@/lib/auth-server', () => ({
  requireAuth: vi.fn().mockResolvedValue({
    user: { id: 'test-user-1', name: 'Test', email: 'test@test.com' },
  }),
}))

// Mock rate limit
const mockCheckRateLimit = vi.fn().mockReturnValue({
  success: true,
  remaining: 4,
  reset: Date.now() + 300000,
  limit: 5,
})
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
}))

// Mock audit
const mockCreateAuditLog = vi.fn().mockResolvedValue(undefined)
vi.mock('@/lib/audit', () => ({
  createAuditLog: (...args: unknown[]) => mockCreateAuditLog(...args),
}))
vi.mock('@/lib/audit-helpers', () => ({
  getRequestMetadata: vi
    .fn()
    .mockResolvedValue({ ip: '127.0.0.1', userAgent: 'test' }),
}))

// Mock validateFile
const mockValidateFile = vi.fn().mockResolvedValue({ valid: true })
vi.mock('@/lib/upload-validation', () => ({
  validateFile: (...args: unknown[]) => mockValidateFile(...args),
}))

// Mock storage
const mockStorage = {
  upload: vi.fn().mockResolvedValue('https://cdn.example.com/avatar.jpg'),
}

// Mock account service
const mockGetProfile = vi.fn().mockResolvedValue({
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@test.com',
  phone: null,
  image: null,
})
const mockUpdateProfile = vi.fn().mockResolvedValue({})
vi.mock('@/modules/account/services/account-service', () => ({
  getProfile: (...args: unknown[]) => mockGetProfile(...args),
  updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
}))

function createMockFile(
  name = 'avatar.jpg',
  type = 'image/jpeg',
  size = 1024,
): File {
  const buffer = new ArrayBuffer(size)
  return new File([buffer], name, { type })
}

describe('uploadAvatarAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckRateLimit.mockReturnValue({
      success: true,
      remaining: 4,
      reset: Date.now() + 300000,
      limit: 5,
    })
    mockValidateFile.mockResolvedValue({ valid: true })
  })

  it('uploads avatar successfully', async () => {
    const { uploadAvatarAction } =
      await import('@/modules/account/actions/avatar-actions')
    const formData = new FormData()
    formData.append('file', createMockFile())

    const result = await uploadAvatarAction(formData)

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ url: 'https://cdn.example.com/avatar.jpg' })
  })

  it('calls validateFile with correct options', async () => {
    const { uploadAvatarAction } =
      await import('@/modules/account/actions/avatar-actions')
    const formData = new FormData()
    const file = createMockFile()
    formData.append('file', file)

    await uploadAvatarAction(formData)

    expect(mockValidateFile).toHaveBeenCalledWith(file, {
      maxSizeBytes: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    })
  })

  it('returns error when file validation fails', async () => {
    mockValidateFile.mockResolvedValue({
      valid: false,
      error: 'Tipo de archivo no permitido: application/pdf',
    })
    const { uploadAvatarAction } =
      await import('@/modules/account/actions/avatar-actions')
    const formData = new FormData()
    formData.append('file', createMockFile('doc.pdf', 'application/pdf'))

    const result = await uploadAvatarAction(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Tipo de archivo no permitido: application/pdf')
  })

  it('returns error when no file provided', async () => {
    const { uploadAvatarAction } =
      await import('@/modules/account/actions/avatar-actions')
    const formData = new FormData()

    const result = await uploadAvatarAction(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('validation.fileRequired')
  })

  it('enforces rate limit', async () => {
    mockCheckRateLimit.mockReturnValue({
      success: false,
      remaining: 0,
      reset: Date.now() + 60000,
      limit: 5,
    })
    const { uploadAvatarAction } =
      await import('@/modules/account/actions/avatar-actions')
    const formData = new FormData()
    formData.append('file', createMockFile())

    const result = await uploadAvatarAction(formData)

    expect(result.success).toBe(false)
    expect(result.code).toBe('TOO_MANY_REQUESTS')
    expect(result.retryAfterMs).toBeDefined()
  })

  it('creates audit log on successful upload', async () => {
    const { uploadAvatarAction } =
      await import('@/modules/account/actions/avatar-actions')
    const formData = new FormData()
    formData.append('file', createMockFile())

    await uploadAvatarAction(formData)

    expect(mockCreateAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'profile.avatar_updated',
        entityType: 'user',
        entityId: 'test-user-1',
        severity: 'low',
      }),
    )
  })

  it('updates user profile with new avatar URL', async () => {
    const { uploadAvatarAction } =
      await import('@/modules/account/actions/avatar-actions')
    const formData = new FormData()
    formData.append('file', createMockFile())

    await uploadAvatarAction(formData)

    expect(mockUpdateProfile).toHaveBeenCalledWith('test-user-1', {
      name: 'Test User',
      image: 'https://cdn.example.com/avatar.jpg',
    })
  })

  it('uploads to correct storage path', async () => {
    const { uploadAvatarAction } =
      await import('@/modules/account/actions/avatar-actions')
    const formData = new FormData()
    formData.append('file', createMockFile())

    await uploadAvatarAction(formData)

    expect(mockStorage.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^public\/avatars\/test-user-1\/[a-f0-9]+\.jpg$/),
      expect.any(File),
      'image/jpeg',
    )
  })
})
