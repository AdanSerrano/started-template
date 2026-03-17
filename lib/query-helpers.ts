/**
 * Reusable Drizzle query helpers.
 *
 * Soft-delete filters, common conditions, and pagination integration.
 */

import { eq, isNull, isNotNull, and, sql } from 'drizzle-orm'
import type { Column } from 'drizzle-orm'

/**
 * Filter to exclude soft-deleted records.
 * Use in all read queries for tables with deletedAt.
 *
 * @example
 * db.select().from(users).where(notDeleted(users.deletedAt))
 */
export function notDeleted(deletedAtColumn: Column) {
  return isNull(deletedAtColumn)
}

/**
 * Filter to include ONLY soft-deleted records.
 * Useful for admin panels and recovery features.
 *
 * @example
 * db.select().from(users).where(isDeleted(users.deletedAt))
 */
export function isDeleted(deletedAtColumn: Column) {
  return isNotNull(deletedAtColumn)
}

/**
 * Filter by primary ID column.
 *
 * @example
 * db.select().from(users).where(byId(users.id, userId))
 */
export function byId(idColumn: Column, id: string) {
  return eq(idColumn, id)
}

/**
 * Combine byId with notDeleted for the most common query pattern.
 *
 * @example
 * db.select().from(users).where(activeById(users.id, userId, users.deletedAt))
 */
export function activeById(
  idColumn: Column,
  id: string,
  deletedAtColumn: Column,
) {
  return and(byId(idColumn, id), notDeleted(deletedAtColumn))
}

/**
 * Apply LIMIT and OFFSET for pagination.
 * Works with `PaginationParams` from `@/lib/pagination`.
 *
 * @example
 * db.select().from(users).where(notDeleted(users.deletedAt))
 *   .limit(withLimit(params))
 *   .offset(withOffset(params))
 */
export function withLimit(params: { pageSize: number }) {
  return params.pageSize
}

export function withOffset(params: { page: number; pageSize: number }) {
  return (params.page - 1) * params.pageSize
}

/**
 * Count query helper — returns total count as number.
 *
 * @example
 * const [{ total }] = await db.select({ total: countRows() }).from(users)
 */
export function countRows() {
  return sql<number>`count(*)`.mapWith(Number)
}
