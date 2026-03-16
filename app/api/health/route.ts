import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface ServiceCheck {
  status: 'up' | 'down'
  latencyMs: number
  error?: string
}

async function checkDatabase(): Promise<ServiceCheck> {
  const start = performance.now()
  try {
    await db.execute(sql`SELECT 1`)
    return { status: 'up', latencyMs: Math.round(performance.now() - start) }
  } catch (err) {
    return {
      status: 'down',
      latencyMs: Math.round(performance.now() - start),
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

async function checkRedis(): Promise<ServiceCheck | null> {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null
  const start = performance.now()
  try {
    const { Redis } = await import('@upstash/redis')
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    await redis.ping()
    return { status: 'up', latencyMs: Math.round(performance.now() - start) }
  } catch (err) {
    return {
      status: 'down',
      latencyMs: Math.round(performance.now() - start),
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

export async function GET() {
  const [database, redis] = await Promise.all([checkDatabase(), checkRedis()])

  const services: Record<string, ServiceCheck> = { database }
  if (redis) services.redis = redis

  const allUp = Object.values(services).every((s) => s.status === 'up')
  const anyDown = Object.values(services).some((s) => s.status === 'down')

  const status = allUp ? 'healthy' : anyDown ? 'unhealthy' : 'degraded'

  return Response.json(
    {
      status,
      services,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version ?? '0.1.0',
    },
    { status: allUp ? 200 : 503 },
  )
}
