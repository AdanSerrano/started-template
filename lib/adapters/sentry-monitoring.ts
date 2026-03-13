import type { IErrorMonitoringService } from '@/lib/interfaces/error-monitoring.interface'

/**
 * Fallback de desarrollo para error monitoring.
 * Usa console.error/warn/debug para logging estructurado.
 *
 * Para produccion, reemplazar con un adapter real:
 * - SentryMonitoringAdapter (@sentry/nextjs)
 * - DatadogMonitoringAdapter
 * - BugsnagMonitoringAdapter
 */
export class ConsoleMonitoringAdapter implements IErrorMonitoringService {
  captureException(error: Error, context?: Record<string, unknown>): void {
    console.error(
      `[ErrorMonitor] ${error.name}: ${error.message}`,
      context ?? {},
      error.stack,
    )
  }

  captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'error',
  ): void {
    const logger =
      level === 'info'
        ? console.info
        : level === 'warning'
          ? console.warn
          : console.error

    logger(`[ErrorMonitor] [${level}]`, message)
  }

  setUser(user: { id: string; email?: string } | null): void {
    console.debug('[ErrorMonitor] setUser', user?.id ?? 'null')
  }
}
