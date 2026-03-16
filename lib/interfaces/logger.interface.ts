/**
 * Interface para logging estructurado.
 * Permite cambiar console por Pino, Winston, etc. sin tocar services.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  [key: string]: unknown
}

export interface ILogger {
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, error?: Error, context?: LogContext): void

  /**
   * Crea un logger hijo con contexto adicional persistente.
   */
  child(context: LogContext): ILogger
}
