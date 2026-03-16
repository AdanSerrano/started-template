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

let redisInstance: InstanceType<
  Awaited<typeof import('@upstash/redis')>['Redis']
> | null = null

async function getRedisClient() {
  if (redisInstance) return redisInstance
  if (!process.env.UPSTASH_REDIS_REST_URL) return null
  const { Redis } = await import('@upstash/redis')
  redisInstance = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  return redisInstance
}

async function checkRedis(): Promise<ServiceCheck | null> {
  const redis = await getRedisClient()
  if (!redis) return null
  const start = performance.now()
  try {
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

function checkMemory(): ServiceCheck {
  const start = performance.now()
  const usage = process.memoryUsage()
  const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024)
  const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024)
  const heapPercent = Math.round((usage.heapUsed / usage.heapTotal) * 100)

  return {
    status: heapPercent < 90 ? 'up' : 'down',
    latencyMs: Math.round(performance.now() - start),
    ...(heapPercent >= 90 && {
      error: `Heap usage ${heapPercent}% (${heapUsedMB}/${heapTotalMB}MB)`,
    }),
  }
}

export async function GET() {
  const [database, redis] = await Promise.all([checkDatabase(), checkRedis()])

  const services: Record<string, ServiceCheck> = {
    database,
    memory: checkMemory(),
  }
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
