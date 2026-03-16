/**
 * Implementacion de ILogger con console y JSON estructurado.
 * Para produccion, crear PinoLogger o similar.
 */
import type { ILogger, LogContext, LogLevel } from '@/lib/interfaces'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

export class ConsoleLogger implements ILogger {
  private context: LogContext
  private minLevel: LogLevel

  constructor(context: LogContext = {}, minLevel?: LogLevel) {
    this.context = context
    this.minLevel =
      minLevel ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel]
  }

  private format(level: LogLevel, message: string, extra?: LogContext) {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...this.context,
      ...extra,
    }
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return
    console.debug(JSON.stringify(this.format('debug', message, context)))
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return
    console.info(JSON.stringify(this.format('info', message, context)))
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return
    console.warn(JSON.stringify(this.format('warn', message, context)))
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog('error')) return
    const extra: LogContext = { ...context }
    if (error) {
      extra.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }
    console.error(JSON.stringify(this.format('error', message, extra)))
  }

  child(context: LogContext): ILogger {
    return new ConsoleLogger({ ...this.context, ...context }, this.minLevel)
  }
}
