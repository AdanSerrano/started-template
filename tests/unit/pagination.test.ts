import { describe, expect, it } from 'vitest'
import {
  createPaginatedResult,
  getPaginationOffset,
  paginationSchema,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '@/lib/pagination'

describe('pagination', () => {
  describe('paginationSchema', () => {
    it('defaults to page 1 and default page size', () => {
      const result = paginationSchema.parse({})
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(DEFAULT_PAGE_SIZE)
    })

    it('coerces string values', () => {
      const result = paginationSchema.parse({ page: '3', pageSize: '50' })
      expect(result.page).toBe(3)
      expect(result.pageSize).toBe(50)
    })

    it('rejects page < 1', () => {
      expect(() => paginationSchema.parse({ page: 0 })).toThrow()
    })

    it('rejects pageSize > MAX_PAGE_SIZE', () => {
      expect(() =>
        paginationSchema.parse({ pageSize: MAX_PAGE_SIZE + 1 }),
      ).toThrow()
    })
  })

  describe('createPaginatedResult', () => {
    it('calculates pagination metadata correctly', () => {
      const result = createPaginatedResult(['a', 'b'], 50, {
        page: 2,
        pageSize: 20,
      })

      expect(result.items).toEqual(['a', 'b'])
      expect(result.pagination.page).toBe(2)
      expect(result.pagination.pageSize).toBe(20)
      expect(result.pagination.totalItems).toBe(50)
      expect(result.pagination.totalPages).toBe(3)
      expect(result.pagination.hasNext).toBe(true)
      expect(result.pagination.hasPrev).toBe(true)
    })

    it('hasNext is false on last page', () => {
      const result = createPaginatedResult([], 20, {
        page: 1,
        pageSize: 20,
      })
      expect(result.pagination.hasNext).toBe(false)
    })

    it('hasPrev is false on first page', () => {
      const result = createPaginatedResult([], 50, {
        page: 1,
        pageSize: 20,
      })
      expect(result.pagination.hasPrev).toBe(false)
    })
  })

  describe('getPaginationOffset', () => {
    it('returns 0 for page 1', () => {
      expect(getPaginationOffset({ page: 1, pageSize: 20 })).toBe(0)
    })

    it('calculates offset correctly', () => {
      expect(getPaginationOffset({ page: 3, pageSize: 10 })).toBe(20)
    })
  })
})
