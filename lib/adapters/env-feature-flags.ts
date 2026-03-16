/**
 * Feature flags basados en variables de entorno.
 *
 * Convencion: FEATURE_FLAG_<NAME>=true|false|variant_key
 *
 * Para produccion con mas control, migrar a LaunchDarkly, Flagsmith, etc.
 */

import type {
  IFeatureFlagService,
  FeatureFlag,
  FlagContext,
  FlagVariant,
} from '@/lib/interfaces/feature-flag.interface'

const FLAG_PREFIX = 'FEATURE_FLAG_'

function getEnvFlagValue(flag: string): string | undefined {
  const envKey = `${FLAG_PREFIX}${flag.toUpperCase().replace(/[.-]/g, '_')}`
  return process.env[envKey]
}

function parseBoolean(value: string): boolean {
  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase())
}

export class EnvFeatureFlagService implements IFeatureFlagService {
  async isEnabled(flag: string, _context?: FlagContext): Promise<boolean> {
    const value = getEnvFlagValue(flag)
    if (!value) return false
    return parseBoolean(value)
  }

  async getVariant(
    flag: string,
    _context?: FlagContext,
  ): Promise<FlagVariant | null> {
    const value = getEnvFlagValue(flag)
    if (!value) return null

    // Si es boolean, retornar null (no es un variant)
    if (['true', 'false', '1', '0'].includes(value.toLowerCase())) {
      return null
    }

    // El valor es el variant key
    return {
      key: value,
      value,
    }
  }

  async getAllFlags(_context?: FlagContext): Promise<FeatureFlag[]> {
    const flags: FeatureFlag[] = []

    for (const [key, value] of Object.entries(process.env)) {
      if (!key.startsWith(FLAG_PREFIX) || !value) continue

      const flagKey = key
        .slice(FLAG_PREFIX.length)
        .toLowerCase()
        .replace(/_/g, '-')

      const isBoolean = ['true', 'false', '1', '0'].includes(
        value.toLowerCase(),
      )

      const flag: FeatureFlag = {
        key: flagKey,
        enabled: isBoolean ? parseBoolean(value) : true,
      }
      if (!isBoolean) {
        flag.variant = { key: value, value }
      }
      flags.push(flag)
    }

    return flags
  }
}
