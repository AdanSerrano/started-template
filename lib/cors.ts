/**
 * CORS helper para API routes.
 *
 * Uso en route handlers:
 *   import { corsHeaders, handleCorsPreflight } from '@/lib/cors'
 *
 *   export function OPTIONS(request: Request) {
 *     return handleCorsPreflight(request)
 *   }
 *
 *   export function GET() {
 *     return Response.json(data, { headers: corsHeaders() })
 *   }
 */

const ALLOWED_ORIGINS = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : []

const ALLOWED_METHODS = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
const ALLOWED_HEADERS = 'Content-Type, Authorization, X-Requested-With'
const MAX_AGE = '86400' // 24h

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  if (ALLOWED_ORIGINS.length === 0) return false
  if (ALLOWED_ORIGINS.includes('*')) return true
  return ALLOWED_ORIGINS.includes(origin)
}

export function corsHeaders(requestOrigin?: string | null): HeadersInit {
  const origin = requestOrigin ?? ''
  const allowed = isOriginAllowed(origin)

  if (!allowed) return {}

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': ALLOWED_METHODS,
    'Access-Control-Allow-Headers': ALLOWED_HEADERS,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': MAX_AGE,
  }
}

export function handleCorsPreflight(request: Request): Response {
  const origin = request.headers.get('origin')

  if (!isOriginAllowed(origin)) {
    return new Response(null, { status: 403 })
  }

  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  })
}
