// Core adapters. Las piezas opcionales viven en catalog/adapters/ y se
// reincorporan con `bun run add:adapter <name>` (ver catalog/README.md).

// Email
export { ResendEmailService } from './resend-email'

// Storage
export { R2StorageService } from './r2-storage'

// Jobs
export { TriggerJobsService } from './trigger-jobs'

// HTTP
export { FetchHttpClient } from './fetch-http'

// Cache
export { MemoryCacheService } from './memory-cache'

// Rate Limit
export { InMemoryRateLimitService } from './in-memory-rate-limit'

// Auth
export { BetterAuthProvider } from './better-auth-provider'

// Logger
export { PinoLogger } from './pino-logger'

// GDPR
export { GDPRService } from './gdpr'
