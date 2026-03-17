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
// ║  Para cambiar de base de datos:                            ║
// ║  1. Cambiar export en db/dialect/index.ts                  ║
// ║  2. Descomentar la seccion del dialecto correspondiente    ║
// ║  3. Comentar la seccion actual                             ║
// ║  4. Instalar dependencias del nuevo dialecto               ║
// ║  Ver docs/database.md para guia completa                   ║
// ╚═══════════════════════════════════════════════════════════╝

// ── PostgreSQL (Neon Serverless) ─────────────────────────────
// Dependencias: @neondatabase/serverless, ws
// Compatible con: Neon, Supabase, CockroachDB

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

function gracefulShutdown() {
  pool.end().catch(() => {})
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// ── PostgreSQL (node-postgres / pg) ──────────────────────────
// Dependencias: bun add pg && bun add -d @types/pg
// Compatible con: PostgreSQL standard, Supabase, CockroachDB
//
// import { drizzle } from 'drizzle-orm/node-postgres'
// import pg from 'pg'
//
// const pool = new pg.Pool({
//   connectionString: process.env.DATABASE_URL!,
//   max: 10,
//   idleTimeoutMillis: 60000,
//   connectionTimeoutMillis: 15000,
// })
//
// pool.on('error', (error: Error) => {
//   console.error('[db] Unexpected pool error:', error)
// })
//
// export const db = drizzle(pool, { schema })
//
// function gracefulShutdown() {
//   pool.end().catch(() => {})
// }
//
// process.on('SIGTERM', gracefulShutdown)
// process.on('SIGINT', gracefulShutdown)

// ── MySQL / MariaDB ──────────────────────────────────────────
// Dependencias: bun add mysql2
// Compatible con: MySQL 5.7+, MariaDB 10.5+
//
// import mysql from 'mysql2/promise'
// import { drizzle } from 'drizzle-orm/mysql2'
//
// const pool = mysql.createPool({
//   uri: process.env.DATABASE_URL!,
//   waitForConnections: true,
//   connectionLimit: 10,
//   idleTimeout: 60000,
// })
//
// export const db = drizzle(pool, { schema, mode: 'default' })
//
// function gracefulShutdown() {
//   pool.end().catch(() => {})
// }
//
// process.on('SIGTERM', gracefulShutdown)
// process.on('SIGINT', gracefulShutdown)

// ── PlanetScale (MySQL serverless) ───────────────────────────
// Dependencias: bun add @planetscale/database
// Compatible con: PlanetScale, TiDB
//
// import { Client } from '@planetscale/database'
// import { drizzle } from 'drizzle-orm/planetscale-serverless'
//
// const client = new Client({ url: process.env.DATABASE_URL! })
// export const db = drizzle(client, { schema })

// ── SQLite (better-sqlite3) ──────────────────────────────────
// Dependencias: bun add better-sqlite3 && bun add -d @types/better-sqlite3
//
// import Database from 'better-sqlite3'
// import { drizzle } from 'drizzle-orm/better-sqlite3'
//
// const sqlite = new Database(process.env.DATABASE_URL!)
// sqlite.pragma('journal_mode = WAL')
// sqlite.pragma('foreign_keys = ON')
//
// export const db = drizzle(sqlite, { schema })
//
// function gracefulShutdown() {
//   sqlite.close()
// }
//
// process.on('SIGTERM', gracefulShutdown)
// process.on('SIGINT', gracefulShutdown)

// ── SQLite (Bun built-in) ────────────────────────────────────
// Sin dependencias adicionales — requiere runtime Bun
//
// import { Database } from 'bun:sqlite'
// import { drizzle } from 'drizzle-orm/bun-sqlite'
//
// const sqlite = new Database(process.env.DATABASE_URL!)
// sqlite.exec('PRAGMA journal_mode = WAL')
// sqlite.exec('PRAGMA foreign_keys = ON')
//
// export const db = drizzle(sqlite, { schema })
//
// function gracefulShutdown() {
//   sqlite.close()
// }
//
// process.on('SIGTERM', gracefulShutdown)
// process.on('SIGINT', gracefulShutdown)

// ── Turso / libSQL ───────────────────────────────────────────
// Dependencias: bun add @libsql/client
// Compatible con: Turso (cloud), libSQL local, sqld
//
// import { createClient } from '@libsql/client'
// import { drizzle } from 'drizzle-orm/libsql'
//
// const client = createClient({
//   url: process.env.DATABASE_URL!,
//   authToken: process.env.DATABASE_AUTH_TOKEN,
// })
//
// export const db = drizzle(client, { schema })

// ── Cloudflare D1 ────────────────────────────────────────────
// Sin dependencias — usa el binding D1 de Cloudflare Workers
// Nota: requiere que D1 se pase como binding en el worker
//
// import { drizzle } from 'drizzle-orm/d1'
//
// // En el handler del worker:
// // export const db = drizzle(env.DB, { schema })

// ── SingleStore ──────────────────────────────────────────────
// Dependencias: bun add mysql2
// SingleStore es MySQL-compatible, usa el mismo driver
//
// import mysql from 'mysql2/promise'
// import { drizzle } from 'drizzle-orm/singlestore'
//
// const pool = mysql.createPool({
//   uri: process.env.DATABASE_URL!,
//   waitForConnections: true,
//   connectionLimit: 10,
//   idleTimeout: 60000,
// })
//
// export const db = drizzle(pool, { schema })
//
// function gracefulShutdown() {
//   pool.end().catch(() => {})
// }
//
// process.on('SIGTERM', gracefulShutdown)
// process.on('SIGINT', gracefulShutdown)

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
