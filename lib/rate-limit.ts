/**
 * In-memory sliding window rate limiter.
 *
 * No Redis/Upstash needed — uses a simple Map with periodic cleanup.
 * Suitable for single-instance deployments.
 */

import type { RateLimitResult } from '@/lib/interfaces'

interface RateLimitEntry {
  count: number
  resetAt: number
}

export interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
if (typeof globalThis !== 'undefined') {
  const CLEANUP_INTERVAL_MS = 5 * 60 * 1000

  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key)
    }
  }, CLEANUP_INTERVAL_MS).unref?.()
}

/**
 * Check rate limit for a given key.
 * Consumes one attempt and returns the result.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  // First request or window expired — start fresh
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + config.windowMs })
    return {
      success: true,
      remaining: config.maxAttempts - 1,
      reset: now + config.windowMs,
      limit: config.maxAttempts,
    }
  }

  entry.count++

  // Over limit
  if (entry.count > config.maxAttempts) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetAt,
      limit: config.maxAttempts,
    }
  }

  return {
    success: true,
    remaining: config.maxAttempts - entry.count,
    reset: entry.resetAt,
    limit: config.maxAttempts,
  }
}

/**
 * Reset rate limit for a given key.
 */
export function resetRateLimit(key: string): void {
  store.delete(key)
}
