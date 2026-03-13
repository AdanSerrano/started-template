/**
 * Sistema de internacionalizacion para emails.
 *
 * Usa los mismos archivos de mensajes que next-intl (messages/es.json, messages/en.json)
 * pero los carga de forma sincrona para poder usarlos en React Email.
 *
 * IMPORTANTE: Los templates de email se renderizan fuera del contexto de Next.js,
 * por lo que no podemos usar los hooks de next-intl directamente.
 */

import type { ReactNode } from 'react'
import esMessages from '@/messages/es.json'
import enMessages from '@/messages/en.json'
import caMessages from '@/messages/ca.json'

export type EmailLocale = 'es' | 'en' | 'ca'

type EmailMessages = (typeof esMessages)['emails']

const messages: Record<EmailLocale, EmailMessages> = {
  es: esMessages.emails,
  en: enMessages.emails as unknown as EmailMessages,
  ca: caMessages.emails as unknown as EmailMessages,
}

/**
 * Obtiene las traducciones de emails para un locale especifico.
 * @param locale - El locale ('es' | 'en'). Default: 'es'
 */
export function getEmailTranslations(
  locale: EmailLocale = 'es',
): EmailMessages {
  return messages[locale] ?? messages.es
}

/**
 * Reemplaza placeholders {name} en un string con valores.
 * @param template - String con placeholders como {name}
 * @param values - Objeto con los valores a reemplazar
 */
export function interpolate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/{(\w+)}/g, (_, key) => values[key] ?? `{${key}}`)
}

/**
 * Parsea HTML simple (solo <strong>) en un string para usar en React.
 * Retorna un array de ReactNodes para renderizar directamente.
 */
export function parseSimpleHtml(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const regex = /<strong>(.*?)<\/strong>/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // Texto antes del <strong>
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    // Contenido del <strong>
    parts.push(<strong key={match.index}>{match[1]}</strong>)
    lastIndex = regex.lastIndex
  }

  // Texto despues del ultimo <strong>
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}
