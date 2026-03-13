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
    timeout = 60000,
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
    return this.request<T>(url, { method: 'GET' }, options)
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
    )
  }

  async delete<T>(
    url: string,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, { method: 'DELETE' }, options)
  }
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
