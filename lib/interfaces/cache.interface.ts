/**
 * Interface para servicios de cache.
 * Permite intercambiar la implementacion de cache sin tocar services.
 */
export interface ICache {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>
  delete(key: string): Promise<void>
  exists(key: string): Promise<boolean>
  incr(key: string): Promise<number>
  decr(key: string): Promise<number>
  hget<T>(key: string, field: string): Promise<T | null>
  hset<T>(key: string, field: string, value: T): Promise<void>
  hgetall<T>(key: string): Promise<Record<string, T> | null>
  expire(key: string, ttlSeconds: number): Promise<void>
}
