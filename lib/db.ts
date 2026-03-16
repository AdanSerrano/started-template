import '@/lib/env'
import ws from 'ws'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from '@/db/schema'

neonConfig.webSocketConstructor = ws

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 10,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 15000,
})

pool.on('error', (error: Error) => {
  console.error('[db] Unexpected pool error:', error)
})

export const db = drizzle(pool, { schema })

// Graceful shutdown — cerrar pool al terminar el proceso
function gracefulShutdown() {
  pool.end().catch(() => {})
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

export type { DbClient, DbTransaction, DbOrTx } from './db-types'
