import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { auth } from '@/lib/auth'

/**
 * Get the current session on the server.
 *
 * Uses React cache() to dedupe requests within a single render.
 * With cookie cache enabled, this reads from the signed cookie
 * instead of hitting the database (much faster).
 *
 * Call this in Server Components, Server Actions, or Route Handlers.
 *
 * @example
 * ```tsx
 * // In a Server Component
 * const session = await getServerSession()
 * if (session) {
 *   return <Dashboard user={session.user} />
 * }
 * ```
 */
export const getServerSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session
})

/**
 * Require authentication - redirects to login if not authenticated.
 *
 * Use this at the top of protected Server Components or Server Actions.
 *
 * @param redirectTo - Where to redirect if not authenticated (default: /login)
 * @returns The authenticated session (never null)
 *
 * @example
 * ```tsx
 * // In a protected Server Component
 * export default async function DashboardPage() {
 *   const session = await requireAuth()
 *   return <Dashboard user={session.user} />
 * }
 * ```
 */
export async function requireAuth(redirectTo = '/login') {
  const session = await getServerSession()

  if (!session) {
    redirect(redirectTo)
  }

  return session
}

/**
 * Get user from session with role check.
 *
 * @param allowedRoles - Array of allowed roles
 * @param redirectTo - Where to redirect if not authorized
 * @returns The authenticated session
 *
 * @example
 * ```tsx
 * // Only allow admins
 * const session = await requireRole(['super_admin', 'admin'])
 * ```
 */
export async function requireRole(
  allowedRoles: ('super_admin' | 'admin' | 'user')[],
  redirectTo = '/account',
) {
  const session = await requireAuth()

  const userRole = (session.user as { role?: string }).role

  if (
    !userRole ||
    !allowedRoles.includes(userRole as (typeof allowedRoles)[number])
  ) {
    redirect(redirectTo)
  }

  return session
}

/**
 * Type for the session returned by getServerSession.
 * Use this to type props that receive session from Server Components.
 */
export type ServerSession = Awaited<ReturnType<typeof getServerSession>>

/**
 * Type for non-null session (after requireAuth).
 */
export type AuthenticatedSession = NonNullable<ServerSession>
