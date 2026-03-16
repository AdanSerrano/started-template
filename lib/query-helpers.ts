/**
 * Helpers reutilizables para queries Drizzle.
 *
 * Soft-delete filter, ordering, y pagination helpers.
 */

import { isNull } from 'drizzle-orm'
import type { PgColumn } from 'drizzle-orm/pg-core'

/**
 * Filtro para excluir registros soft-deleted.
 * Usar en todas las queries de lectura de tablas con deletedAt.
 *
 * @example
 * db.select().from(users).where(notDeleted(users.deletedAt))
 */
export function notDeleted(deletedAtColumn: PgColumn) {
  return isNull(deletedAtColumn)
}
