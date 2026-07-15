/**
 * Sentry — inicialización en el navegador (captura errores de cliente).
 * No-op si NEXT_PUBLIC_SENTRY_DSN no está configurado.
 *
 * Nota: incluir este archivo mete el SDK de Sentry en el bundle de cliente.
 * Si un proyecto no usa monitoring, puede borrar este archivo.
 */
import * as Sentry from '@sentry/nextjs'

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
  })
}

// Instrumenta las navegaciones del App Router (disponible desde SDK 9.12+).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
