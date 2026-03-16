import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('env validation', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  function setMinimalValidEnv() {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/testdb'
    process.env.BETTER_AUTH_SECRET =
      'a-secret-that-is-at-least-32-characters-long!'
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    process.env.RESEND_API_KEY = 're_test_123'
    process.env.NODE_ENV = 'production'
  }

  async function importEnv() {
    return import('@/lib/env')
  }

  describe('critical variables', () => {
    it('should throw when DATABASE_URL is missing', async () => {
      process.env.BETTER_AUTH_SECRET =
        'a-secret-that-is-at-least-32-characters-long!'
      delete process.env.DATABASE_URL

      await expect(importEnv()).rejects.toThrow(
        'Missing required environment variable: DATABASE_URL',
      )
    })

    it('should throw when BETTER_AUTH_SECRET is missing', async () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/testdb'
      delete process.env.BETTER_AUTH_SECRET

      await expect(importEnv()).rejects.toThrow(
        'Missing required environment variable: BETTER_AUTH_SECRET',
      )
    })

    it('should throw when DATABASE_URL is not a postgres URL', async () => {
      process.env.DATABASE_URL = 'mysql://localhost:3306/db'
      process.env.BETTER_AUTH_SECRET =
        'a-secret-that-is-at-least-32-characters-long!'

      await expect(importEnv()).rejects.toThrow(
        'DATABASE_URL must start with postgresql:// or postgres://',
      )
    })

    it('should accept postgres:// prefix', async () => {
      setMinimalValidEnv()
      process.env.DATABASE_URL = 'postgres://localhost:5432/testdb'

      const mod = await importEnv()

      expect(mod.env.DATABASE_URL).toBe('postgres://localhost:5432/testdb')
    })

    it('should throw when BETTER_AUTH_SECRET is too short', async () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/testdb'
      process.env.BETTER_AUTH_SECRET = 'short'

      await expect(importEnv()).rejects.toThrow(
        'BETTER_AUTH_SECRET must be at least 32 characters',
      )
    })
  })

  describe('recommended variables', () => {
    it('should throw in production when NEXT_PUBLIC_APP_URL is missing', async () => {
      setMinimalValidEnv()
      delete process.env.NEXT_PUBLIC_APP_URL

      await expect(importEnv()).rejects.toThrow(
        'Missing required environment variable: NEXT_PUBLIC_APP_URL',
      )
    })

    it('should throw in production when RESEND_API_KEY is missing', async () => {
      setMinimalValidEnv()
      delete process.env.RESEND_API_KEY

      await expect(importEnv()).rejects.toThrow(
        'Missing required environment variable: RESEND_API_KEY',
      )
    })

    it('should warn in dev when recommended vars are missing', async () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/testdb'
      process.env.BETTER_AUTH_SECRET =
        'a-secret-that-is-at-least-32-characters-long!'
      process.env.NODE_ENV = 'development'
      delete process.env.NEXT_PUBLIC_APP_URL
      delete process.env.RESEND_API_KEY

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const mod = await importEnv()

      expect(mod.env).toBeDefined()
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('NEXT_PUBLIC_APP_URL'),
      )
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('RESEND_API_KEY'),
      )

      warnSpy.mockRestore()
    })
  })

  describe('URL validation', () => {
    it('should throw when NEXT_PUBLIC_APP_URL is not a valid URL', async () => {
      setMinimalValidEnv()
      process.env.NEXT_PUBLIC_APP_URL = 'not-a-url'

      await expect(importEnv()).rejects.toThrow(
        'NEXT_PUBLIC_APP_URL must be a valid URL',
      )
    })
  })

  describe('paired variables', () => {
    it('should throw in production when GOOGLE_CLIENT_ID is set without SECRET', async () => {
      setMinimalValidEnv()
      process.env.GOOGLE_CLIENT_ID = 'google-id'
      delete process.env.GOOGLE_CLIENT_SECRET

      await expect(importEnv()).rejects.toThrow(
        'GOOGLE_CLIENT_ID is set but GOOGLE_CLIENT_SECRET is missing',
      )
    })

    it('should throw in production when GOOGLE_CLIENT_SECRET is set without ID', async () => {
      setMinimalValidEnv()
      process.env.GOOGLE_CLIENT_SECRET = 'google-secret'
      delete process.env.GOOGLE_CLIENT_ID

      await expect(importEnv()).rejects.toThrow(
        'GOOGLE_CLIENT_SECRET is set but GOOGLE_CLIENT_ID is missing',
      )
    })

    it('should accept both paired vars present', async () => {
      setMinimalValidEnv()
      process.env.GOOGLE_CLIENT_ID = 'google-id'
      process.env.GOOGLE_CLIENT_SECRET = 'google-secret'

      const mod = await importEnv()

      expect(mod.env).toBeDefined()
    })

    it('should warn in dev when R2 pair is incomplete', async () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/testdb'
      process.env.BETTER_AUTH_SECRET =
        'a-secret-that-is-at-least-32-characters-long!'
      process.env.NODE_ENV = 'development'
      process.env.R2_ACCESS_KEY_ID = 'r2-key'
      delete process.env.R2_SECRET_ACCESS_KEY

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const mod = await importEnv()

      expect(mod.env).toBeDefined()
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('R2_SECRET_ACCESS_KEY is missing'),
      )

      warnSpy.mockRestore()
    })
  })

  describe('EMAIL_FROM format validation', () => {
    it('should throw when EMAIL_FROM does not contain @', async () => {
      setMinimalValidEnv()
      process.env.EMAIL_FROM = 'invalid-email'

      await expect(importEnv()).rejects.toThrow(
        'EMAIL_FROM must be a valid email address (must contain @)',
      )
    })

    it('should accept valid EMAIL_FROM', async () => {
      setMinimalValidEnv()
      process.env.EMAIL_FROM = 'noreply@example.com'

      const mod = await importEnv()

      expect(mod.env).toBeDefined()
    })
  })

  describe('exported env object', () => {
    it('should export validated env with correct values', async () => {
      setMinimalValidEnv()

      const mod = await importEnv()

      expect(mod.env.DATABASE_URL).toBe('postgresql://localhost:5432/testdb')
      expect(mod.env.BETTER_AUTH_SECRET).toBe(
        'a-secret-that-is-at-least-32-characters-long!',
      )
      expect(mod.env.APP_URL).toBe('http://localhost:3000')
      expect(mod.env.RESEND_API_KEY).toBe('re_test_123')
    })

    it('should default APP_URL to localhost when not set in dev', async () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/testdb'
      process.env.BETTER_AUTH_SECRET =
        'a-secret-that-is-at-least-32-characters-long!'
      process.env.NODE_ENV = 'development'
      delete process.env.NEXT_PUBLIC_APP_URL

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const mod = await importEnv()

      expect(mod.env.APP_URL).toBe('http://localhost:3000')

      warnSpy.mockRestore()
    })
  })
})
