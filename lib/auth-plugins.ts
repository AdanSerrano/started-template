import { nextCookies } from 'better-auth/next-js'
import { username, twoFactor, admin, magicLink } from 'better-auth/plugins'
import { cookies } from 'next/headers'
import { getEmailTranslations, type EmailLocale } from '@/emails/i18n'
import { MagicLinkEmail } from '@/emails/magic-link'
import { routing } from '@/i18n/routing'
import { appConfig } from '@/lib/config'
import { sendEmail } from '@/lib/email'
import { ac, roles } from '@/lib/permissions'

/**
 * Obtiene el locale actual desde las cookies de next-intl.
 * Usa el defaultLocale si no hay cookie establecida.
 */
export async function getLocaleFromRequest(): Promise<EmailLocale> {
  try {
    const cookieStore = await cookies()
    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value
    if (localeCookie && routing.locales.includes(localeCookie as EmailLocale)) {
      return localeCookie as EmailLocale
    }
  } catch {
    // Si no podemos leer las cookies, usar el default
  }
  return routing.defaultLocale as EmailLocale
}

export function createAuthPlugins() {
  return [
    username(),
    twoFactor({
      issuer: appConfig.name,
    }),
    admin({
      ac,
      roles,
      defaultRole: 'user',
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const locale = await getLocaleFromRequest()
        const t = getEmailTranslations(locale)
        await sendEmail({
          to: email,
          subject: t.magicLink.subject,
          react: MagicLinkEmail({ url, locale }),
        })
      },
      expiresIn: 600, // 10 minutos
    }),
    // nextCookies MUST be last — handles cookies in Server Actions automatically
    nextCookies(),
  ]
}
