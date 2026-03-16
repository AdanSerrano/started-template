/**
 * Upstash Redis rate limit adapter.
 *
 * Distribuido — funciona en multi-instancia (Vercel, Docker, etc.).
 * Requiere: @upstash/ratelimit + @upstash/redis
 *
 * Fail-open: si Redis no responde, permite el request.
 */

import type {
  IRateLimitService,
  RateLimitConfig,
  RateLimitResult,
} from '@/lib/interfaces'

const DEFAULT_CONFIG: RateLimitConfig = {
  limit: 10,
  windowSeconds: 60,
}

export class UpstashRateLimitService implements IRateLimitService {
  private redis: InstanceType<typeof import('@upstash/redis').Redis> | null =
    null
  private limiters = new Map<
    string,
    InstanceType<typeof import('@upstash/ratelimit').Ratelimit>
  >()

  private async getRedis() {
    if (this.redis) return this.redis
    const { Redis } = await import('@upstash/redis')
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    return this.redis
  }

  private async getLimiter(config: RateLimitConfig) {
    const key = `${config.limit}:${config.windowSeconds}`
    if (this.limiters.has(key)) return this.limiters.get(key)!

    const { Ratelimit } = await import('@upstash/ratelimit')
    const redis = await this.getRedis()
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        config.limit,
        `${config.windowSeconds} s`,
      ),
      analytics: false,
      prefix: 'rl',
    })
    this.limiters.set(key, limiter)
    return limiter
  }

  async check(
    identifier: string,
    config?: RateLimitConfig,
  ): Promise<RateLimitResult> {
    const cfg = config ?? DEFAULT_CONFIG
    try {
      const limiter = await this.getLimiter(cfg)
      const result = await limiter.limit(identifier)
      return {
        success: result.success,
        remaining: result.remaining,
        reset: result.reset,
        limit: cfg.limit,
      }
    } catch {
      // Fail-open: si Redis falla, permitir el request
      return {
        success: true,
        remaining: cfg.limit,
        reset: Date.now() + cfg.windowSeconds * 1000,
        limit: cfg.limit,
      }
    }
  }

  async reset(identifier: string): Promise<void> {
    try {
      const redis = await this.getRedis()
      const keys = await redis.keys(`rl:${identifier}:*`)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch {
      // Silently fail — reset is best-effort
    }
  }

  async getStatus(
    identifier: string,
    config?: RateLimitConfig,
  ): Promise<RateLimitResult> {
    const cfg = config ?? DEFAULT_CONFIG
    try {
      const limiter = await this.getLimiter(cfg)
      const result = await limiter.getRemaining(identifier)
      return {
        success: result.remaining > 0,
        remaining: result.remaining,
        reset: result.reset,
        limit: cfg.limit,
      }
    } catch {
      return {
        success: true,
        remaining: cfg.limit,
        reset: Date.now() + cfg.windowSeconds * 1000,
        limit: cfg.limit,
      }
    }
  }
}
