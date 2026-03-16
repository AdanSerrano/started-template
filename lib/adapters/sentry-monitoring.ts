/**
 * Error monitoring adapter.
 *
 * Si SENTRY_DSN esta configurado, usa @sentry/nextjs.
 * Si no, fallback a console (desarrollo).
 */
import type { IErrorMonitoringService } from '@/lib/interfaces/error-monitoring.interface'

const hasSentry = !!process.env.SENTRY_DSN

async function getSentry() {
  if (!hasSentry) return null
  try {
    return await import('@sentry/nextjs')
  } catch {
    return null
  }
}

export class ConsoleMonitoringAdapter implements IErrorMonitoringService {
  captureException(error: Error, context?: Record<string, unknown>): void {
    if (hasSentry) {
      getSentry().then((Sentry) => {
        if (Sentry) {
          Sentry.captureException(error, context ? { extra: context } : {})
        }
      })
      return
    }
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
    if (hasSentry) {
      getSentry().then((Sentry) => {
        if (Sentry) {
          Sentry.captureMessage(message, level)
        }
      })
      return
    }
    const logger =
      level === 'info'
        ? console.info
        : level === 'warning'
          ? console.warn
          : console.error

    logger(`[ErrorMonitor] [${level}]`, message)
  }

  setUser(user: { id: string; email?: string } | null): void {
    if (hasSentry) {
      getSentry().then((Sentry) => {
        if (Sentry) {
          Sentry.setUser(user)
        }
      })
      return
    }
    console.debug('[ErrorMonitor] setUser', user?.id ?? 'null')
  }
}
