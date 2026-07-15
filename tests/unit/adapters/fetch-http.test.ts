import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FetchHttpClient, FetchHttpError } from '@/lib/adapters/fetch-http'

describe('FetchHttpClient', () => {
  let client: FetchHttpClient
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
    mockFetch.mockReset()
    client = new FetchHttpClient('https://api.test.com')
  })

  function mockResponse(data: unknown, status = 200) {
    const headers = new Headers({ 'content-type': 'application/json' })
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      headers,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    }
  }

  it('GET sends correct method and URL', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 1 }))
    const result = await client.get('/users/1')
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('https://api.test.com/users/1')
    expect(init.method).toBe('GET')
    expect(result.data).toEqual({ id: 1 })
    expect(result.status).toBe(200)
  })

  it('POST sends JSON body', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ id: 2 }))
    await client.post('/users', { name: 'Test' })
    const [, init] = mockFetch.mock.calls[0]
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ name: 'Test' }))
  })

  it('PUT sends correct method', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ ok: true }))
    await client.put('/users/1', { name: 'Updated' })
    const [, init] = mockFetch.mock.calls[0]
    expect(init.method).toBe('PUT')
  })

  it('PATCH sends correct method', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ ok: true }))
    await client.patch('/users/1', { name: 'Patched' })
    const [, init] = mockFetch.mock.calls[0]
    expect(init.method).toBe('PATCH')
  })

  it('DELETE sends correct method', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(null))
    await client.delete('/users/1')
    const [, init] = mockFetch.mock.calls[0]
    expect(init.method).toBe('DELETE')
  })

  it('appends query params to URL', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse([]))
    await client.get('/users', { params: { page: 1, limit: 10 } })
    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('page=1')
    expect(url).toContain('limit=10')
  })

  it('merges custom headers', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({}))
    await client.get('/users', { headers: { Authorization: 'Bearer token' } })
    const [, init] = mockFetch.mock.calls[0]
    expect(init.headers.Authorization).toBe('Bearer token')
  })

  it('throws FetchHttpError on non-OK response', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ error: 'Not Found' }, 404))
    await expect(client.get('/missing')).rejects.toThrow(FetchHttpError)
  })

  it('works without baseURL', async () => {
    const noBaseClient = new FetchHttpClient()
    mockFetch.mockResolvedValueOnce(mockResponse({ ok: true }))
    await noBaseClient.get('/endpoint')
    const [url] = mockFetch.mock.calls[0]
    expect(url).toBe('/endpoint')
  })

  it('returns response headers', async () => {
    const headers = new Headers({
      'content-type': 'application/json',
      'x-custom': 'value',
    })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers,
      json: () => Promise.resolve({}),
    })
    const result = await client.get('/test')
    expect(result.headers['x-custom']).toBe('value')
  })

  it('POST without body sends null', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({}))
    await client.post('/trigger')
    const [, init] = mockFetch.mock.calls[0]
    expect(init.body).toBeNull()
  })

  describe('retries', () => {
    it('retries an idempotent GET on 500 then succeeds', async () => {
      mockFetch
        .mockResolvedValueOnce(mockResponse({ error: 'boom' }, 500))
        .mockResolvedValueOnce(mockResponse({ id: 1 }, 200))
      const result = await client.get('/users/1', { retries: 1 })
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(result.data).toEqual({ id: 1 })
    })

    it('does NOT retry a POST (non-idempotent) on 500', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ error: 'boom' }, 500))
      await expect(client.post('/users', { a: 1 })).rejects.toThrow(
        FetchHttpError,
      )
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('does NOT retry a 4xx (deterministic) on GET', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ error: 'nope' }, 404))
      await expect(client.get('/missing', { retries: 3 })).rejects.toThrow(
        FetchHttpError,
      )
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('retries on 429 (rate limited)', async () => {
      mockFetch
        .mockResolvedValueOnce(mockResponse({ error: 'slow down' }, 429))
        .mockResolvedValueOnce(mockResponse({ ok: true }, 200))
      const result = await client.get('/x', { retries: 1 })
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(result.status).toBe(200)
    })
  })
})
