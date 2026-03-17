/**
 * Rate limit — unified configuration and result types.
 *
 * BOTH the interface (IRateLimitService) and the standalone
 * helpers (checkRateLimit) share the SAME RateLimitConfig.
 */

export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number // timestamp in ms
  limit: number
}

export interface RateLimitConfig {
  /** Maximum requests allowed within the window. */
  limit: number
  /** Time window in seconds. */
  windowSeconds: number
}

/**
 * Rate limiting service — swap in-memory for Upstash/Redis in production.
 */
export interface IRateLimitService {
  /**
   * Check and consume one request for the given identifier.
   * @param identifier Unique key (e.g. IP, userId, `module:action:userId`)
   * @param config Override defaults (10 req / 60s)
   */
  check(identifier: string, config?: RateLimitConfig): Promise<RateLimitResult>

  /** Reset the counter for a given identifier. */
  reset(identifier: string): Promise<void>

  /** Peek at current status without consuming a request. */
  getStatus(
    identifier: string,
    config?: RateLimitConfig,
  ): Promise<RateLimitResult>
}
