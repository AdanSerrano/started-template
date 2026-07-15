import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Readiness check: ¿puede la app servir tráfico? Mira dependencias.
 * - database DOWN  → unhealthy (503): sácame del balanceo.
 * - redis DOWN o memoria alta → degraded (200): sirvo, pero avisa.
 * Para liveness (¿el proceso está vivo?) usa /api/health/live.
 *
 * No se exponen mensajes de error crudos (fuga de infra): se loguean
 * server-side y la respuesta pública solo dice 'unavailable'.
 */

interface ServiceCheck {
  status: 'up' | 'down'
  latencyMs: number
  error?: string
}

async function timed(
  name: string,
  fn: () => Promise<unknown>,
): Promise<ServiceCheck> {
  const start = performance.now()
  try {
    await fn()
    return { status: 'up', latencyMs: Math.round(performance.now() - start) }
  } catch (err) {
    // Log real server-side; nunca en la respuesta pública.
    console.error(`[health] ${name} check failed:`, err)
    return {
      status: 'down',
      latencyMs: Math.round(performance.now() - start),
      error: 'unavailable',
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

function checkMemory(): ServiceCheck {
  const start = performance.now()
  const usage = process.memoryUsage()
  // heapUsed/heapTotal supera 90% de forma normal antes de un GC; solo lo
  // reportamos como señal informativa (degraded), nunca como 503.
  const heapPercent = Math.round((usage.heapUsed / usage.heapTotal) * 100)
  const high = heapPercent >= 95
  return {
    status: high ? 'down' : 'up',
    latencyMs: Math.round(performance.now() - start),
    ...(high && { error: `heap ${heapPercent}%` }),
  }
}

export async function GET() {
  const redisClient = await getRedisClient()

  const [database, redis] = await Promise.all([
    timed('database', () => db.execute(sql`SELECT 1`)),
    redisClient
      ? timed('redis', () => redisClient.ping())
      : Promise.resolve(null),
  ])

  const services: Record<string, ServiceCheck> = {
    database,
    memory: checkMemory(),
  }
  if (redis) services.redis = redis

  // database es crítica; redis y memoria son degradaciones tolerables.
  const critical = database.status === 'down'
  const anyDown = Object.values(services).some((s) => s.status === 'down')

  const status = critical ? 'unhealthy' : anyDown ? 'degraded' : 'healthy'

  return Response.json(
    {
      status,
      services,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION ?? '0.1.0',
    },
    { status: critical ? 503 : 200 },
  )
}
