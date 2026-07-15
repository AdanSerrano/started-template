import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('cors', () => {
  beforeEach(() => {
    vi.resetModules()
    delete process.env.CORS_ALLOWED_ORIGINS
  })

  async function importCors() {
    return await import('@/lib/cors')
  }

  describe('corsHeaders', () => {
    it('returns empty object when no env var is set', async () => {
      const { corsHeaders } = await importCors()
      const headers = corsHeaders('https://example.com')
      expect(headers).toEqual({})
    })

    it('returns empty object when origin is not provided', async () => {
      process.env.CORS_ALLOWED_ORIGINS = 'https://example.com'
      const { corsHeaders } = await importCors()
      const headers = corsHeaders()
      expect(headers).toEqual({})
    })

    it('returns empty object when origin is null', async () => {
      process.env.CORS_ALLOWED_ORIGINS = 'https://example.com'
      const { corsHeaders } = await importCors()
      const headers = corsHeaders(null)
      expect(headers).toEqual({})
    })

    it('wildcard returns "*" and NEVER credentials (no cross-origin data theft)', async () => {
      process.env.CORS_ALLOWED_ORIGINS = '*'
      const { corsHeaders } = await importCors()
      const headers = corsHeaders('https://any-origin.com') as Record<
        string,
        string
      >
      // Con wildcard se devuelve el literal "*", no se refleja el origin,
      // y no se emite Allow-Credentials: combinar ambos permitiría a
      // cualquier web leer respuestas autenticadas de la víctima.
      expect(headers['Access-Control-Allow-Origin']).toBe('*')
      expect(headers['Access-Control-Allow-Credentials']).toBeUndefined()
      expect(headers['Access-Control-Allow-Methods']).toContain('GET')
      expect(headers['Access-Control-Max-Age']).toBe('86400')
    })

    it('specific allowed origin reflects origin WITH credentials', async () => {
      process.env.CORS_ALLOWED_ORIGINS = 'https://allowed.com'
      const { corsHeaders } = await importCors()
      const headers = corsHeaders('https://allowed.com') as Record<
        string,
        string
      >
      expect(headers['Access-Control-Allow-Origin']).toBe('https://allowed.com')
      expect(headers['Access-Control-Allow-Credentials']).toBe('true')
    })

    it('returns CORS headers for allowed specific origin', async () => {
      process.env.CORS_ALLOWED_ORIGINS =
        'https://allowed.com, https://other.com'
      const { corsHeaders } = await importCors()
      const headers = corsHeaders('https://allowed.com') as Record<
        string,
        string
      >
      expect(headers['Access-Control-Allow-Origin']).toBe('https://allowed.com')
    })

    it('returns empty object for non-allowed origin', async () => {
      process.env.CORS_ALLOWED_ORIGINS = 'https://allowed.com'
      const { corsHeaders } = await importCors()
      const headers = corsHeaders('https://evil.com')
      expect(headers).toEqual({})
    })

    it('trims whitespace from configured origins', async () => {
      process.env.CORS_ALLOWED_ORIGINS = '  https://trimmed.com  '
      const { corsHeaders } = await importCors()
      const headers = corsHeaders('https://trimmed.com') as Record<
        string,
        string
      >
      expect(headers['Access-Control-Allow-Origin']).toBe('https://trimmed.com')
    })
  })

  describe('handleCorsPreflight', () => {
    it('returns 204 for allowed origin', async () => {
      process.env.CORS_ALLOWED_ORIGINS = 'https://allowed.com'
      const { handleCorsPreflight } = await importCors()
      const request = new Request('https://api.example.com', {
        headers: { origin: 'https://allowed.com' },
      })
      const res = handleCorsPreflight(request)
      expect(res.status).toBe(204)
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe(
        'https://allowed.com',
      )
    })

    it('returns 403 for non-allowed origin', async () => {
      process.env.CORS_ALLOWED_ORIGINS = 'https://allowed.com'
      const { handleCorsPreflight } = await importCors()
      const request = new Request('https://api.example.com', {
        headers: { origin: 'https://evil.com' },
      })
      const res = handleCorsPreflight(request)
      expect(res.status).toBe(403)
    })

    it('returns 403 when no origin header', async () => {
      process.env.CORS_ALLOWED_ORIGINS = 'https://allowed.com'
      const { handleCorsPreflight } = await importCors()
      const request = new Request('https://api.example.com')
      const res = handleCorsPreflight(request)
      expect(res.status).toBe(403)
    })

    it('returns 403 when no env var is set', async () => {
      const { handleCorsPreflight } = await importCors()
      const request = new Request('https://api.example.com', {
        headers: { origin: 'https://example.com' },
      })
      const res = handleCorsPreflight(request)
      expect(res.status).toBe(403)
    })
  })
})
