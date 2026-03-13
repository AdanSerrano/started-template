import { NextRequest, NextResponse } from 'next/server'
import { getAuthSecurityService } from '@/modules/auth/services/auth-security-service'
import { userRepository } from '@/modules/auth/repositories'
import { headers } from 'next/headers'

const RATE_LIMITED_PATHS = {
  '/api/auth/sign-in/email': 'login',
  '/api/auth/sign-in/username': 'login',
  '/api/auth/sign-up/email': 'register',
  '/api/auth/forget-password': 'resetPassword',
  '/api/auth/magic-link': 'magicLink',
} as const

type RateLimitType =
  (typeof RATE_LIMITED_PATHS)[keyof typeof RATE_LIMITED_PATHS]

export type LockCheckResult = {
  locked: boolean
  userId: string | null
  message?: string
  minutesRemaining?: number
}

export async function getClientIP(): Promise<string> {
  const headersList = await headers()
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    'unknown'
  )
}

export async function extractCredentialsFromRequest(
  request: NextRequest,
): Promise<{ email?: string; username?: string } | null> {
  try {
    const clonedRequest = request.clone()
    const body = await clonedRequest.json()
    return {
      email: body?.email?.toLowerCase()?.trim(),
      username: body?.username?.toLowerCase()?.trim(),
    }
  } catch {
    return null
  }
}

export async function applyRateLimit(
  type: RateLimitType,
  request: NextRequest,
): Promise<{ allowed: boolean; response?: NextResponse }> {
  const security = getAuthSecurityService()
  const ip = await getClientIP()

  let result

  switch (type) {
    case 'login':
      result = await security.checkLoginRateLimit(ip)
      break
    case 'register':
      result = await security.checkRegisterRateLimit(ip)
      break
    case 'resetPassword': {
      const creds = await extractCredentialsFromRequest(request)
      if (!creds?.email) return { allowed: true }
      result = await security.checkResetPasswordRateLimit(creds.email)
      break
    }
    case 'magicLink': {
      const creds = await extractCredentialsFromRequest(request)
      if (!creds?.email) return { allowed: true }
      result = await security.checkMagicLinkRateLimit(creds.email)
      break
    }
    default:
      return { allowed: true }
  }

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000)
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: 'Too many attempts. Please wait before trying again.',
          retryAfter,
          code: 'RATE_LIMIT_EXCEEDED',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': String(result.reset),
          },
        },
      ),
    }
  }

  return { allowed: true }
}

export async function checkAccountLockByEmail(
  email: string,
): Promise<LockCheckResult> {
  try {
    const userId = await userRepository.findIdByEmail(email)
    if (!userId) return { locked: false, userId: null }
    return checkAccountLockStatus(userId)
  } catch (error) {
    console.error('[Auth] Error checking account lock by email:', error)
    return { locked: false, userId: null }
  }
}

export async function checkAccountLockByUsername(
  username: string,
): Promise<LockCheckResult> {
  try {
    const userId = await userRepository.findIdByUsername(username)
    if (!userId) return { locked: false, userId: null }
    return checkAccountLockStatus(userId)
  } catch (error) {
    console.error('[Auth] Error checking account lock by username:', error)
    return { locked: false, userId: null }
  }
}

async function checkAccountLockStatus(
  userId: string,
): Promise<LockCheckResult> {
  const security = getAuthSecurityService()
  const status = await security.checkLockStatus(userId)

  if (status.locked) {
    return {
      locked: true,
      userId,
      message: `Account temporarily locked. Try again in ${status.minutesRemaining} minutes.`,
      minutesRemaining: status.minutesRemaining,
    }
  }

  return { locked: false, userId }
}

export async function handleFailedLogin(
  userId: string,
): Promise<{ locked: boolean; attempts: number } | null> {
  try {
    const security = getAuthSecurityService()
    return await security.recordFailedLogin(userId)
  } catch {
    return null
  }
}

export function getRateLimitType(pathname: string): RateLimitType | undefined {
  return RATE_LIMITED_PATHS[pathname as keyof typeof RATE_LIMITED_PATHS]
}
