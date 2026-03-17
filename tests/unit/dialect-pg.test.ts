import { describe, expect, it } from 'vitest'
import {
  DIALECT,
  createTable,
  createEnum,
  primaryId,
  uuidCol,
  jsonCol,
  timestampCol,
  timestamps,
  varchar,
  text,
  boolean,
  integer,
  index,
  uniqueIndex,
} from '@/db/dialect/pg'

describe('PostgreSQL dialect', () => {
  it('exports DIALECT as postgresql', () => {
    expect(DIALECT).toBe('postgresql')
  })

  it('exports createTable function', () => {
    expect(typeof createTable).toBe('function')
  })

  it('exports createEnum function', () => {
    expect(typeof createEnum).toBe('function')
  })

  it('exports column helper functions', () => {
    expect(typeof primaryId).toBe('function')
    expect(typeof uuidCol).toBe('function')
    expect(typeof jsonCol).toBe('function')
    expect(typeof timestampCol).toBe('function')
    expect(typeof timestamps).toBe('function')
  })

  it('exports standard column types', () => {
    expect(typeof varchar).toBe('function')
    expect(typeof text).toBe('function')
    expect(typeof boolean).toBe('function')
    expect(typeof integer).toBe('function')
    expect(typeof index).toBe('function')
    expect(typeof uniqueIndex).toBe('function')
  })

  it('timestamps() returns createdAt and updatedAt', () => {
    const ts = timestamps()
    expect(ts).toHaveProperty('createdAt')
    expect(ts).toHaveProperty('updatedAt')
  })

  it('can define a table with all helpers', () => {
    const testEnum = createEnum('test_status', ['active', 'inactive'])

    const testTable = createTable('test_table', {
      id: primaryId('id'),
      refId: uuidCol('ref_id'),
      name: varchar('name', { length: 255 }).notNull(),
      description: text('description'),
      isActive: boolean('is_active').default(true),
      count: integer('count').default(0),
      data: jsonCol('data'),
      status: testEnum('status').default('active'),
      expiresAt: timestampCol('expires_at'),
      ...timestamps(),
    })

    expect(testTable).toBeDefined()
  })
})
