/**
 * PostgreSQL dialect — Drizzle ORM column builders y helpers.
 *
 * Este modulo normaliza la API de drizzle-orm/pg-core para que
 * los schemas importen de `@/db/dialect` sin acoplarse al dialecto.
 */

import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

// ── Drizzle Kit dialect ──────────────────────────────────────

export const DIALECT = 'postgresql' as const

// ── Table & Enum creators ────────────────────────────────────

export const createTable = pgTable
export const createEnum = pgEnum

// ── Column re-exports (nombres normalizados) ─────────────────

export { varchar, text, boolean, integer, index, uniqueIndex }

// ── Dialect-specific column helpers ──────────────────────────

/** Primary key UUID con auto-generacion (gen_random_uuid en PG). */
export function primaryId(name: string) {
  return uuid(name).defaultRandom().primaryKey()
}

/** Columna UUID para foreign keys y campos no-PK. */
export function uuidCol(name: string) {
  return uuid(name)
}

/** Columna JSON — usa `jsonb` en PG para eficiencia y soporte de indices. */
export function jsonCol(name: string) {
  return jsonb(name)
}

/** Columna timestamp — PG usa `timestamp with time zone`. */
export function timestampCol(name: string) {
  return timestamp(name, { withTimezone: true })
}

/** Spread helper para columnas createdAt + updatedAt. */
export function timestamps() {
  return {
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
}
