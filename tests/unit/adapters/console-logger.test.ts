import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ConsoleLogger } from '@/lib/adapters/console-logger'

describe('ConsoleLogger', () => {
  let debugSpy: ReturnType<typeof vi.spyOn>
  let infoSpy: ReturnType<typeof vi.spyOn>
  let warnSpy: ReturnType<typeof vi.spyOn>
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('debug() calls console.debug with JSON', () => {
    const logger = new ConsoleLogger({}, 'debug')
    logger.debug('test message', { key: 'value' })
    expect(debugSpy).toHaveBeenCalledOnce()
    const parsed = JSON.parse(debugSpy.mock.calls[0][0] as string)
    expect(parsed.level).toBe('debug')
    expect(parsed.message).toBe('test message')
    expect(parsed.key).toBe('value')
    expect(parsed.timestamp).toBeDefined()
  })

  it('info() calls console.info', () => {
    const logger = new ConsoleLogger({}, 'debug')
    logger.info('info msg')
    expect(infoSpy).toHaveBeenCalledOnce()
    const parsed = JSON.parse(infoSpy.mock.calls[0][0] as string)
    expect(parsed.level).toBe('info')
    expect(parsed.message).toBe('info msg')
  })

  it('warn() calls console.warn', () => {
    const logger = new ConsoleLogger({}, 'debug')
    logger.warn('warn msg')
    expect(warnSpy).toHaveBeenCalledOnce()
  })

  it('error() calls console.error', () => {
    const logger = new ConsoleLogger({}, 'debug')
    logger.error('error msg')
    expect(errorSpy).toHaveBeenCalledOnce()
  })

  describe('minLevel filtering', () => {
    it('info level skips debug', () => {
      const logger = new ConsoleLogger({}, 'info')
      logger.debug('should be skipped')
      logger.info('should appear')
      expect(debugSpy).not.toHaveBeenCalled()
      expect(infoSpy).toHaveBeenCalledOnce()
    })

    it('warn level skips debug and info', () => {
      const logger = new ConsoleLogger({}, 'warn')
      logger.debug('skip')
      logger.info('skip')
      logger.warn('show')
      expect(debugSpy).not.toHaveBeenCalled()
      expect(infoSpy).not.toHaveBeenCalled()
      expect(warnSpy).toHaveBeenCalledOnce()
    })

    it('error level only shows errors', () => {
      const logger = new ConsoleLogger({}, 'error')
      logger.debug('skip')
      logger.info('skip')
      logger.warn('skip')
      logger.error('show')
      expect(debugSpy).not.toHaveBeenCalled()
      expect(infoSpy).not.toHaveBeenCalled()
      expect(warnSpy).not.toHaveBeenCalled()
      expect(errorSpy).toHaveBeenCalledOnce()
    })
  })

  describe('child()', () => {
    it('creates a new logger with merged context', () => {
      const parent = new ConsoleLogger({ module: 'auth' }, 'debug')
      const child = parent.child({ requestId: 'req-1' })
      child.info('child log')
      const parsed = JSON.parse(infoSpy.mock.calls[0][0] as string)
      expect(parsed.module).toBe('auth')
      expect(parsed.requestId).toBe('req-1')
    })

    it('child does not modify parent context', () => {
      const parent = new ConsoleLogger({ module: 'auth' }, 'debug')
      parent.child({ extra: 'data' })
      parent.info('parent log')
      const parsed = JSON.parse(infoSpy.mock.calls[0][0] as string)
      expect(parsed.extra).toBeUndefined()
    })
  })

  describe('error with Error object', () => {
    it('includes error details in output', () => {
      const logger = new ConsoleLogger({}, 'debug')
      const err = new Error('Something broke')
      logger.error('Operation failed', err, { op: 'test' })
      const parsed = JSON.parse(errorSpy.mock.calls[0][0] as string)
      expect(parsed.error.name).toBe('Error')
      expect(parsed.error.message).toBe('Something broke')
      expect(parsed.error.stack).toBeDefined()
      expect(parsed.op).toBe('test')
    })
  })
})
