/**
 * Auth Account Lock utilities.
 *
 * Rate limiting ahora lo maneja Better Auth built-in (config en lib/auth.ts).
 * Este archivo solo maneja account locking por intentos fallidos via DB.
 */

import { NextRequest } from 'next/server'
import { getAuthSecurityService } from '@/modules/auth/services/auth-security-service'
import { userRepository } from '@/modules/auth/repositories'

export type LockCheckResult = {
  locked: boolean
  userId: string | null
  message?: string
  minutesRemaining?: number
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
      message: `Cuenta bloqueada temporalmente. Intenta de nuevo en ${status.minutesRemaining} minutos.`,
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
