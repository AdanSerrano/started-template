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
import { appConfig } from '@/lib/config'
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
  appName: appConfig.name,
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
      maxAge: 2 * 60, // 2 minutos — balance seguridad vs rendimiento
      strategy: 'compact',
    },
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 30,
    storage: 'memory',
    customRules: {
      '/sign-in/email': { window: 900, max: 5 },
      '/sign-in/username': { window: 900, max: 5 },
      '/sign-up/email': { window: 3600, max: 3 },
      '/forget-password': { window: 3600, max: 3 },
      '/magic-link/sign-in': { window: 3600, max: 3 },
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
          // Single query to check lock, deletion and active status atomically
          const [user] = await db
            .select({
              deletedAt: users.deletedAt,
              isActive: users.isActive,
              lockedUntil: users.lockedUntil,
              failedLoginAttempts: users.failedLoginAttempts,
            })
            .from(users)
            .where(eq(users.id, session.userId))

          if (!user) {
            throw new Error('Usuario no encontrado')
          }

          if (user.deletedAt) {
            throw new Error('Cuenta eliminada')
          }

          if (!user.isActive) {
            throw new Error('Cuenta desactivada')
          }

          if (user.lockedUntil && user.lockedUntil > new Date()) {
            const minutesLeft = Math.ceil(
              (user.lockedUntil.getTime() - Date.now()) / 60000,
            )
            throw new Error(
              `Cuenta bloqueada temporalmente. Intenta de nuevo en ${minutesLeft} minutos.`,
            )
          }

          const authSecurity = getAuthSecurityService()
          await authSecurity.resetFailedAttempts(session.userId)

          return { data: session }
        },
      },
    },
  },
})

export type Auth = typeof auth
