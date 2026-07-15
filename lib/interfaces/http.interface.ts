/**
 * Opciones para una peticion HTTP.
 */
export interface HttpRequestOptions {
  headers?: Record<string, string>
  timeout?: number
  params?: Record<string, string | number | boolean>
  /**
   * Reintentos ante errores transitorios (red, 429, 5xx) con backoff+jitter.
   * Default: 2 en métodos idempotentes (GET/DELETE), 0 en mutaciones.
   */
  retries?: number
}

/**
 * Respuesta de una peticion HTTP.
 */
export interface HttpResponse<T> {
  data: T
  status: number
  headers: Record<string, string>
}

/**
 * Interface para servicios de HTTP.
 * Permite cambiar fetch por axios, got, etc. sin tocar services.
 */
export interface IHttpClient {
  /**
   * Realiza una peticion GET.
   */
  get<T>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>

  /**
   * Realiza una peticion POST.
   */
  post<T>(
    url: string,
    data?: unknown,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>>

  /**
   * Realiza una peticion PUT.
   */
  put<T>(
    url: string,
    data?: unknown,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>>

  /**
   * Realiza una peticion PATCH.
   */
  patch<T>(
    url: string,
    data?: unknown,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>>

  /**
   * Realiza una peticion DELETE.
   */
  delete<T>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>
}
