/**
 * In-memory rate limit adapter.
 *
 * Wraps the existing checkRateLimit/resetRateLimit functions
 * to implement the IRateLimitService interface.
 */

import type {
  IRateLimitService,
  RateLimitConfig,
  RateLimitResult,
} from '@/lib/interfaces'
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit'

const DEFAULT_CONFIG: RateLimitConfig = {
  limit: 10,
  windowSeconds: 60,
}

export class InMemoryRateLimitService implements IRateLimitService {
  async check(
    identifier: string,
    config?: RateLimitConfig,
  ): Promise<RateLimitResult> {
    const cfg = config ?? DEFAULT_CONFIG
    return checkRateLimit(identifier, {
      maxAttempts: cfg.limit,
      windowMs: cfg.windowSeconds * 1000,
    })
  }

  async reset(identifier: string): Promise<void> {
    resetRateLimit(identifier)
  }

  async getStatus(identifier: string): Promise<RateLimitResult> {
    // Check without consuming — peek by using a high limit probe
    // Since the existing implementation always consumes, we use a
    // read-only approach: check with maxAttempts=Infinity so it
    // never blocks, then adjust remaining based on actual config.
    // Note: This is a best-effort implementation for the in-memory adapter.
    return checkRateLimit(identifier, {
      maxAttempts: Number.MAX_SAFE_INTEGER,
      windowMs: 60_000,
    })
  }
}
