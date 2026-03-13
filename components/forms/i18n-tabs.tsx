'use client'

import type { ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const LOCALES = ['es', 'en', 'ca'] as const
type Locale = (typeof LOCALES)[number]

const LOCALE_LABELS: Record<Locale, string> = {
  es: 'Espanol',
  en: 'English',
  ca: 'Catala',
}

interface I18nTabsProps {
  children: (lang: Locale) => ReactNode
  className?: string
}

interface I18nValue {
  es: string
  en?: string | undefined
  ca?: string | undefined
}

/** Strips empty strings from optional i18n locales before sending to server */
export function cleanI18n(field: I18nValue): I18nValue {
  const result: I18nValue = { es: field.es }
  if (field.en) result.en = field.en
  if (field.ca) result.ca = field.ca
  return result
}

/** Strips empty strings from optional i18n fields, returns null if es is empty */
export function cleanI18nOptional(
  field: I18nValue | null | undefined,
): I18nValue | null {
  if (!field || !field.es) return null
  return cleanI18n(field)
}

export function I18nTabs({ children, className }: I18nTabsProps) {
  return (
    <Tabs defaultValue="es">
      <TabsList aria-label="Seleccionar idioma">
        {LOCALES.map((lang) => (
          <TabsTrigger key={lang} value={lang}>
            {LOCALE_LABELS[lang]}
          </TabsTrigger>
        ))}
      </TabsList>
      {LOCALES.map((lang) => (
        <TabsContent key={lang} value={lang} className={className}>
          {children(lang)}
        </TabsContent>
      ))}
    </Tabs>
  )
}
