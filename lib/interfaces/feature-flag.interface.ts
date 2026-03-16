/**
 * Interface para servicios de feature flags.
 * Permite cambiar entre env vars, LaunchDarkly, Flagsmith, etc.
 */

export interface FlagContext {
  userId?: string
  role?: string
  email?: string
  environment?: string
  attributes?: Record<string, unknown>
}

export interface FlagVariant {
  key: string
  value: unknown
  payload?: Record<string, unknown>
}

export interface FeatureFlag {
  key: string
  enabled: boolean
  variant?: FlagVariant
  description?: string
}

export interface IFeatureFlagService {
  isEnabled(flag: string, context?: FlagContext): Promise<boolean>
  getVariant(flag: string, context?: FlagContext): Promise<FlagVariant | null>
  getAllFlags(context?: FlagContext): Promise<FeatureFlag[]>
}
