/**
 * Turso / libSQL dialect — Drizzle ORM column builders y helpers.
 *
 * Turso usa el mismo schema que SQLite (sqlite-core) pero tiene
 * su propio dialect en drizzle-kit ('turso') y driver (libsql).
 *
 * Compatible con: Turso, libSQL local, sqld
 *
 * Dependencias requeridas: `@libsql/client`
 *   bun add @libsql/client
 */

// Re-exporta todo de SQLite — Turso usa el mismo schema
export {
  createTable,
  createEnum,
  varchar,
  text,
  boolean,
  integer,
  index,
  uniqueIndex,
  primaryId,
  uuidCol,
  jsonCol,
  timestampCol,
  timestamps,
} from './sqlite'

// Override solo el DIALECT para drizzle-kit
export const DIALECT = 'turso' as const
