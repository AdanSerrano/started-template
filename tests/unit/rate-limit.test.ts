import { describe, it, expect } from 'vitest'
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit'

describe('checkRateLimit', () => {
  const config = { maxAttempts: 3, windowMs: 60000 }

  afterEach(() => {
    resetRateLimit('test-key')
  })

  it('should allow first request', () => {
    const result = checkRateLimit('test-key', config)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(2)
    expect(result.limit).toBe(3)
  })

  it('should decrement remaining on each call', () => {
    checkRateLimit('test-key', config)
    const result = checkRateLimit('test-key', config)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(1)
  })

  it('should block after exceeding max attempts', () => {
    checkRateLimit('test-key', config)
    checkRateLimit('test-key', config)
    checkRateLimit('test-key', config)
    const result = checkRateLimit('test-key', config)
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should track different keys independently', () => {
    checkRateLimit('key-a', config)
    checkRateLimit('key-a', config)
    checkRateLimit('key-a', config)

    const resultA = checkRateLimit('key-a', config)
    const resultB = checkRateLimit('key-b', config)

    expect(resultA.success).toBe(false)
    expect(resultB.success).toBe(true)

    resetRateLimit('key-a')
    resetRateLimit('key-b')
  })

  it('should reset after calling resetRateLimit', () => {
    checkRateLimit('test-key', config)
    checkRateLimit('test-key', config)
    checkRateLimit('test-key', config)

    resetRateLimit('test-key')

    const result = checkRateLimit('test-key', config)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(2)
  })
})
