/**
 * Adapter de IAuthProvider usando Better Auth.
 * Para cambiar a Auth.js, Clerk, Lucia, etc., crear nuevo adapter.
 */
import { auth } from '@/lib/auth'
import type { IAuthProvider, AuthSessionData } from '@/lib/interfaces'

export class BetterAuthProvider implements IAuthProvider {
  async getSession(headers: Headers): Promise<AuthSessionData | null> {
    const session = await auth.api.getSession({ headers })
    return session as AuthSessionData | null
  }

  handler = auth.handler as (request: Request) => Promise<Response>
}
