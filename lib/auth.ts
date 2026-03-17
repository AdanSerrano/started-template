import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { betterAuth } from 'better-auth/minimal'
import { eq } from 'drizzle-orm'
import { DIALECT } from '@/db/dialect'
import {
  users,
  sessions,
  accounts,
  verifications,
  twoFactors,
} from '@/db/schema'
import { getEmailTranslations } from '@/emails/i18n'
import { ResetPasswordEmail } from '@/emails/reset-password'
import { VerificationEmail } from '@/emails/verification'
import { createAuthPlugins, getLocaleFromRequest } from '@/lib/auth-plugins'
import { appConfig } from '@/lib/config'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { getAuthSecurityService } from '@/modules/auth/services/auth-security-service'

export const auth = betterAuth({
  appName: appConfig.name,
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'],

  database: drizzleAdapter(db, {
    provider:
      DIALECT === 'postgresql'
        ? 'pg'
        : DIALECT === 'turso' || DIALECT === 'sqlite'
          ? 'sqlite'
          : DIALECT === 'singlestore'
            ? 'mysql'
            : DIALECT,
    schema: { users, sessions, accounts, verifications, twoFactors },
    usePlural: true,
  }),

  plugins: createAuthPlugins(),

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
      phone: { type: 'string', required: false },
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
      lockedUntil: { type: 'date', required: false, input: false },
      deletedAt: { type: 'date', required: false, input: false },
      deletedBy: { type: 'string', required: false, input: false },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 2 * 60, strategy: 'compact' },
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

  advanced: { database: { generateId: false } },

  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const [user] = await db
            .select({
              deletedAt: users.deletedAt,
              isActive: users.isActive,
              lockedUntil: users.lockedUntil,
              failedLoginAttempts: users.failedLoginAttempts,
            })
            .from(users)
            .where(eq(users.id, session.userId))

          if (!user) throw new Error('Usuario no encontrado')
          if (user.deletedAt) throw new Error('Cuenta eliminada')
          if (!user.isActive) throw new Error('Cuenta desactivada')

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
