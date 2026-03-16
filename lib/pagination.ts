/**
 * Tipos y utilidades de paginacion reutilizables.
 *
 * Uso en repositories:
 *   const result = createPaginatedResult(items, total, { page: 1, pageSize: 20 })
 *
 * Uso en actions con schema:
 *   const parsed = paginationSchema.parse(searchParams)
 */

import { z } from 'zod/v4'

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface SortParams {
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
})

export const sortSchema = z.object({
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const paginatedSortSchema = paginationSchema.merge(sortSchema)

export function createPaginatedResult<T>(
  items: T[],
  totalItems: number,
  params: PaginationParams,
): PaginatedResult<T> {
  const totalPages = Math.ceil(totalItems / params.pageSize)
  return {
    items,
    pagination: {
      page: params.page,
      pageSize: params.pageSize,
      totalItems,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
  }
}

export function getPaginationOffset(params: PaginationParams): number {
  return (params.page - 1) * params.pageSize
}
