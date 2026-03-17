import {
  usernameClient,
  twoFactorClient,
  adminClient,
  inferAdditionalFields,
  magicLinkClient,
} from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import type { auth } from '@/lib/auth'
import { ac, roles } from '@/lib/permissions'

/** Extract current locale from the URL path. Falls back to default ('es'). */
function getLocaleFromPath(): string {
  const path = window.location.pathname
  const supportedLocales = ['en', 'ca']
  for (const locale of supportedLocales) {
    if (path.startsWith(`/${locale}/`) || path === `/${locale}`) return locale
  }
  return 'es'
}

export const authClient = createAuthClient({
  plugins: [
    usernameClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        const locale = getLocaleFromPath()
        window.location.href =
          locale === 'es' ? '/login/two-factor' : `/${locale}/login/two-factor`
      },
    }),
    adminClient({
      ac,
      roles,
    }),
    magicLinkClient(),
    inferAdditionalFields<typeof auth>(),
  ],
})
