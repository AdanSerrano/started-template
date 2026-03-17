import { describe, it, expect } from 'vitest'
import {
  apiSuccess,
  apiError,
  apiNotFound,
  apiUnauthorized,
  apiRateLimited,
} from '@/lib/api-response'

describe('apiSuccess', () => {
  it('returns 200 with success body by default', async () => {
    const res = apiSuccess({ id: 1, name: 'Test' })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ success: true, data: { id: 1, name: 'Test' } })
  })

  it('accepts custom status via options', async () => {
    const res = apiSuccess('created', { status: 201 })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body).toEqual({ success: true, data: 'created' })
  })

  it('accepts custom headers via options', async () => {
    const res = apiSuccess(null, {
      headers: { 'X-Custom': 'value' },
    })
    expect(res.headers.get('X-Custom')).toBe('value')
  })

  it('handles null data', async () => {
    const body = await apiSuccess(null).json()
    expect(body).toEqual({ success: true, data: null })
  })

  it('handles array data', async () => {
    const body = await apiSuccess([1, 2, 3]).json()
    expect(body).toEqual({ success: true, data: [1, 2, 3] })
  })
})

describe('apiError', () => {
  it('returns 500 by default', async () => {
    const res = apiError('Something went wrong')
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body).toEqual({ success: false, error: 'Something went wrong' })
  })

  it('accepts custom status', async () => {
    const res = apiError('Bad request', 400)
    expect(res.status).toBe(400)
  })

  it('includes code when provided', async () => {
    const res = apiError('Not found', 404, { code: 'NOT_FOUND' })
    const body = await res.json()
    expect(body.code).toBe('NOT_FOUND')
  })

  it('includes details when provided', async () => {
    const details = { field: 'email', reason: 'invalid' }
    const res = apiError('Validation failed', 422, { details })
    const body = await res.json()
    expect(body.details).toEqual(details)
  })

  it('does not include code or details when not provided', async () => {
    const body = await apiError('Error').json()
    expect(body).not.toHaveProperty('code')
    expect(body).not.toHaveProperty('details')
  })

  it('accepts custom headers', async () => {
    const res = apiError('Error', 500, {
      headers: { 'X-Error-Id': '123' },
    })
    expect(res.headers.get('X-Error-Id')).toBe('123')
  })
})

describe('apiNotFound', () => {
  it('returns 404 with default entity', async () => {
    const res = apiNotFound()
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body).toEqual({
      success: false,
      error: 'Resource not found',
      code: 'NOT_FOUND',
    })
  })

  it('uses custom entity name', async () => {
    const res = apiNotFound('User')
    const body = await res.json()
    expect(body.error).toBe('User not found')
  })
})

describe('apiUnauthorized', () => {
  it('returns 401 with default message', async () => {
    const res = apiUnauthorized()
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body).toEqual({
      success: false,
      error: 'No autorizado',
      code: 'UNAUTHORIZED',
    })
  })

  it('uses custom message', async () => {
    const res = apiUnauthorized('Token expired')
    const body = await res.json()
    expect(body.error).toBe('Token expired')
  })
})

describe('apiRateLimited', () => {
  it('returns 429 with Retry-After header', async () => {
    const res = apiRateLimited(60)
    expect(res.status).toBe(429)
    expect(res.headers.get('Retry-After')).toBe('60')
    const body = await res.json()
    expect(body).toEqual({
      success: false,
      error: 'Demasiadas solicitudes',
      code: 'RATE_LIMIT_EXCEEDED',
    })
  })

  it('converts retryAfterSeconds to string in header', async () => {
    const res = apiRateLimited(120)
    expect(res.headers.get('Retry-After')).toBe('120')
  })
})
