/**
 * In-memory rate limit adapter.
 *
 * Wraps the standalone checkRateLimit/resetRateLimit/peekRateLimit functions
 * to implement the IRateLimitService interface.
 */

import type {
  IRateLimitService,
  RateLimitConfig,
  RateLimitResult,
} from '@/lib/interfaces'
import { checkRateLimit, resetRateLimit, peekRateLimit } from '@/lib/rate-limit'

const DEFAULT_CONFIG: RateLimitConfig = {
  limit: 10,
  windowSeconds: 60,
}

export class InMemoryRateLimitService implements IRateLimitService {
  async check(
    identifier: string,
    config?: RateLimitConfig,
  ): Promise<RateLimitResult> {
    return checkRateLimit(identifier, config ?? DEFAULT_CONFIG)
  }

  async reset(identifier: string): Promise<void> {
    resetRateLimit(identifier)
  }

  async getStatus(
    identifier: string,
    config?: RateLimitConfig,
  ): Promise<RateLimitResult> {
    return peekRateLimit(identifier, config ?? DEFAULT_CONFIG)
  }
}
