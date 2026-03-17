import { describe, it, expect, vi } from 'vitest'
import {
  cn,
  formatCurrency,
  formatDate,
  slugify,
  generateOrderNumber,
} from '@/lib/utils'

// Mock appConfig before importing utils
vi.mock('@/lib/config', () => ({
  appConfig: {
    currency: 'EUR',
    currencyLocale: 'es-ES',
    timezone: 'Europe/Madrid',
    orderPrefix: 'PH',
  },
}))

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('resolves tailwind conflicts by keeping the last one', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'extra')).toBe('base extra')
  })

  it('handles undefined and null inputs', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end')
  })
})

describe('formatCurrency', () => {
  it('formats EUR by default', () => {
    const result = formatCurrency(1234.5)
    // jsdom may format without thousands separator; check value and currency
    expect(result).toContain('1234,50')
    expect(result).toContain('€')
  })

  it('formats USD with custom locale', () => {
    const result = formatCurrency(99.99, 'USD', 'en-US')
    expect(result).toContain('99.99')
    expect(result).toContain('$')
  })

  it('formats zero correctly', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0,00')
  })
})

describe('formatDate', () => {
  it('formats a Date object', () => {
    const date = new Date('2026-03-15T10:30:00Z')
    const result = formatDate(date)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('formats a string date', () => {
    const result = formatDate('2026-01-01T00:00:00Z')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('accepts custom options', () => {
    const result = formatDate('2026-06-15', { dateStyle: 'full' })
    expect(typeof result).toBe('string')
  })
})

describe('slugify', () => {
  it('converts to lowercase with dashes', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('removes accents', () => {
    expect(slugify('Cafe con leche')).toBe('cafe-con-leche')
    expect(slugify('nino')).toBe('nino')
  })

  it('removes special characters', () => {
    expect(slugify('Hello! @World# $2026')).toBe('hello-world-2026')
  })

  it('trims leading and trailing dashes', () => {
    expect(slugify('--hello--')).toBe('hello')
  })

  it('handles empty string', () => {
    expect(slugify('')).toBe('')
  })

  it('collapses multiple separators', () => {
    expect(slugify('a   b   c')).toBe('a-b-c')
  })
})

describe('generateOrderNumber', () => {
  it('starts with PH- prefix and current year', () => {
    const order = generateOrderNumber()
    const year = new Date().getFullYear()
    expect(order).toMatch(new RegExp(`^PH-${year}-[A-Z0-9]{6}$`))
  })

  it('generates unique numbers', () => {
    const orders = new Set(
      Array.from({ length: 20 }, () => generateOrderNumber()),
    )
    expect(orders.size).toBe(20)
  })
})
