/**
 * SingleStore dialect — Drizzle ORM column builders y helpers.
 *
 * SingleStore es compatible con MySQL pero tiene optimizaciones
 * para workloads analiticos y transaccionales (HTAP).
 * Usa singlestore-core con API similar a mysql-core.
 *
 * Dependencias requeridas: `mysql2` (usa el mismo driver que MySQL)
 *   bun add mysql2
 */

import {
  singlestoreTable,
  singlestoreEnum,
  varchar,
  text,
  boolean,
  int,
  timestamp,
  json,
  index,
  uniqueIndex,
} from 'drizzle-orm/singlestore-core'

// ── Drizzle Kit dialect ──────────────────────────────────────

export const DIALECT = 'singlestore' as const

// ── Table & Enum creators ────────────────────────────────────

export const createTable = singlestoreTable
export const createEnum = singlestoreEnum

// ── Column re-exports (nombres normalizados) ─────────────────

export { varchar, text, boolean, index, uniqueIndex }

/** SingleStore usa `int` — re-export como `integer` para consistencia. */
export const integer = int

// ── Dialect-specific column helpers ──────────────────────────

/** Primary key UUID — SingleStore usa varchar(36) + crypto.randomUUID(). */
export function primaryId(name: string) {
  return varchar(name, { length: 36 })
    .$default(() => crypto.randomUUID())
    .primaryKey()
}

/** Columna UUID para foreign keys — varchar(36) en SingleStore. */
export function uuidCol(name: string) {
  return varchar(name, { length: 36 })
}

/** Columna JSON — SingleStore usa `json` nativo. */
export function jsonCol(name: string) {
  return json(name)
}

/** Columna timestamp — SingleStore maneja timestamps como MySQL. */
export function timestampCol(name: string) {
  return timestamp(name)
}

/** Spread helper para columnas createdAt + updatedAt. */
export function timestamps() {
  return {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  }
}
