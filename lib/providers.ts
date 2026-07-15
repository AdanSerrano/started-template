/**
 * Providers — Factory para instanciar adapters.
 *
 * Este archivo centraliza la creacion de todas las instancias de infraestructura.
 * Para cambiar una implementacion, solo cambiar aqui.
 *
 * Los services NUNCA importan directamente de adapters, siempre via este provider.
 */

// ── Core Providers ──────────────────────────────────────────
export {
  getEmailService,
  setEmailInstance,
  getStorageService,
  setStorageInstance,
  getJobsService,
  setJobsInstance,
  getHttpClient,
  setHttpClientInstance,
  createHttpClient,
  getCacheService,
  setCacheInstance,
  getLogger,
  setLoggerInstance,
  _coreProviders,
} from '@/lib/providers-core'

// ── Extended Providers ──────────────────────────────────────
// Solo GDPR esta wired por defecto. El resto se reincorpora desde el catalogo
// (`bun run add:adapter <name>`), que tambien añade aqui su re-export.
export {
  getGDPRService,
  setGDPRService,
  _extendedProviders,
} from '@/lib/providers-extended'

import { _coreProviders } from '@/lib/providers-core'
import { _extendedProviders } from '@/lib/providers-extended'

/**
 * Resets all providers to their default (lazy) state.
 * Call in `afterEach` hooks to ensure test isolation.
 */
export function resetProviders(): void {
  ;[..._coreProviders, ..._extendedProviders].forEach((p) => p.reset())
}
