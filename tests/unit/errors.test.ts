import { describe, expect, it } from 'vitest'
import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  AccountLockedError,
  ConflictError,
  TooManyRequestsError,
  ServiceUnavailableError,
} from '@/lib/errors'

describe('Error classes', () => {
  it('AppError has correct name, statusCode, and code', () => {
    const error = new AppError('test', 500, 'TEST_CODE')
    expect(error.name).toBe('AppError')
    expect(error.message).toBe('test')
    expect(error.statusCode).toBe(500)
    expect(error.code).toBe('TEST_CODE')
    expect(error).toBeInstanceOf(Error)
  })

  it('AppError supports fieldErrors', () => {
    const fields = { email: ['Invalid email'] }
    const error = new AppError('test', 422, 'VALIDATION', fields)
    expect(error.fieldErrors).toEqual(fields)
  })

  it('NotFoundError has status 404', () => {
    const error = new NotFoundError('User', '123')
    expect(error.name).toBe('NotFoundError')
    expect(error.statusCode).toBe(404)
    expect(error.code).toBe('NOT_FOUND')
    expect(error.message).toContain('123')
  })

  it('ValidationError has status 422', () => {
    const fields = { name: ['Required'] }
    const error = new ValidationError('Invalid data', fields)
    expect(error.name).toBe('ValidationError')
    expect(error.statusCode).toBe(422)
    expect(error.fieldErrors).toEqual(fields)
  })

  it('UnauthorizedError has status 401', () => {
    const error = new UnauthorizedError()
    expect(error.name).toBe('UnauthorizedError')
    expect(error.statusCode).toBe(401)
    expect(error.code).toBe('UNAUTHORIZED')
  })

  it('ForbiddenError has status 403', () => {
    const error = new ForbiddenError()
    expect(error.name).toBe('ForbiddenError')
    expect(error.statusCode).toBe(403)
  })

  it('AccountLockedError has status 423 and lockedUntil', () => {
    const until = new Date()
    const error = new AccountLockedError(undefined, until)
    expect(error.name).toBe('AccountLockedError')
    expect(error.statusCode).toBe(423)
    expect(error.lockedUntil).toBe(until)
  })

  it('ConflictError has status 409', () => {
    const error = new ConflictError()
    expect(error.name).toBe('ConflictError')
    expect(error.statusCode).toBe(409)
    expect(error.code).toBe('CONFLICT')
  })

  it('TooManyRequestsError has status 429 and retryAfterMs', () => {
    const error = new TooManyRequestsError(undefined, 5000)
    expect(error.name).toBe('TooManyRequestsError')
    expect(error.statusCode).toBe(429)
    expect(error.retryAfterMs).toBe(5000)
  })

  it('ServiceUnavailableError has status 503', () => {
    const error = new ServiceUnavailableError()
    expect(error.name).toBe('ServiceUnavailableError')
    expect(error.statusCode).toBe(503)
    expect(error.code).toBe('SERVICE_UNAVAILABLE')
  })

  it('all error classes are instanceof AppError', () => {
    expect(new NotFoundError('a', 'b')).toBeInstanceOf(AppError)
    expect(new ValidationError('a')).toBeInstanceOf(AppError)
    expect(new UnauthorizedError()).toBeInstanceOf(AppError)
    expect(new ForbiddenError()).toBeInstanceOf(AppError)
    expect(new AccountLockedError()).toBeInstanceOf(AppError)
    expect(new ConflictError()).toBeInstanceOf(AppError)
    expect(new TooManyRequestsError()).toBeInstanceOf(AppError)
    expect(new ServiceUnavailableError()).toBeInstanceOf(AppError)
  })
})
