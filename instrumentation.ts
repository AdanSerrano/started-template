/**
 * Next.js Instrumentation Hook
 *
 * Se ejecuta una vez cuando el servidor Next.js inicia.
 * Inicializa monitoring, logging, y error tracking.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import type { Instrumentation } from 'next'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Inicializar Sentry si esta configurado
    if (process.env.SENTRY_DSN) {
      try {
        const Sentry = await import('@sentry/nextjs')
        Sentry.init({
          dsn: process.env.SENTRY_DSN,
          environment: process.env.NODE_ENV,
          tracesSampleRate: Number(
            process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1,
          ),
          debug: false,
        })
      } catch {
        console.warn('[instrumentation] Sentry not available, skipping init')
      }
    }
  }
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const err = error as Error & { digest?: string }
  const errorContext = {
    digest: err.digest,
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
  }

  // Log estructurado
  console.error(
    JSON.stringify({
      level: 'error',
      message: err.message,
      timestamp: new Date().toISOString(),
      ...errorContext,
    }),
  )

  // Reportar a Sentry si esta disponible
  if (process.env.SENTRY_DSN) {
    try {
      const Sentry = await import('@sentry/nextjs')
      Sentry.captureException(error, {
        extra: errorContext,
        tags: {
          routeType: context.routeType,
          renderSource: context.renderSource,
        },
      })
    } catch {
      // Sentry no disponible
    }
  }
}
