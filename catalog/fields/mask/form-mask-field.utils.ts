export interface MaskDefinition {
  pattern: string
  placeholder?: string | undefined
  definitions?: Record<string, RegExp> | undefined
}

export type PresetMask =
  | 'phone-us'
  | 'phone-mx'
  | 'ssn'
  | 'zip-us'
  | 'zip-mx'
  | 'credit-card'
  | 'date'
  | 'time'
  | 'percentage'
  | 'currency'

export const PRESET_MASKS: Record<PresetMask, MaskDefinition> = {
  'phone-us': { pattern: '(999) 999-9999', placeholder: '(___) ___-____' },
  'phone-mx': { pattern: '+52 99 9999 9999', placeholder: '+52 __ ____ ____' },
  ssn: { pattern: '999-99-9999', placeholder: '___-__-____' },
  'zip-us': { pattern: '99999', placeholder: '_____' },
  'zip-mx': { pattern: '99999', placeholder: '_____' },
  'credit-card': {
    pattern: '9999 9999 9999 9999',
    placeholder: '____ ____ ____ ____',
  },
  date: { pattern: '99/99/9999', placeholder: '__/__/____' },
  time: { pattern: '99:99', placeholder: '__:__' },
  percentage: {
    pattern: '999%',
    placeholder: '___%',
    definitions: { 9: /[0-9]/ },
  },
  currency: { pattern: '$9,999,999.99', placeholder: '$_,___,___.___' },
}

export const DEFAULT_DEFINITIONS: Record<string, RegExp> = {
  '9': /[0-9]/,
  a: /[a-zA-Z]/,
  A: /[A-Z]/,
  '*': /[a-zA-Z0-9]/,
}

export function applyMask(
  value: string,
  pattern: string,
  definitions: Record<string, RegExp>,
): string {
  let result = ''
  let valueIndex = 0

  for (let i = 0; i < pattern.length && valueIndex < value.length; i++) {
    const patternChar = pattern[i]!
    const definition = definitions[patternChar]

    if (definition) {
      while (valueIndex < value.length) {
        const inputChar = value[valueIndex]!
        valueIndex++

        if (definition.test(inputChar)) {
          result += inputChar
          break
        }
      }
    } else {
      result += patternChar
      if (value[valueIndex] === patternChar) {
        valueIndex++
      }
    }
  }

  return result
}

export function getRawValue(
  value: string,
  pattern: string,
  definitions: Record<string, RegExp>,
): string {
  let result = ''

  for (let i = 0; i < value.length && i < pattern.length; i++) {
    const patternChar = pattern[i]!
    const definition = definitions[patternChar]

    if (definition && definition.test(value[i]!)) {
      result += value[i]
    }
  }

  return result
}

export function getMaskedPlaceholder(
  pattern: string,
  maskChar: string,
  definitions: Record<string, RegExp>,
): string {
  let result = ''

  for (let i = 0; i < pattern.length; i++) {
    const patternChar = pattern[i]!
    const definition = definitions[patternChar]

    if (definition) {
      result += maskChar
    } else {
      result += patternChar
    }
  }

  return result
}
