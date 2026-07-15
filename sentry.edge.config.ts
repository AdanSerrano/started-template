/**
 * Sentry — inicialización del runtime Edge (middleware/proxy.ts corre aquí).
 * No-op si SENTRY_DSN no está configurado.
 */
import * as Sentry from '@sentry/nextjs'

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    debug: false,
  })
}
