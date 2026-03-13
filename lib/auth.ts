import { betterAuth } from 'better-auth/minimal'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { username } from 'better-auth/plugins'
import { twoFactor } from 'better-auth/plugins'
import { admin } from 'better-auth/plugins'
import { magicLink } from 'better-auth/plugins'
import { db } from '@/lib/db'
import {
  users,
  sessions,
  accounts,
  verifications,
  twoFactors,
} from '@/db/schema'
import { eq } from 'drizzle-orm'
import { ac, roles } from '@/modules/auth/permissions'
import { sendEmail } from '@/lib/email'
import { VerificationEmail } from '@/emails/verification'
import { ResetPasswordEmail } from '@/emails/reset-password'
import { MagicLinkEmail } from '@/emails/magic-link'
import { getEmailTranslations, type EmailLocale } from '@/emails/i18n'
import { cookies } from 'next/headers'
import { routing } from '@/i18n/routing'
import { getAuthSecurityService } from '@/modules/auth/services/auth-security-service'

/**
 * Obtiene el locale actual desde las cookies de next-intl.
 * Usa el defaultLocale si no hay cookie establecida.
 */
async function getLocaleFromRequest(): Promise<EmailLocale> {
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

export const auth = betterAuth({
  appName: 'Starter App',
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'],

  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      users,
      sessions,
      accounts,
      verifications,
      twoFactors,
    },
    usePlural: true,
  }),

  plugins: [
    username(),
    twoFactor({
      issuer: 'Starter App',
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
  ],

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 8,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const locale = await getLocaleFromRequest()
      const t = getEmailTranslations(locale)
      await sendEmail({
        to: user.email,
        subject: t.resetPassword.subject,
        react: ResetPasswordEmail({ name: user.name, url, locale }),
      })
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const locale = await getLocaleFromRequest()
      const t = getEmailTranslations(locale)
      await sendEmail({
        to: user.email,
        subject: t.verification.subject,
        react: VerificationEmail({ name: user.name, url, locale }),
      })
    },
  },

  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },

  user: {
    additionalFields: {
      phone: {
        type: 'string',
        required: false,
      },
      role: {
        type: ['super_admin', 'admin', 'user'] as const,
        required: false,
        defaultValue: 'user',
        input: false,
      },
      isActive: {
        type: 'boolean',
        required: false,
        defaultValue: true,
        input: false,
      },
      failedLoginAttempts: {
        type: 'number',
        required: false,
        defaultValue: 0,
        input: false,
      },
      lockedUntil: {
        type: 'date',
        required: false,
        input: false,
      },
      deletedAt: {
        type: 'date',
        required: false,
        input: false,
      },
      deletedBy: {
        type: 'string',
        required: false,
        input: false,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // Refresh DB session cada 1 dia de actividad
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutos
      strategy: 'compact',
    },
  },

  advanced: {
    database: {
      generateId: false,
    },
  },

  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const authSecurity = getAuthSecurityService()
          const isLocked = await authSecurity.isAccountLocked(session.userId)

          if (isLocked) {
            const expiry = await authSecurity.getLockExpiry(session.userId)
            const minutesLeft = expiry
              ? Math.ceil((expiry.getTime() - Date.now()) / 60000)
              : 30
            throw new Error(
              `Cuenta bloqueada temporalmente. Intenta de nuevo en ${minutesLeft} minutos.`,
            )
          }

          const [user] = await db
            .select({
              deletedAt: users.deletedAt,
              isActive: users.isActive,
            })
            .from(users)
            .where(eq(users.id, session.userId))

          if (user?.deletedAt) {
            throw new Error('Cuenta eliminada')
          }

          if (!user?.isActive) {
            throw new Error('Cuenta desactivada')
          }

          await authSecurity.resetFailedAttempts(session.userId)

          return { data: session }
        },
      },
    },
  },
})

export type Auth = typeof auth
