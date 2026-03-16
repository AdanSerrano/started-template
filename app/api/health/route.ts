import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const checks: Record<string, boolean> = {
    database: false,
  }

  try {
    await db.execute(sql`SELECT 1`)
    checks.database = true
  } catch {
    // DB connection failed
  }

  const healthy = Object.values(checks).every(Boolean)

  return Response.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    { status: healthy ? 200 : 503 },
  )
}
