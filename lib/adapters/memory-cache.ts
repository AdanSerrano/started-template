import type { ICache } from '@/lib/interfaces'

interface CacheEntry<T = unknown> {
  value: T
  expiresAt: number | null
}

/** Implementacion de ICache usando Map en memoria con TTL. */
export class MemoryCacheService implements ICache {
  private store = new Map<string, CacheEntry>()
  private hashes = new Map<string, Map<string, unknown>>()

  private isExpired(entry: CacheEntry): boolean {
    return entry.expiresAt !== null && Date.now() > entry.expiresAt
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key)
    if (!entry || this.isExpired(entry)) {
      this.store.delete(key)
      return null
    }
    return entry.value as T
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null
    this.store.set(key, { value, expiresAt })
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
    this.hashes.delete(key)
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.store.get(key)
    if (!entry || this.isExpired(entry)) {
      this.store.delete(key)
      return false
    }
    return true
  }

  async incr(key: string): Promise<number> {
    const current = ((await this.get<number>(key)) ?? 0) + 1
    await this.set(key, current)
    return current
  }

  async decr(key: string): Promise<number> {
    const current = ((await this.get<number>(key)) ?? 0) - 1
    await this.set(key, current)
    return current
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    return (this.hashes.get(key)?.get(field) as T) ?? null
  }

  async hset<T>(key: string, field: string, value: T): Promise<void> {
    if (!this.hashes.has(key)) this.hashes.set(key, new Map())
    this.hashes.get(key)!.set(field, value)
  }

  async hgetall<T>(key: string): Promise<Record<string, T> | null> {
    const hash = this.hashes.get(key)
    if (!hash || hash.size === 0) return null
    return Object.fromEntries(hash) as Record<string, T>
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    const entry = this.store.get(key)
    if (entry) {
      entry.expiresAt = Date.now() + ttlSeconds * 1000
    }
  }
}
