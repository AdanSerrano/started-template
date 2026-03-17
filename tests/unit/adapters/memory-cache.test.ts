import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryCacheService } from '@/lib/adapters/memory-cache'

describe('MemoryCacheService', () => {
  let cache: MemoryCacheService

  beforeEach(() => {
    cache = new MemoryCacheService()
  })

  describe('get/set', () => {
    it('stores and retrieves a value', async () => {
      await cache.set('key1', 'value1')
      expect(await cache.get('key1')).toBe('value1')
    })

    it('returns null for non-existent key', async () => {
      expect(await cache.get('missing')).toBeNull()
    })

    it('stores objects', async () => {
      const obj = { name: 'test', count: 42 }
      await cache.set('obj', obj)
      expect(await cache.get('obj')).toEqual(obj)
    })

    it('overwrites existing key', async () => {
      await cache.set('key', 'old')
      await cache.set('key', 'new')
      expect(await cache.get('key')).toBe('new')
    })
  })

  describe('TTL', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns value before TTL expires', async () => {
      await cache.set('ttl', 'alive', 10)
      vi.advanceTimersByTime(5000)
      expect(await cache.get('ttl')).toBe('alive')
    })

    it('returns null after TTL expires', async () => {
      await cache.set('ttl', 'expired', 1)
      vi.advanceTimersByTime(1100)
      expect(await cache.get('ttl')).toBeNull()
    })

    it('exists returns false after TTL expires', async () => {
      await cache.set('ttl', 'value', 1)
      vi.advanceTimersByTime(1100)
      expect(await cache.exists('ttl')).toBe(false)
    })

    it('stores without TTL indefinitely', async () => {
      await cache.set('forever', 'value')
      vi.advanceTimersByTime(999_999_999)
      expect(await cache.get('forever')).toBe('value')
    })
  })

  describe('delete', () => {
    it('removes a key', async () => {
      await cache.set('key', 'value')
      await cache.delete('key')
      expect(await cache.get('key')).toBeNull()
    })

    it('removes hash data too', async () => {
      await cache.hset('key', 'field', 'value')
      await cache.delete('key')
      expect(await cache.hget('key', 'field')).toBeNull()
    })

    it('does not crash when deleting non-existent key', async () => {
      await cache.delete('non-existent')
    })
  })

  describe('exists', () => {
    it('returns true for existing key', async () => {
      await cache.set('key', 'value')
      expect(await cache.exists('key')).toBe(true)
    })

    it('returns false for missing key', async () => {
      expect(await cache.exists('missing')).toBe(false)
    })
  })

  describe('incr/decr', () => {
    it('increments from 0', async () => {
      expect(await cache.incr('counter')).toBe(1)
      expect(await cache.incr('counter')).toBe(2)
      expect(await cache.incr('counter')).toBe(3)
    })

    it('decrements from 0', async () => {
      expect(await cache.decr('counter')).toBe(-1)
      expect(await cache.decr('counter')).toBe(-2)
    })

    it('incr and decr work together', async () => {
      await cache.incr('counter')
      await cache.incr('counter')
      await cache.decr('counter')
      expect(await cache.get('counter')).toBe(1)
    })
  })

  describe('hash operations', () => {
    it('hset and hget work', async () => {
      await cache.hset('hash', 'field1', 'value1')
      expect(await cache.hget('hash', 'field1')).toBe('value1')
    })

    it('hget returns null for missing field', async () => {
      expect(await cache.hget('hash', 'missing')).toBeNull()
    })

    it('hgetall returns all fields', async () => {
      await cache.hset('hash', 'a', 1)
      await cache.hset('hash', 'b', 2)
      expect(await cache.hgetall('hash')).toEqual({ a: 1, b: 2 })
    })

    it('hgetall returns null for missing key', async () => {
      expect(await cache.hgetall('missing')).toBeNull()
    })
  })

  describe('expire', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('updates TTL on existing entry', async () => {
      await cache.set('key', 'value', 100)
      await cache.expire('key', 1)
      vi.advanceTimersByTime(1100)
      expect(await cache.get('key')).toBeNull()
    })

    it('does nothing for non-existent key', async () => {
      await cache.expire('missing', 10) // should not throw
    })
  })
})
