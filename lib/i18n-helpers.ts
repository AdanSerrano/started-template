type SupportedLocale = 'es' | 'en' | 'ca'

type I18nField = {
  es: string
  en?: string | undefined
  ca?: string | undefined
}

/**
 * Extracts the translated value from a JSONB i18n field.
 * Falls back to the specified fallback locale (default: 'es').
 *
 * @example
 * ```ts
 * const name = getTranslatedField(poster.name, 'en') // Falls back to 'es'
 * ```
 */
export function getTranslatedField(
  field: I18nField | null | undefined,
  locale: string,
  fallback: SupportedLocale = 'es',
): string {
  if (!field) return ''
  const loc = locale as SupportedLocale
  return field[loc] || field[fallback] || field.es || ''
}

/**
 * Creates an i18n field object from a single value and locale.
 *
 * @example
 * ```ts
 * const name = createI18nField('Movie Posters', 'en')
 * // { es: '', en: 'Movie Posters' }
 * ```
 */
export function createI18nField(
  value: string,
  locale: SupportedLocale = 'es',
): I18nField {
  return { es: '', [locale]: value }
}

/**
 * Merges a partial i18n update into an existing field.
 *
 * @example
 * ```ts
 * const updated = mergeI18nField(existing, { en: 'Updated' })
 * ```
 */
export function mergeI18nField(
  existing: I18nField | null | undefined,
  update: Partial<I18nField>,
): I18nField {
  return { es: '', ...existing, ...update }
}

export type { I18nField, SupportedLocale }
