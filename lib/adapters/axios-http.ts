import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import type {
  IHttpClient,
  HttpRequestOptions,
  HttpResponse,
} from '@/lib/interfaces'

/**
 * Implementacion de IHttpClient usando Axios.
 * Para cambiar a fetch nativo, got, etc., crear nuevo adapter.
 */
export class AxiosHttpClient implements IHttpClient {
  private client: AxiosInstance

  constructor(baseURL?: string, defaultHeaders?: Record<string, string>) {
    const config: Record<string, unknown> = {
      timeout: 60000, // 60 segundos por defecto
    }
    if (baseURL) config.baseURL = baseURL
    if (defaultHeaders) config.headers = defaultHeaders
    this.client = axios.create(config)
  }

  private buildConfig(options?: HttpRequestOptions): Record<string, unknown> {
    const config: Record<string, unknown> = {}
    if (options?.headers) config.headers = options.headers
    if (options?.timeout) config.timeout = options.timeout
    if (options?.params) config.params = options.params
    return config
  }

  private formatResponse<T>(response: AxiosResponse<T>): HttpResponse<T> {
    // Convertir headers de Axios a Record<string, string>
    const headers: Record<string, string> = {}
    if (response.headers) {
      Object.entries(response.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers[key] = value
        } else if (Array.isArray(value)) {
          headers[key] = value.join(', ')
        }
      })
    }
    return {
      data: response.data,
      status: response.status,
      headers,
    }
  }

  async get<T>(
    url: string,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>> {
    const response = await this.client.get<T>(url, this.buildConfig(options))
    return this.formatResponse(response)
  }

  async post<T>(
    url: string,
    data?: unknown,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>> {
    const response = await this.client.post<T>(
      url,
      data,
      this.buildConfig(options),
    )
    return this.formatResponse(response)
  }

  async put<T>(
    url: string,
    data?: unknown,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>> {
    const response = await this.client.put<T>(
      url,
      data,
      this.buildConfig(options),
    )
    return this.formatResponse(response)
  }

  async patch<T>(
    url: string,
    data?: unknown,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>> {
    const response = await this.client.patch<T>(
      url,
      data,
      this.buildConfig(options),
    )
    return this.formatResponse(response)
  }

  async delete<T>(
    url: string,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>> {
    const response = await this.client.delete<T>(url, this.buildConfig(options))
    return this.formatResponse(response)
  }
}
