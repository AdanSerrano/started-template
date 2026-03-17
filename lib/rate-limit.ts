/**
 * In-memory sliding window rate limiter.
 *
 * No Redis/Upstash needed — uses a simple Map with periodic cleanup.
 * Suitable for single-instance deployments.
 *
 * Uses the SAME RateLimitConfig as IRateLimitService (limit + windowSeconds).
 */

import type { RateLimitConfig, RateLimitResult } from '@/lib/interfaces'

interface RateLimitEntry {
  count: number
  resetAt: number
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
  const windowMs = config.windowSeconds * 1000
  const entry = store.get(key)

  // First request or window expired — start fresh
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return {
      success: true,
      remaining: config.limit - 1,
      reset: now + windowMs,
      limit: config.limit,
    }
  }

  entry.count++

  // Over limit
  if (entry.count > config.limit) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetAt,
      limit: config.limit,
    }
  }

  return {
    success: true,
    remaining: config.limit - entry.count,
    reset: entry.resetAt,
    limit: config.limit,
  }
}

/**
 * Peek at current rate limit status without consuming an attempt.
 */
export function peekRateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    return {
      success: true,
      remaining: config.limit,
      reset: now + windowMs,
      limit: config.limit,
    }
  }

  return {
    success: entry.count <= config.limit,
    remaining: Math.max(0, config.limit - entry.count),
    reset: entry.resetAt,
    limit: config.limit,
  }
}

/**
 * Reset rate limit for a given key.
 */
export function resetRateLimit(key: string): void {
  store.delete(key)
}
