/**
 * Utilidad estandarizada para respuestas de API routes.
 *
 * Uso en route handlers:
 *   import { apiSuccess, apiError, apiNotFound } from '@/lib/api-response'
 *
 *   export async function GET() {
 *     const data = await getItems()
 *     return apiSuccess(data)
 *   }
 */

interface ApiResponseOptions {
  headers?: HeadersInit
  status?: number
}

export function apiSuccess<T>(data: T, options?: ApiResponseOptions) {
  const init: ResponseInit = { status: options?.status ?? 200 }
  if (options?.headers) init.headers = options.headers
  return Response.json({ success: true, data }, init)
}

export function apiError(
  message: string,
  status = 500,
  options?: {
    code?: string
    details?: Record<string, unknown>
    headers?: HeadersInit
  },
) {
  const body: Record<string, unknown> = { success: false, error: message }
  if (options?.code) body.code = options.code
  if (options?.details) body.details = options.details

  const init: ResponseInit = { status }
  if (options?.headers) init.headers = options.headers
  return Response.json(body, init)
}

export function apiNotFound(entity = 'Resource') {
  return apiError(`${entity} not found`, 404, { code: 'NOT_FOUND' })
}

export function apiUnauthorized(message = 'No autorizado') {
  return apiError(message, 401, { code: 'UNAUTHORIZED' })
}

export function apiRateLimited(retryAfterSeconds: number) {
  return apiError('Demasiadas solicitudes', 429, {
    code: 'RATE_LIMIT_EXCEEDED',
    headers: { 'Retry-After': String(retryAfterSeconds) },
  })
}
