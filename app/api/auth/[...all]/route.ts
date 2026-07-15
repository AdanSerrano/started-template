/**
 * API Route: /api/auth/[...all]
 *
 * Better Auth handler con:
 * - Rate limiting built-in (configurado en lib/auth.ts, in-memory)
 * - Account locking por intentos fallidos (via DB)
 */

import { toNextJsHandler } from 'better-auth/next-js'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  checkAccountLockByEmail,
  checkAccountLockByUsername,
  extractCredentials,
  handleFailedLogin,
} from '@/modules/auth/services/auth-rate-limit'

const LOGIN_PATHS = ['/api/auth/sign-in/email', '/api/auth/sign-in/username']

async function handleLogin(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<Response>,
): Promise<Response> {
  const pathname = request.nextUrl.pathname
  const isEmailLogin = pathname === '/api/auth/sign-in/email'
  const isLoginRequest = LOGIN_PATHS.includes(pathname)

  if (!isLoginRequest || request.method !== 'POST') {
    return handler(request)
  }

  // Check account lock before attempting login
  let body: Record<string, unknown> = {}
  try {
    body = await request.clone().json()
  } catch {
    // If body parsing fails, continue without credentials
  }
  const creds = extractCredentials(body)
  let userId: string | null = null

  if (creds?.email || creds?.username) {
    const lockCheck =
      isEmailLogin && creds.email
        ? await checkAccountLockByEmail(creds.email)
        : await checkAccountLockByUsername(creds.username!)

    if (lockCheck.locked) {
      return NextResponse.json(
        {
          message: lockCheck.message,
          code: 'ACCOUNT_LOCKED',
          minutesRemaining: lockCheck.minutesRemaining,
        },
        { status: 423 },
      )
    }

    userId = lockCheck.userId
  }

  const response = await handler(request)

  // Solo 401 = credenciales inválidas. Contar cualquier 4xx (429 rate-limit,
  // 422 validación, 403 email sin verificar) permitiría a un tercero que
  // conoce el email bloquear la cuenta de la víctima (DoS).
  if (userId && response.status === 401) {
    const lockResult = await handleFailedLogin(userId)

    if (lockResult?.locked) {
      return NextResponse.json(
        {
          message:
            'Cuenta bloqueada por demasiados intentos fallidos. Intenta de nuevo en 15 minutos.',
          code: 'ACCOUNT_LOCKED',
          minutesRemaining: 15,
        },
        { status: 423 },
      )
    }
  }

  return response
}

const { POST: betterAuthPOST, GET: betterAuthGET } = toNextJsHandler(auth)

export async function POST(request: NextRequest) {
  return handleLogin(
    request,
    betterAuthPOST as (req: NextRequest) => Promise<Response>,
  )
}

export async function GET(request: NextRequest) {
  return betterAuthGET(request)
}
