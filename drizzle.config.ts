import { defineConfig } from 'drizzle-kit'
import { DIALECT } from '@/db/dialect'

export default defineConfig({
  schema: './db/schema/index.ts',
  out: './db/migrations',
  dialect: DIALECT,
  strict: true,
  verbose: true,
  casing: 'snake_case',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
