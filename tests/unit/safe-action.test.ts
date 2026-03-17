import { describe, it, expect, vi, beforeEach } from 'vitest'
// eslint-disable-next-line import/order
import { z } from 'zod/v4'

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
import { AppError } from '@/lib/errors'
import { getLogger } from '@/lib/providers'
import { createSafeAction } from '@/lib/safe-action'

describe('createSafeAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('validates input with schema and returns success', async () => {
    const schema = z.object({ name: z.string() })
    const action = createSafeAction({ schema }, async ({ data }) => {
      return { id: '1', name: data.name }
    })
    const result = await action({ name: 'Hello' })
    expect(result).toEqual({
      success: true,
      data: { id: '1', name: 'Hello' },
    })
  })

  it('returns validation error for invalid input', async () => {
    const schema = z.object({ name: z.string() })
    const action = createSafeAction({ schema }, async () => {
      return 'ok'
    })
    const result = await action({ name: 123 })
    expect(result.success).toBe(false)
    expect(result.code).toBe('VALIDATION_ERROR')
    expect(result.error).toBe('Datos invalidos')
    expect(result.fieldErrors).toBeDefined()
    expect(result.fieldErrors!.name).toBeDefined()
  })

  it('returns AppError details when handler throws AppError', async () => {
    const action = createSafeAction({}, async () => {
      throw new AppError('Not found', 404, 'NOT_FOUND')
    })
    const result = await action({})
    expect(result).toEqual({
      success: false,
      error: 'Not found',
      code: 'NOT_FOUND',
      fieldErrors: undefined,
    })
  })

  it('returns AppError with fieldErrors', async () => {
    const action = createSafeAction({}, async () => {
      throw new AppError('Validation', 422, 'VALIDATION_ERROR', {
        email: ['Required'],
      })
    })
    const result = await action({})
    expect(result.success).toBe(false)
    expect(result.fieldErrors).toEqual({ email: ['Required'] })
  })

  it('returns INTERNAL_ERROR for unknown errors', async () => {
    const action = createSafeAction({}, async () => {
      throw new Error('Unexpected')
    })
    const result = await action({})
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
    const action = createSafeAction({}, async () => {
      throw digestError
    })
    await expect(action({})).rejects.toThrow('NEXT_REDIRECT')
  })

  it('works without schema (config.schema undefined)', async () => {
    const action = createSafeAction({}, async ({ data }) => {
      return data
    })
    const result = await action({ anything: true })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ anything: true })
  })

  it('calls requireAuth by default', async () => {
    const action = createSafeAction({}, async () => 'ok')
    await action({})
    expect(requireAuth).toHaveBeenCalled()
  })

  it('passes session and metadata to handler', async () => {
    const handler = vi.fn().mockResolvedValue('ok')
    const action = createSafeAction({}, handler)
    await action({})
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        session: { user: { id: 'user-1', name: 'Test' } },
        metadata: { ip: '127.0.0.1', userAgent: 'test' },
      }),
    )
  })
})
