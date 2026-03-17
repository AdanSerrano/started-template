import { z } from 'zod/v4'

const isDev = process.env.NODE_ENV !== 'production'

type DbDialect = 'postgresql' | 'mysql' | 'sqlite' | 'turso' | 'singlestore'

const dbDialectSchema = z.enum([
  'postgresql',
  'mysql',
  'sqlite',
  'turso',
  'singlestore',
])

const DB_DIALECT_HINTS: Record<DbDialect, string> = {
  postgresql: 'must start with postgresql:// or postgres://',
  mysql: 'must start with mysql:// or mysql2://',
  sqlite: 'must be a file path or :memory:',
  turso: 'must start with libsql://, file:, or be a file path',
  singlestore: 'must start with mysql:// or mysql2://',
}

function validateDatabaseUrl(url: string, dialect: DbDialect): boolean {
  switch (dialect) {
    case 'postgresql':
      return url.startsWith('postgresql://') || url.startsWith('postgres://')
    case 'mysql':
    case 'singlestore':
      return url.startsWith('mysql://') || url.startsWith('mysql2://')
    case 'sqlite':
      return url === ':memory:' || !url.startsWith('http')
    case 'turso':
      return (
        url.startsWith('libsql://') ||
        url.startsWith('file:') ||
        url === ':memory:' ||
        !url.startsWith('http')
      )
  }
}

// ── Schema definition ────────────────────────────────────────

const envSchema = z
  .object({
    // Critical — app does NOT start without these
    DATABASE_URL: z.string().min(1, { error: 'DATABASE_URL is required' }),
    BETTER_AUTH_SECRET: z
      .string()
      .min(32, { error: 'BETTER_AUTH_SECRET must be at least 32 characters' }),

    // Dialect
    DB_DIALECT: dbDialectSchema.default('postgresql'),

    // Recommended — warn in dev, throw in production
    NEXT_PUBLIC_APP_URL: z.url({ error: 'Must be a valid URL' }).optional(),
    RESEND_API_KEY: z.string().optional(),

    // Paired — require both or neither
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    UPSTASH_REDIS_REST_URL: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),

    // Optional
    SENTRY_DSN: z.string().optional(),
    CORS_ALLOWED_ORIGINS: z.string().optional(),
    EMAIL_FROM: z
      .string()
      .refine((v) => v.includes('@'), {
        error: 'EMAIL_FROM must contain @',
      })
      .optional(),
  })
  .check((ctx) => {
    if (!validateDatabaseUrl(ctx.value.DATABASE_URL, ctx.value.DB_DIALECT)) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value.DATABASE_URL,
        message: `DATABASE_URL ${DB_DIALECT_HINTS[ctx.value.DB_DIALECT]} (DB_DIALECT=${ctx.value.DB_DIALECT})`,
      })
    }
  })

// ── Parse & validate ─────────────────────────────────────────

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const issues = parsed.error.issues
  const messages = issues.map((issue) => {
    if (issue.path.length > 0) {
      return `${issue.path.join('.')}: ${issue.message}`
    }
    return issue.message
  })
  throw new Error(`Environment validation failed:\n${messages.join('\n')}`)
}

const data = parsed.data

// ── Recommended variable warnings ────────────────────────────

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

// ── Paired variable validation ───────────────────────────────

const paired: [string, string][] = [
  ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
  ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
  ['R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'],
]

for (const [a, b] of paired) {
  const hasA = !!process.env[a]
  const hasB = !!process.env[b]
  if (hasA !== hasB) {
    const present = hasA ? a : b
    const missing = hasA ? b : a
    const msg = `${present} is set but ${missing} is missing — both are required`
    if (isDev) {
      console.warn(`[env] ${msg}`)
    } else {
      throw new Error(msg)
    }
  }
}

// ── Exported validated env ───────────────────────────────────

export const env = {
  DATABASE_URL: data.DATABASE_URL,
  DB_DIALECT: data.DB_DIALECT,
  BETTER_AUTH_SECRET: data.BETTER_AUTH_SECRET,
  APP_URL: data.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  RESEND_API_KEY: data.RESEND_API_KEY ?? '',
} as const
