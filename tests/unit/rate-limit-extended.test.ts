import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest'
import type { RateLimitConfig } from '@/lib/interfaces'
import { checkRateLimit, peekRateLimit, resetRateLimit } from '@/lib/rate-limit'

describe('peekRateLimit', () => {
  const config: RateLimitConfig = { limit: 5, windowSeconds: 60 }

  afterEach(() => {
    resetRateLimit('peek-key')
  })

  it('returns full remaining without consuming an attempt', () => {
    const result = peekRateLimit('peek-key', config)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(5)
    expect(result.limit).toBe(5)
  })

  it('shows correct remaining after some checks', () => {
    checkRateLimit('peek-key', config)
    checkRateLimit('peek-key', config)
    const peek = peekRateLimit('peek-key', config)
    expect(peek.remaining).toBe(3)
    expect(peek.success).toBe(true)
  })

  it('does not consume an attempt when peeking', () => {
    checkRateLimit('peek-key', config)
    peekRateLimit('peek-key', config)
    peekRateLimit('peek-key', config)
    peekRateLimit('peek-key', config)
    const result = checkRateLimit('peek-key', config)
    expect(result.remaining).toBe(3) // only 2 checks consumed
  })

  it('shows blocked status when limit exceeded', () => {
    // limit=5, so 5 checks consume all attempts. The 6th would be blocked.
    for (let i = 0; i < 5; i++) checkRateLimit('peek-key', config)
    // After exactly limit checks, count == limit, peek reports success (still at boundary)
    checkRateLimit('peek-key', config) // 6th call goes over limit
    const peek = peekRateLimit('peek-key', config)
    expect(peek.success).toBe(false)
    expect(peek.remaining).toBe(0)
  })
})

describe('rate-limit window expiration', () => {
  const config: RateLimitConfig = { limit: 2, windowSeconds: 1 }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    resetRateLimit('expire-key')
  })

  it('allows new requests after window expires', () => {
    checkRateLimit('expire-key', config)
    checkRateLimit('expire-key', config)
    const blocked = checkRateLimit('expire-key', config)
    expect(blocked.success).toBe(false)

    // Advance past the window
    vi.advanceTimersByTime(1100)

    const fresh = checkRateLimit('expire-key', config)
    expect(fresh.success).toBe(true)
    expect(fresh.remaining).toBe(1)
  })

  it('peekRateLimit returns fresh state after window expires', () => {
    checkRateLimit('expire-key', config)
    checkRateLimit('expire-key', config)

    vi.advanceTimersByTime(1100)

    const peek = peekRateLimit('expire-key', config)
    expect(peek.success).toBe(true)
    expect(peek.remaining).toBe(2)
  })
})

describe('rate-limit edge cases', () => {
  afterEach(() => {
    resetRateLimit('edge-key')
  })

  it('works with limit=1', () => {
    const config: RateLimitConfig = { limit: 1, windowSeconds: 60 }
    const first = checkRateLimit('edge-key', config)
    expect(first.success).toBe(true)
    expect(first.remaining).toBe(0)

    const second = checkRateLimit('edge-key', config)
    expect(second.success).toBe(false)
  })

  it('multiple resets do not crash', () => {
    resetRateLimit('edge-key')
    resetRateLimit('edge-key')
    resetRateLimit('edge-key')
    // no error thrown
  })

  it('reset timestamp is in the future', () => {
    const config: RateLimitConfig = { limit: 5, windowSeconds: 120 }
    const now = Date.now()
    const result = checkRateLimit('edge-key', config)
    expect(result.reset).toBeGreaterThan(now)
    expect(result.reset).toBeLessThanOrEqual(now + 120_000 + 10)
  })
})
