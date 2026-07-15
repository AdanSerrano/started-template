import type {
  IHttpClient,
  HttpRequestOptions,
  HttpResponse,
} from '@/lib/interfaces'

/**
 * Implementacion de IHttpClient usando fetch nativo.
 * Compatible con Next.js caching, memoization y revalidation.
 */
export class FetchHttpClient implements IHttpClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private defaultTimeout: number

  constructor(
    baseURL?: string,
    defaultHeaders?: Record<string, string>,
    timeout = 15000,
  ) {
    this.baseURL = baseURL ?? ''
    this.defaultHeaders = defaultHeaders ?? {}
    this.defaultTimeout = timeout
  }

  private buildURL(
    url: string,
    params?: Record<string, string | number | boolean>,
  ): string {
    const fullURL = this.baseURL ? `${this.baseURL}${url}` : url
    if (!params) return fullURL

    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      searchParams.set(key, String(value))
    }
    const separator = fullURL.includes('?') ? '&' : '?'
    return `${fullURL}${separator}${searchParams.toString()}`
  }

  private async request<T>(
    url: string,
    init: RequestInit,
    options: HttpRequestOptions | undefined,
    idempotent: boolean,
  ): Promise<HttpResponse<T>> {
    const maxRetries = options?.retries ?? (idempotent ? 2 : 0)

    let attempt = 0
    for (;;) {
      try {
        return await this.requestOnce<T>(url, init, options)
      } catch (error) {
        if (attempt >= maxRetries || !isRetryable(error)) throw error
        // Backoff exponencial con jitter: 200ms, 400ms, 800ms… (+0-100ms).
        const delay = 200 * 2 ** attempt + Math.floor(Math.random() * 100)
        await new Promise((r) => setTimeout(r, delay))
        attempt++
      }
    }
  }

  private async requestOnce<T>(
    url: string,
    init: RequestInit,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>> {
    const timeout = options?.timeout ?? this.defaultTimeout
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...options?.headers,
    }

    try {
      const response = await fetch(this.buildURL(url, options?.params), {
        ...init,
        headers,
        signal: controller.signal,
      })

      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      const contentType = response.headers.get('content-type') ?? ''
      const data = contentType.includes('application/json')
        ? await response.json()
        : await response.text()

      if (!response.ok) {
        throw new FetchHttpError(response.status, response.statusText, data)
      }

      return {
        data: data as T,
        status: response.status,
        headers: responseHeaders,
      }
    } catch (error) {
      if (error instanceof FetchHttpError) throw error
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new FetchHttpError(408, 'Request Timeout', null)
      }
      throw error
    } finally {
      clearTimeout(timer)
    }
  }

  async get<T>(
    url: string,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, { method: 'GET' }, options, true)
  }

  async post<T>(
    url: string,
    data?: unknown,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data != null ? JSON.stringify(data) : null,
      },
      options,
      false,
    )
  }

  async put<T>(
    url: string,
    data?: unknown,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(
      url,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: data != null ? JSON.stringify(data) : null,
      },
      options,
      false,
    )
  }

  async patch<T>(
    url: string,
    data?: unknown,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(
      url,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: data != null ? JSON.stringify(data) : null,
      },
      options,
      false,
    )
  }

  async delete<T>(
    url: string,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, { method: 'DELETE' }, options, true)
  }
}

/**
 * Reintentable solo ante errores transitorios: red (error genérico), 429 y 5xx.
 * NO se reintentan 4xx (salvo 429) ni timeouts (408): son deterministas o
 * compondrían la latencia.
 */
function isRetryable(error: unknown): boolean {
  if (error instanceof FetchHttpError) {
    return error.status === 429 || error.status >= 500
  }
  // Error de red (fetch lanzó algo que no es FetchHttpError ni un abort).
  if (error instanceof DOMException && error.name === 'AbortError') return false
  return error instanceof Error
}

export class FetchHttpError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: unknown,
  ) {
    super(`HTTP ${status}: ${statusText}`)
    this.name = 'FetchHttpError'
  }
}
