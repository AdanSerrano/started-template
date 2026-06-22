export interface CreditCardValue {
  number?: string | undefined
  expiry?: string | undefined
  cvc?: string | undefined
  name?: string | undefined
}

export type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown'

export const DEFAULT_LABELS = {
  cardNumber: 'Card Number',
  expiry: 'Expiry',
  cvc: 'CVC',
  name: 'Cardholder Name',
}

export const DEFAULT_PLACEHOLDERS = {
  cardNumber: '1234 5678 9012 3456',
  expiry: 'MM/YY',
  cvc: '123',
  name: 'John Doe',
}

const CARD_PATTERNS: { type: CardType; pattern: RegExp; icon: string }[] = [
  { type: 'visa', pattern: /^4/, icon: '💳' },
  { type: 'mastercard', pattern: /^5[1-5]/, icon: '💳' },
  { type: 'amex', pattern: /^3[47]/, icon: '💳' },
  { type: 'discover', pattern: /^6(?:011|5)/, icon: '💳' },
]

export function detectCardType(number: string): CardType {
  const cleaned = number.replace(/\s/g, '')
  for (const { type, pattern } of CARD_PATTERNS) {
    if (pattern.test(cleaned)) {
      return type
    }
  }
  return 'unknown'
}

export function formatCardNumber(value: string, cardType: CardType): string {
  const cleaned = value.replace(/\D/g, '')
  const maxLength = cardType === 'amex' ? 15 : 16
  const truncated = cleaned.slice(0, maxLength)

  if (cardType === 'amex') {
    return truncated.replace(/(\d{4})(\d{6})?(\d{5})?/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(' '),
    )
  }

  return truncated.replace(/(\d{4})/g, '$1 ').trim()
}

export function formatExpiry(value: string): string {
  const cleaned = value.replace(/\D/g, '')
  const truncated = cleaned.slice(0, 4)

  if (truncated.length >= 2) {
    return `${truncated.slice(0, 2)}/${truncated.slice(2)}`
  }
  return truncated
}

export function formatCVC(value: string, cardType: CardType): string {
  const cleaned = value.replace(/\D/g, '')
  const maxLength = cardType === 'amex' ? 4 : 3
  return cleaned.slice(0, maxLength)
}
