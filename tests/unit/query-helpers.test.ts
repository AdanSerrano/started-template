import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { describe, it, expect } from 'vitest'
import {
  notDeleted,
  isDeleted,
  byId,
  activeById,
  withLimit,
  withOffset,
  countRows,
} from '@/lib/query-helpers'

const testTable = pgTable('test', {
  id: text('id').primaryKey(),
  deletedAt: timestamp('deleted_at'),
})

describe('notDeleted', () => {
  it('returns a truthy SQL expression', () => {
    const result = notDeleted(testTable.deletedAt)
    expect(result).toBeTruthy()
  })
})

describe('isDeleted', () => {
  it('returns a truthy SQL expression', () => {
    const result = isDeleted(testTable.deletedAt)
    expect(result).toBeTruthy()
  })
})

describe('byId', () => {
  it('returns a truthy SQL expression', () => {
    const result = byId(testTable.id, 'abc-123')
    expect(result).toBeTruthy()
  })
})

describe('activeById', () => {
  it('returns a truthy SQL expression', () => {
    const result = activeById(testTable.id, 'abc-123', testTable.deletedAt)
    expect(result).toBeTruthy()
  })
})

describe('withLimit', () => {
  it('returns the pageSize value', () => {
    expect(withLimit({ pageSize: 10 })).toBe(10)
  })

  it('returns 1 for pageSize of 1', () => {
    expect(withLimit({ pageSize: 1 })).toBe(1)
  })

  it('returns 100 for pageSize of 100', () => {
    expect(withLimit({ pageSize: 100 })).toBe(100)
  })
})

describe('withOffset', () => {
  it('returns 0 for page 1', () => {
    expect(withOffset({ page: 1, pageSize: 10 })).toBe(0)
  })

  it('returns pageSize for page 2', () => {
    expect(withOffset({ page: 2, pageSize: 10 })).toBe(10)
  })

  it('calculates offset correctly for page 5 with pageSize 20', () => {
    expect(withOffset({ page: 5, pageSize: 20 })).toBe(80)
  })

  it('returns 0 for page 1 with pageSize 1', () => {
    expect(withOffset({ page: 1, pageSize: 1 })).toBe(0)
  })
})

describe('countRows', () => {
  it('returns a truthy SQL template', () => {
    const result = countRows()
    expect(result).toBeTruthy()
  })
})
