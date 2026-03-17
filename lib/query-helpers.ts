/**
 * Helpers reutilizables para queries Drizzle.
 *
 * Soft-delete filter, ordering, y pagination helpers.
 */

import { isNull } from 'drizzle-orm'
import type { Column } from 'drizzle-orm'

/**
 * Filtro para excluir registros soft-deleted.
 * Usar en todas las queries de lectura de tablas con deletedAt.
 *
 * @example
 * db.select().from(users).where(notDeleted(users.deletedAt))
 */
export function notDeleted(deletedAtColumn: Column) {
  return isNull(deletedAtColumn)
}
