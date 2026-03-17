import { describe, it, expect, afterEach } from 'vitest'
import { InMemoryRateLimitService } from '@/lib/adapters/in-memory-rate-limit'
import { resetRateLimit } from '@/lib/rate-limit'

describe('InMemoryRateLimitService', () => {
  const service = new InMemoryRateLimitService()
  const config = { limit: 3, windowSeconds: 60 }

  afterEach(() => {
    resetRateLimit('svc-key')
  })

  it('check() consumes an attempt and returns result', async () => {
    const result = await service.check('svc-key', config)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(2)
    expect(result.limit).toBe(3)
  })

  it('check() uses default config when no config provided', async () => {
    const result = await service.check('svc-key')
    expect(result.success).toBe(true)
    expect(result.limit).toBe(10) // default limit
  })

  it('check() blocks after exceeding limit', async () => {
    await service.check('svc-key', config)
    await service.check('svc-key', config)
    await service.check('svc-key', config)
    const blocked = await service.check('svc-key', config)
    expect(blocked.success).toBe(false)
    expect(blocked.remaining).toBe(0)
  })

  it('reset() clears the counter', async () => {
    await service.check('svc-key', config)
    await service.check('svc-key', config)
    await service.check('svc-key', config)
    await service.reset('svc-key')
    const result = await service.check('svc-key', config)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it('getStatus() returns current state without consuming', async () => {
    await service.check('svc-key', config)
    const status = await service.getStatus('svc-key', config)
    expect(status.success).toBe(true)
    expect(status.remaining).toBe(2) // peek doesn't consume

    // Verify check still has same remaining
    const check = await service.check('svc-key', config)
    expect(check.remaining).toBe(1)
  })

  it('getStatus() uses default config when no config provided', async () => {
    const status = await service.getStatus('svc-key')
    expect(status.success).toBe(true)
    expect(status.limit).toBe(10)
  })

  it('full flow: check until blocked, reset, check succeeds', async () => {
    for (let i = 0; i < 3; i++) await service.check('svc-key', config)
    const blocked = await service.check('svc-key', config)
    expect(blocked.success).toBe(false)

    await service.reset('svc-key')

    const fresh = await service.check('svc-key', config)
    expect(fresh.success).toBe(true)
    expect(fresh.remaining).toBe(2)
  })
})
