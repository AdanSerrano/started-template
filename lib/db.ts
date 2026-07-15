import '@/lib/env'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'
import { DIALECT } from '@/db/dialect'
import * as schema from '@/db/schema'

// ╔═══════════════════════════════════════════════════════════╗
// ║  DATABASE CONNECTION                                      ║
// ║  Este archivo configura la conexion para el dialecto       ║
// ║  activo en db/dialect/index.ts                             ║
// ║                                                            ║
// ║  Para cambiar de motor: `bun run add:dialect <name>` y      ║
// ║  sustituye el bloque de conexion de abajo por el del nuevo  ║
// ║  dialecto. Snippets de cada motor: docs/database.md         ║
// ╚═══════════════════════════════════════════════════════════╝

// ── PostgreSQL (Neon Serverless) ─────────────────────────────
// Dependencias: @neondatabase/serverless, ws
// Compatible con: Neon, Supabase, CockroachDB

neonConfig.webSocketConstructor = ws

// En serverless (Vercel/Neon) CADA instancia levanta su propio pool: max alto ×
// N instancias satura el límite de conexiones de Neon. Por eso el default es
// pequeño; en un server de larga vida (Docker) súbelo con DATABASE_POOL_MAX.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: Number(process.env.DATABASE_POOL_MAX) || 5,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 15000,
})

pool.on('error', (error: Error) => {
  console.error('[db] Unexpected pool error:', error)
})

export const db = drizzle(pool, { schema })

function gracefulShutdown() {
  pool.end().catch(() => {})
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Verificacion en runtime de que el dialecto activo coincide
if (
  DIALECT !== 'postgresql' &&
  typeof pool !== 'undefined' /* solo si PG esta activo */
) {
  console.warn(
    `[db] DIALECT is '${DIALECT}' but the active connection is PostgreSQL. ` +
      `Update lib/db.ts to match the dialect.`,
  )
}

export type { DbClient, DbTransaction, DbOrTx } from './db-types'
