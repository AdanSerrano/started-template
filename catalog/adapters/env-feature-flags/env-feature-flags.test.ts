import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { EnvFeatureFlagService } from '@/lib/adapters/env-feature-flags'

describe('EnvFeatureFlagService', () => {
  let service: EnvFeatureFlagService
  const originalEnv = { ...process.env }

  beforeEach(() => {
    service = new EnvFeatureFlagService()
  })

  afterEach(() => {
    // Restore original env
    for (const key of Object.keys(process.env)) {
      if (key.startsWith('FEATURE_FLAG_') && !(key in originalEnv)) {
        delete process.env[key]
      }
    }
  })

  describe('isEnabled', () => {
    it('returns true for FEATURE_FLAG_MY_FLAG=true', async () => {
      process.env.FEATURE_FLAG_MY_FLAG = 'true'
      expect(await service.isEnabled('my_flag')).toBe(true)
    })

    it('returns false for missing flag', async () => {
      expect(await service.isEnabled('nonexistent')).toBe(false)
    })

    it('handles truthy values: 1, yes, on', async () => {
      process.env.FEATURE_FLAG_FLAG_ONE = '1'
      process.env.FEATURE_FLAG_FLAG_YES = 'yes'
      process.env.FEATURE_FLAG_FLAG_ON = 'on'
      expect(await service.isEnabled('flag_one')).toBe(true)
      expect(await service.isEnabled('flag_yes')).toBe(true)
      expect(await service.isEnabled('flag_on')).toBe(true)
    })

    it('returns false for FEATURE_FLAG=false', async () => {
      process.env.FEATURE_FLAG_DISABLED = 'false'
      expect(await service.isEnabled('disabled')).toBe(false)
    })

    it('converts flag name to uppercase with prefix', async () => {
      process.env.FEATURE_FLAG_DARK_MODE = 'true'
      expect(await service.isEnabled('dark_mode')).toBe(true)
    })

    it('replaces dots and dashes in flag name', async () => {
      process.env.FEATURE_FLAG_MY_FEATURE = 'true'
      expect(await service.isEnabled('my.feature')).toBe(true)
      expect(await service.isEnabled('my-feature')).toBe(true)
    })
  })

  describe('getVariant', () => {
    it('returns null for boolean flags', async () => {
      process.env.FEATURE_FLAG_BOOL = 'true'
      expect(await service.getVariant('bool')).toBeNull()
    })

    it('returns null for missing flag', async () => {
      expect(await service.getVariant('missing')).toBeNull()
    })

    it('returns variant for non-boolean value', async () => {
      process.env.FEATURE_FLAG_THEME = 'dark'
      const variant = await service.getVariant('theme')
      expect(variant).toEqual({ key: 'dark', value: 'dark' })
    })

    it('returns null for 0 and 1 values', async () => {
      process.env.FEATURE_FLAG_ZERO = '0'
      process.env.FEATURE_FLAG_ONE_VAL = '1'
      expect(await service.getVariant('zero')).toBeNull()
      expect(await service.getVariant('one_val')).toBeNull()
    })
  })

  describe('getAllFlags', () => {
    it('returns all FEATURE_FLAG_ env vars', async () => {
      process.env.FEATURE_FLAG_A = 'true'
      process.env.FEATURE_FLAG_B = 'false'
      process.env.FEATURE_FLAG_C = 'variant_x'
      const flags = await service.getAllFlags()
      const keys = flags.map((f) => f.key)
      expect(keys).toContain('a')
      expect(keys).toContain('b')
      expect(keys).toContain('c')
    })

    it('marks boolean flags correctly', async () => {
      process.env.FEATURE_FLAG_ENABLED = 'true'
      process.env.FEATURE_FLAG_DISABLED_FLAG = 'false'
      const flags = await service.getAllFlags()
      const enabled = flags.find((f) => f.key === 'enabled')
      const disabled = flags.find((f) => f.key === 'disabled-flag')
      expect(enabled?.enabled).toBe(true)
      expect(disabled?.enabled).toBe(false)
    })

    it('includes variant for non-boolean flags', async () => {
      process.env.FEATURE_FLAG_AB_TEST = 'control_group'
      const flags = await service.getAllFlags()
      const flag = flags.find((f) => f.key === 'ab-test')
      expect(flag?.enabled).toBe(true)
      expect(flag?.variant).toEqual({
        key: 'control_group',
        value: 'control_group',
      })
    })
  })
})
