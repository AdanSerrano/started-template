/**
 * Unit tests for the health endpoints.
 * - /api/health (readiness): DB crítica → 503; no filtra err.message.
 * - /api/health/live (liveness): siempre 200, no toca dependencias.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const execute = vi.hoisted(() => vi.fn())
vi.mock('@/lib/db', () => ({ db: { execute } }))

describe('/api/health (readiness)', () => {
  beforeEach(() => {
    execute.mockReset()
    delete process.env.UPSTASH_REDIS_REST_URL
  })

  it('returns 200 healthy when the database is up', async () => {
    execute.mockResolvedValue([{ '?column?': 1 }])
    const { GET } = await import('@/app/api/health/route')
    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.status).toBe('healthy')
    expect(body.services.database.status).toBe('up')
  })

  it('returns 503 unhealthy and does NOT leak the DB error message', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    execute.mockRejectedValue(
      new Error('connect ECONNREFUSED 10.0.0.5:5432 password=secret'),
    )
    const { GET } = await import('@/app/api/health/route')
    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(503)
    expect(body.status).toBe('unhealthy')
    expect(body.services.database.status).toBe('down')
    // El mensaje crudo (host/credenciales) NUNCA sale en la respuesta pública.
    expect(body.services.database.error).toBe('unavailable')
    expect(JSON.stringify(body)).not.toContain('ECONNREFUSED')
    spy.mockRestore()
  })
})

describe('/api/health/live (liveness)', () => {
  it('returns 200 ok without touching dependencies', async () => {
    const { GET } = await import('@/app/api/health/live/route')
    const res = GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.status).toBe('ok')
    expect(typeof body.uptime).toBe('number')
  })
})

afterEach(() => {
  vi.resetModules()
})
