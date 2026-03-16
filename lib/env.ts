const isDev = process.env.NODE_ENV !== 'production'

// ── Validation helpers ──────────────────────────────────────

function isValidUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function isValidPostgresUrl(value: string): boolean {
  return value.startsWith('postgresql://') || value.startsWith('postgres://')
}

// ── Critical — la app NO arranca sin estas ──────────────────

const critical = ['DATABASE_URL', 'BETTER_AUTH_SECRET'] as const

for (const key of critical) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

if (!isValidPostgresUrl(process.env.DATABASE_URL!)) {
  throw new Error('DATABASE_URL must start with postgresql:// or postgres://')
}

if (process.env.BETTER_AUTH_SECRET!.length < 32) {
  throw new Error('BETTER_AUTH_SECRET must be at least 32 characters')
}

// ── Recommended — warn en dev, throw en produccion ──────────

const recommended = ['NEXT_PUBLIC_APP_URL', 'RESEND_API_KEY'] as const

for (const key of recommended) {
  if (!process.env[key]) {
    if (isDev) {
      console.warn(`[env] Missing variable: ${key} (required in production)`)
    } else {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }
}

if (
  process.env.NEXT_PUBLIC_APP_URL &&
  !isValidUrl(process.env.NEXT_PUBLIC_APP_URL)
) {
  throw new Error('NEXT_PUBLIC_APP_URL must be a valid URL')
}

// ── Paired — variables que requieren ambas o ninguna ─────────

const paired: [string, string][] = [
  ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
  ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
  ['R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'],
]

for (const [a, b] of paired) {
  if (process.env[a] && !process.env[b]) {
    const msg = `${a} is set but ${b} is missing — both are required`
    if (isDev) console.warn(`[env] ${msg}`)
    else throw new Error(msg)
  }
  if (process.env[b] && !process.env[a]) {
    const msg = `${b} is set but ${a} is missing — both are required`
    if (isDev) console.warn(`[env] ${msg}`)
    else throw new Error(msg)
  }
}

// ── Optional — solo warn en dev ─────────────────────────────

const optional = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'SENTRY_DSN',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'CORS_ALLOWED_ORIGINS',
] as const

for (const key of optional) {
  if (!process.env[key] && isDev) {
    console.warn(`[env] Missing optional variable: ${key}`)
  }
}

// ── Format validation ────────────────────────────────────────

if (process.env.EMAIL_FROM && !process.env.EMAIL_FROM.includes('@')) {
  throw new Error('EMAIL_FROM must be a valid email address (must contain @)')
}

// ── Exported validated env ──────────────────────────────────

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? '',
} as const
