const isDev = process.env.NODE_ENV !== 'production'

const critical = ['DATABASE_URL', 'BETTER_AUTH_SECRET'] as const

const recommended = ['NEXT_PUBLIC_APP_URL', 'RESEND_API_KEY'] as const

const optional = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'] as const

for (const key of critical) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

for (const key of recommended) {
  if (!process.env[key]) {
    if (isDev) {
      console.warn(`[env] Missing variable: ${key} (required in production)`)
    } else {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }
}

for (const key of optional) {
  if (!process.env[key] && isDev) {
    console.warn(`[env] Missing optional variable: ${key}`)
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? '',
} as const
