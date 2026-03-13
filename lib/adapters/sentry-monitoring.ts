import type { IErrorMonitoringService } from '@/lib/interfaces/error-monitoring.interface'

const isDev = process.env.NODE_ENV !== 'production'

/**
 * Implementacion de IErrorMonitoringService usando Sentry.
 * Para cambiar a Datadog, Bugsnag, etc., crear nuevo adapter.
 *
 * TODO: Reemplazar console fallbacks con @sentry/nextjs cuando se instale.
 */
export class SentryMonitoringAdapter implements IErrorMonitoringService {
  captureException(error: Error, context?: Record<string, unknown>): void {
    if (isDev) {
      console.error('[Error Monitor]', error.message, context)
      return
    }

    // TODO: Replace with Sentry.captureException(error, { extra: context })
    console.error('[Error Monitor]', error.message, context)
  }

  captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'error',
  ): void {
    if (isDev) {
      console.error(`[Error Monitor] [${level}]`, message)
      return
    }

    // TODO: Replace with Sentry.captureMessage(message, level)
    console.error(`[Error Monitor] [${level}]`, message)
  }

  setUser(user: { id: string; email?: string } | null): void {
    if (isDev) {
      console.debug('[Error Monitor] setUser', user)
      return
    }

    // TODO: Replace with Sentry.setUser(user)
  }
}
