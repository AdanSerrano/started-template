import { describe, it, expect } from 'vitest'
import {
  generateRequestId,
  getRequestId,
  getRequestContext,
  withRequestContext,
} from '@/lib/request-context'

describe('generateRequestId', () => {
  it('returns an 8-character string', () => {
    const id = generateRequestId()
    expect(id).toHaveLength(8)
    expect(typeof id).toBe('string')
  })

  it('generates unique ids', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateRequestId()))
    expect(ids.size).toBe(100)
  })
})

describe('getRequestId', () => {
  it('returns undefined outside of context', () => {
    expect(getRequestId()).toBeUndefined()
  })
})

describe('getRequestContext', () => {
  it('returns undefined outside of context', () => {
    expect(getRequestContext()).toBeUndefined()
  })
})

describe('withRequestContext', () => {
  it('makes requestId available via getRequestId', () => {
    const context = { requestId: 'abc12345' }
    withRequestContext(context, () => {
      expect(getRequestId()).toBe('abc12345')
    })
  })

  it('makes full context available via getRequestContext', () => {
    const context = { requestId: 'ctx-001', userId: 'user-1' }
    withRequestContext(context, () => {
      const ctx = getRequestContext()
      expect(ctx).toEqual({ requestId: 'ctx-001', userId: 'user-1' })
    })
  })

  it('returns the result of the callback', () => {
    const result = withRequestContext({ requestId: 'test' }, () => 42)
    expect(result).toBe(42)
  })

  it('context is unavailable after withRequestContext completes', () => {
    withRequestContext({ requestId: 'temp' }, () => {
      expect(getRequestId()).toBe('temp')
    })
    expect(getRequestId()).toBeUndefined()
  })

  it('supports nested contexts with isolation', () => {
    withRequestContext({ requestId: 'outer' }, () => {
      expect(getRequestId()).toBe('outer')
      withRequestContext({ requestId: 'inner' }, () => {
        expect(getRequestId()).toBe('inner')
      })
      expect(getRequestId()).toBe('outer')
    })
  })

  it('supports async callbacks', async () => {
    const result = await withRequestContext(
      { requestId: 'async-1' },
      async () => {
        expect(getRequestId()).toBe('async-1')
        return 'done'
      },
    )
    expect(result).toBe('done')
  })
})
