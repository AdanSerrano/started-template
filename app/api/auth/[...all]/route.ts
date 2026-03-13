/**
 * API Route: /api/auth/[...all]
 *
 * Better Auth handler with rate limiting per operation.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'
import {
  applyRateLimit,
  checkAccountLockByEmail,
  checkAccountLockByUsername,
  extractCredentialsFromRequest,
  getRateLimitType,
  handleFailedLogin,
} from '@/modules/auth/services/auth-rate-limit'

async function handleWithRateLimit(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<Response>,
): Promise<Response> {
  const pathname = request.nextUrl.pathname
  const rateLimitType = getRateLimitType(pathname)

  if (rateLimitType && request.method === 'POST') {
    const { allowed, response } = await applyRateLimit(rateLimitType, request)
    if (!allowed && response) return response
  }

  const isEmailLogin = pathname === '/api/auth/sign-in/email'
  const isUsernameLogin = pathname === '/api/auth/sign-in/username'
  const isLoginRequest = isEmailLogin || isUsernameLogin
  let userId: string | null = null

  if (isLoginRequest) {
    const creds = await extractCredentialsFromRequest(request)

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
  }

  const response = await handler(request)

  if (
    isLoginRequest &&
    userId &&
    response.status >= 400 &&
    response.status < 500
  ) {
    const lockResult = await handleFailedLogin(userId)

    if (lockResult?.locked) {
      return NextResponse.json(
        {
          message:
            'Account locked due to too many failed attempts. Try again in 15 minutes.',
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
  return handleWithRateLimit(
    request,
    betterAuthPOST as (req: NextRequest) => Promise<Response>,
  )
}

export async function GET(request: NextRequest) {
  return betterAuthGET(request)
}
