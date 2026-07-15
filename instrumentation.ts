/**
 * Next.js Instrumentation Hook
 *
 * Inicializa Sentry por runtime (node/edge) y captura errores de request con
 * logging estructurado. Todo es no-op si SENTRY_DSN no está configurado.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import * as Sentry from '@sentry/nextjs'
import type { Instrumentation } from 'next'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export const onRequestError: Instrumentation.onRequestError = (
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

  // Log estructurado (siempre).
  console.error(
    JSON.stringify({
      level: 'error',
      message: err.message,
      timestamp: new Date().toISOString(),
      ...errorContext,
    }),
  )

  // Reportar a Sentry si está inicializado (no-op sin DSN).
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: errorContext,
      tags: {
        routeType: context.routeType,
        renderSource: context.renderSource,
      },
    })
  }
}
