/**
 * Interface para el proveedor de autenticacion.
 * Permite cambiar Better Auth por Auth.js, Clerk, Lucia, etc. sin tocar services.
 */

export interface AuthSessionData {
  session: {
    id: string
    userId: string
    expiresAt: Date
    [key: string]: unknown
  }
  user: {
    id: string
    name: string
    email: string
    image?: string | null
    role?: string
    [key: string]: unknown
  }
}

export interface IAuthProvider {
  /**
   * Obtiene la sesion actual a partir de los headers del request.
   */
  getSession(headers: Headers): Promise<AuthSessionData | null>

  /**
   * Handler para el catch-all route de auth (/api/auth/[...all]).
   */
  handler: (request: Request) => Promise<Response>
}
