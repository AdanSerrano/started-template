/**
 * SQLite dialect — Drizzle ORM column builders y helpers.
 *
 * Equivalente normalizado de `db/dialect/pg.ts` para SQLite.
 * SQLite no tiene enums, UUID, JSONB ni timestamps con timezone.
 *
 * Dependencias requeridas: `better-sqlite3` + `@types/better-sqlite3`
 *   bun add better-sqlite3 && bun add -d @types/better-sqlite3
 */

import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

// ── Drizzle Kit dialect ──────────────────────────────────────

export const DIALECT = 'sqlite' as const

// ── Table & Enum creators ────────────────────────────────────

export const createTable = sqliteTable

/**
 * SQLite no tiene enums nativos.
 * Retorna un builder de `text` con type-safety via $type<T>().
 * La validacion real se hace en la capa de Zod (actions).
 *
 * Uso identico a pgEnum/mysqlEnum:
 *   const roleEnum = createEnum('role', ['admin', 'user'])
 *   roleEnum('column_name') // text column con tipo union
 */
export function createEnum<T extends string>(
  _name: string,
  _values: readonly [T, ...T[]],
) {
  return (columnName: string) => text(columnName).$type<T>()
}

// ── Column re-exports (nombres normalizados) ─────────────────

export { text, integer, index, uniqueIndex }

/**
 * SQLite no tiene varchar nativo — usa text (sin limite).
 * El parametro `length` se acepta por compatibilidad pero se ignora.
 */
export function varchar(name: string, _opts?: { length: number }) {
  return text(name)
}

/** SQLite no tiene boolean — usa integer con mode 'boolean'. */
export function boolean(name: string) {
  return integer(name, { mode: 'boolean' })
}

// ── Dialect-specific column helpers ──────────────────────────

/** Primary key UUID — SQLite usa text + crypto.randomUUID(). */
export function primaryId(name: string) {
  return text(name)
    .$default(() => crypto.randomUUID())
    .primaryKey()
}

/** Columna UUID para foreign keys — text en SQLite. */
export function uuidCol(name: string) {
  return text(name)
}

/** Columna JSON — SQLite usa text con mode 'json'. */
export function jsonCol(name: string) {
  return text(name, { mode: 'json' })
}

/** Columna timestamp — SQLite usa integer con mode 'timestamp'. */
export function timestampCol(name: string) {
  return integer(name, { mode: 'timestamp' })
}

/** Spread helper para columnas createdAt + updatedAt. */
export function timestamps() {
  return {
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$default(() => new Date())
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .$default(() => new Date())
      .notNull(),
  }
}
