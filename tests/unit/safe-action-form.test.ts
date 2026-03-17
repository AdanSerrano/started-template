// eslint-disable-next-line import/order
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth-server', () => ({
  requireAuth: vi.fn().mockResolvedValue({
    user: { id: 'user-1', name: 'Test' },
  }),
}))
vi.mock('@/lib/audit-helpers', () => ({
  getRequestMetadata: vi.fn().mockResolvedValue({
    ip: '127.0.0.1',
    userAgent: 'test',
  }),
}))
vi.mock('@/lib/providers', () => ({
  getLogger: vi.fn().mockReturnValue({
    error: vi.fn(),
  }),
}))

import { requireAuth } from '@/lib/auth-server'
import { AppError, TooManyRequestsError } from '@/lib/errors'
import { getLogger } from '@/lib/providers'
import { createSafeFormAction } from '@/lib/safe-action'

describe('createSafeFormAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns success with handler result', async () => {
    const action = createSafeFormAction(async ({ formData }) => {
      return { name: formData.get('name') as string }
    })
    const fd = new FormData()
    fd.append('name', 'Test')
    const result = await action(fd)
    expect(result).toEqual({
      success: true,
      data: { name: 'Test' },
    })
  })

  it('calls requireAuth', async () => {
    const action = createSafeFormAction(async () => 'ok')
    await action(new FormData())
    expect(requireAuth).toHaveBeenCalled()
  })

  it('passes session and metadata to handler', async () => {
    const handler = vi.fn().mockResolvedValue('ok')
    const action = createSafeFormAction(handler)
    const fd = new FormData()
    fd.append('file', 'data')
    await action(fd)
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        session: { user: { id: 'user-1', name: 'Test' } },
        metadata: { ip: '127.0.0.1', userAgent: 'test' },
      }),
    )
    expect(handler.mock.calls[0][0].formData).toBeInstanceOf(FormData)
  })

  it('returns AppError details when handler throws AppError', async () => {
    const action = createSafeFormAction(async () => {
      throw new AppError('File too large', 422, 'VALIDATION_ERROR')
    })
    const result = await action(new FormData())
    expect(result).toEqual({
      success: false,
      error: 'File too large',
      code: 'VALIDATION_ERROR',
      fieldErrors: undefined,
    })
  })

  it('returns retryAfterMs for TooManyRequestsError', async () => {
    const action = createSafeFormAction(async () => {
      throw new TooManyRequestsError('Rate limited', 30000)
    })
    const result = await action(new FormData())
    expect(result.success).toBe(false)
    expect(result.retryAfterMs).toBe(30000)
  })

  it('returns INTERNAL_ERROR for unknown errors', async () => {
    const action = createSafeFormAction(async () => {
      throw new Error('Unexpected crash')
    })
    const result = await action(new FormData())
    expect(result).toEqual({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR',
    })
    expect(getLogger().error).toHaveBeenCalled()
  })

  it('re-throws errors with digest property (Next.js internal)', async () => {
    const digestError = Object.assign(new Error('NEXT_REDIRECT'), {
      digest: 'NEXT_REDIRECT;/dashboard',
    })
    const action = createSafeFormAction(async () => {
      throw digestError
    })
    await expect(action(new FormData())).rejects.toThrow('NEXT_REDIRECT')
  })

  it('returns AppError with fieldErrors', async () => {
    const action = createSafeFormAction(async () => {
      throw new AppError('Invalid file', 422, 'VALIDATION_ERROR', {
        file: ['File type not allowed'],
      })
    })
    const result = await action(new FormData())
    expect(result.success).toBe(false)
    expect(result.fieldErrors).toEqual({ file: ['File type not allowed'] })
  })
})
