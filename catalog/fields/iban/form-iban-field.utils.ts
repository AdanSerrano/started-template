import { IBAN_LENGTHS } from './form-iban-field.data'

export const DEFAULT_IBAN_MESSAGES = {
  invalidCountryCode: 'Invalid country code',
  unknownCountryCode: 'Unknown country code',
  invalidChecksum: 'Invalid checksum',
  expectedLength: 'Expected {length} characters',
  validIban: 'Valid IBAN',
  invalid: 'Invalid',
}

export type IBANMessages = typeof DEFAULT_IBAN_MESSAGES

export function formatIBAN(value: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  return cleaned.replace(/(.{4})/g, '$1 ').trim()
}

export function getCountryCode(iban: string): string {
  const cleaned = iban.replace(/\s/g, '')
  return cleaned.slice(0, 2).toUpperCase()
}

export function validateIBAN(
  iban: string,
  messages: IBANMessages,
): {
  valid: boolean
  error?: string | undefined
} {
  const cleaned = iban.replace(/\s/g, '').toUpperCase()

  if (cleaned.length < 2) {
    return { valid: false }
  }

  const countryCode = cleaned.slice(0, 2)

  if (!/^[A-Z]{2}$/.test(countryCode)) {
    return { valid: false, error: messages.invalidCountryCode }
  }

  const expectedLength = IBAN_LENGTHS[countryCode]
  if (!expectedLength) {
    return { valid: false, error: messages.unknownCountryCode }
  }

  if (cleaned.length !== expectedLength) {
    return {
      valid: false,
      error: messages.expectedLength.replace(
        '{length}',
        expectedLength.toString(),
      ),
    }
  }

  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4)
  const numericIBAN = rearranged
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0)
      return code >= 65 && code <= 90 ? (code - 55).toString() : char
    })
    .join('')

  let remainder = numericIBAN
  while (remainder.length > 2) {
    const block = remainder.slice(0, 9)
    remainder = (parseInt(block, 10) % 97).toString() + remainder.slice(9)
  }

  if (parseInt(remainder, 10) % 97 !== 1) {
    return { valid: false, error: messages.invalidChecksum }
  }

  return { valid: true }
}
