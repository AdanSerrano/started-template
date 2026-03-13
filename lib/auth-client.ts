import { createAuthClient } from 'better-auth/react'
import { usernameClient } from 'better-auth/client/plugins'
import { twoFactorClient } from 'better-auth/client/plugins'
import { adminClient } from 'better-auth/client/plugins'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import { magicLinkClient } from 'better-auth/client/plugins'
import { ac, roles } from '@/modules/auth/permissions'
import type { auth } from '@/lib/auth'

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
