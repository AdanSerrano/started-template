/**
 * Interface para servicios de monitoreo de errores.
 * Permite cambiar Sentry por Datadog, Bugsnag, etc. sin tocar services.
 */
export interface IErrorMonitoringService {
  captureException(error: Error, context?: Record<string, unknown>): void

  captureMessage(message: string, level?: 'info' | 'warning' | 'error'): void

  setUser(user: { id: string; email?: string } | null): void
}
