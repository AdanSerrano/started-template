/**
 * Pino structured logger adapter.
 *
 * - JSON en produccion, pretty en desarrollo
 * - Incluye requestId automaticamente via AsyncLocalStorage
 * - Maneja error objects con stack traces
 */

import type { ILogger, LogContext } from '@/lib/interfaces'
import { getRequestId } from '@/lib/request-context'
import pino from 'pino'

const isDev = process.env.NODE_ENV !== 'production'

function createPinoInstance(baseContext: LogContext = {}) {
  const options: pino.LoggerOptions = {
    level: isDev ? 'debug' : 'info',
    base: Object.keys(baseContext).length > 0 ? baseContext : null,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { level: label }
      },
    },
  }
  if (isDev) {
    options.transport = { target: 'pino-pretty', options: { colorize: true } }
  }
  return pino(options)
}

export class PinoLogger implements ILogger {
  private logger: pino.Logger

  constructor(context: LogContext = {}) {
    this.logger = createPinoInstance(context)
  }

  private enrich(context?: LogContext): LogContext {
    const requestId = getRequestId()
    return {
      ...(requestId ? { requestId } : {}),
      ...context,
    }
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(this.enrich(context), message)
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(this.enrich(context), message)
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(this.enrich(context), message)
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const enriched = this.enrich(context)
    if (error) {
      this.logger.error({ ...enriched, err: error }, message)
    } else {
      this.logger.error(enriched, message)
    }
  }

  child(context: LogContext): ILogger {
    const childLogger = new PinoLogger()
    childLogger.logger = this.logger.child(context)
    return childLogger
  }
}
