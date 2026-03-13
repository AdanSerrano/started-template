export type I18nField = {
  es: string
  en?: string | undefined
  ca?: string | undefined
}

export function getI18n(
  field: I18nField | string | null | undefined,
  locale: string,
): string {
  if (!field) return ''
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field)
      return parsed[locale] ?? parsed.es ?? ''
    } catch {
      return field
    }
  }
  return (field as Record<string, string>)[locale] ?? field.es ?? ''
}
