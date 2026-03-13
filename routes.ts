/**
 * Rutas publicas — accesibles sin autenticacion.
 */
export const publicRoutes = ['/']

/**
 * Rutas de autenticacion — accesibles solo sin sesion activa.
 * Si el usuario ya esta autenticado, redirige a DEFAULT_LOGIN_REDIRECT.
 */
export const authRoutes = [
  '/login',
  '/login/two-factor',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
]

/**
 * Prefijo de la API de autenticacion — Better Auth catch-all.
 * Nunca debe ser bloqueado por middleware.
 */
export const apiAuthPrefix = '/api/auth'

/**
 * Redirect por defecto despues de iniciar sesion.
 */
export const DEFAULT_LOGIN_REDIRECT = '/account'

/**
 * Redirect cuando no esta autenticado.
 */
export const DEFAULT_LOGOUT_REDIRECT = '/login'
