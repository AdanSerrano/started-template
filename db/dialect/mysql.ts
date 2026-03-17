/**
 * MySQL dialect — Drizzle ORM column builders y helpers.
 *
 * Equivalente normalizado de `db/dialect/pg.ts` para MySQL/MariaDB.
 * MySQL no soporta UUID nativo ni JSONB — se usan varchar(36) y json.
 *
 * Dependencias requeridas: `mysql2`
 *   bun add mysql2
 */

import {
  mysqlTable,
  mysqlEnum,
  varchar,
  text,
  boolean,
  int,
  timestamp,
  json,
  index,
  uniqueIndex,
} from 'drizzle-orm/mysql-core'

// ── Drizzle Kit dialect ──────────────────────────────────────

export const DIALECT = 'mysql' as const

// ── Table & Enum creators ────────────────────────────────────

export const createTable = mysqlTable
export const createEnum = mysqlEnum

// ── Column re-exports (nombres normalizados) ─────────────────

export { varchar, text, boolean, index, uniqueIndex }

/** MySQL usa `int` — re-export como `integer` para consistencia. */
export const integer = int

// ── Dialect-specific column helpers ──────────────────────────

/** Primary key UUID — MySQL usa varchar(36) + crypto.randomUUID(). */
export function primaryId(name: string) {
  return varchar(name, { length: 36 })
    .$default(() => crypto.randomUUID())
    .primaryKey()
}

/** Columna UUID para foreign keys — varchar(36) en MySQL. */
export function uuidCol(name: string) {
  return varchar(name, { length: 36 })
}

/** Columna JSON — MySQL usa `json` nativo (desde MySQL 5.7+). */
export function jsonCol(name: string) {
  return json(name)
}

/** Columna timestamp — MySQL maneja UTC internamente. */
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
