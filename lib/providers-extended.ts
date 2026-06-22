/**
 * Extended Providers — servicios de infraestructura mas alla del core.
 *
 * Solo GDPR esta wired por defecto (lo usa el modulo account). El resto
 * (analytics, search, webhooks, notifications, feature-flags, export/import,
 * error-monitoring) vive en catalog/adapters/ y se reincorpora con
 * `bun run add:adapter <name>` (ver catalog/README.md y docs/catalog.md).
 */

import { GDPRService } from '@/lib/adapters'
import { createProvider } from '@/lib/create-provider'
import type { IGDPRService } from '@/lib/interfaces'

// ── GDPR ───────────────────────────────────────────────────
const gdpr = createProvider<IGDPRService>(() => new GDPRService())
export const getGDPRService = gdpr.get
export const setGDPRService = gdpr.set

// Internal references for resetProviders
export const _extendedProviders = [gdpr]
