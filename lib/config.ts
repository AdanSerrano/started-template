/**
 * Configuracion centralizada de la app.
 *
 * Al copiar esta plantilla para un nuevo proyecto, SOLO cambiar este archivo
 * para actualizar el branding en toda la aplicacion.
 */
export const appConfig = {
  /** Nombre de la app — usado en metadata, emails, auth, JSON-LD */
  name: 'Starter App',

  /** Descripcion corta — usado en manifest y metadata fallback */
  description: 'Plantilla de proyecto full-stack',

  /** URL base — se sobreescribe con NEXT_PUBLIC_APP_URL en runtime */
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',

  /** Email remitente por defecto */
  emailFrom: process.env.EMAIL_FROM ?? 'Starter App <no-reply@your-domain.com>',

  /** Locales soportados */
  locales: ['es', 'en', 'ca'] as const,
  defaultLocale: 'es' as const,

  /** Timezone por defecto — usado en formatDate, i18n/request, etc. */
  timezone: 'Europe/Madrid',

  /** Moneda y locale por defecto para formateo */
  currency: 'EUR' as const,
  currencyLocale: 'es-ES' as const,
} as const

export type AppLocale = (typeof appConfig.locales)[number]
