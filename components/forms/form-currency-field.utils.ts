import type { CurrencyConfig } from './form-field.types'

export const AVAILABLE_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', locale: 'en-US', decimals: 2 },
  { code: 'EUR', symbol: '€', locale: 'de-DE', decimals: 2 },
  { code: 'GBP', symbol: '£', locale: 'en-GB', decimals: 2 },
  { code: 'MXN', symbol: '$', locale: 'es-MX', decimals: 2 },
  { code: 'BRL', symbol: 'R$', locale: 'pt-BR', decimals: 2 },
  { code: 'JPY', symbol: '¥', locale: 'ja-JP', decimals: 0 },
  { code: 'CAD', symbol: 'C$', locale: 'en-CA', decimals: 2 },
  { code: 'AUD', symbol: 'A$', locale: 'en-AU', decimals: 2 },
  { code: 'CHF', symbol: 'CHF', locale: 'de-CH', decimals: 2 },
  { code: 'CNY', symbol: '¥', locale: 'zh-CN', decimals: 2 },
]

export function formatCurrency(
  amount: number,
  currency: CurrencyConfig,
): string {
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currency.decimals ?? 2,
    maximumFractionDigits: currency.decimals ?? 2,
  }).format(amount)
}

export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^\d.,\-]/g, '').replace(',', '.')
  const number = parseFloat(cleaned)
  return isNaN(number) ? 0 : number
}
