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

export const authClient = createAuthClient({
  plugins: [
    usernameClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        const path = window.location.pathname
        const locale =
          path.startsWith('/en/') || path === '/en'
            ? 'en'
            : path.startsWith('/ca/') || path === '/ca'
              ? 'ca'
              : 'es'
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
