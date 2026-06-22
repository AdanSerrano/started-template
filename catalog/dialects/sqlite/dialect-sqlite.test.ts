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
} from '@/db/dialect/sqlite'

describe('SQLite dialect', () => {
  it('exports DIALECT as sqlite', () => {
    expect(DIALECT).toBe('sqlite')
  })

  it('exports createTable function', () => {
    expect(typeof createTable).toBe('function')
  })

  it('exports createEnum as function (text wrapper)', () => {
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

  it('createEnum returns a column builder factory', () => {
    const statusEnum = createEnum('status', ['active', 'inactive'])
    const col = statusEnum('my_status')
    expect(col).toBeDefined()
  })

  it('varchar wraps text (SQLite has no varchar)', () => {
    const col = varchar('name', { length: 255 })
    expect(col).toBeDefined()
  })

  it('can define a table with all helpers', () => {
    const testEnum = createEnum('test_status', ['active', 'inactive'])

    const testTable = createTable('test_table', {
      id: primaryId('id'),
      refId: uuidCol('ref_id'),
      name: varchar('name', { length: 255 }).notNull(),
      description: text('description'),
      isActive: boolean('is_active'),
      count: integer('count').default(0),
      data: jsonCol('data'),
      status: testEnum('status'),
      expiresAt: timestampCol('expires_at'),
      ...timestamps(),
    })

    expect(testTable).toBeDefined()
  })
})
