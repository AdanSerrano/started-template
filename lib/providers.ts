/**
 * Providers — Factory para instanciar adapters.
 *
 * Este archivo centraliza la creacion de todas las instancias de infraestructura.
 * Para cambiar una implementacion, solo cambiar aqui.
 *
 * Los services NUNCA importan directamente de adapters, siempre via este provider.
 */

import { createProvider } from '@/lib/create-provider'
import type {
  IAuthProvider,
  IEmailService,
  IStorageService,
  IExcelExportService,
  IPDFExportService,
  ICSVImportService,
  IExcelImportService,
  IJobsService,
  IHttpClient,
  IErrorMonitoringService,
  IAnalyticsService,
  ICache,
  IRateLimitService,
  ILogger,
  INotificationService,
  ISearchService,
  IWebhookService,
  IFeatureFlagService,
  IGDPRService,
} from '@/lib/interfaces'

import {
  BetterAuthProvider,
  ResendEmailService,
  R2StorageService,
  XLSXExportService,
  ReactPDFExportService,
  XLSXImportService,
  PapaParseCSVImportService,
  TriggerJobsService,
  AxiosHttpClient,
  FetchHttpClient,
  ConsoleMonitoringAdapter,
  GA4AnalyticsService,
  MemoryCacheService,
  InMemoryRateLimitService,
  ConsoleLogger,
  InAppNotificationService,
  PgSearchService,
  WebhookService,
  EnvFeatureFlagService,
  GDPRService,
} from '@/lib/adapters'

/**
 * Authentication provider — sessions, OAuth, magic links, 2FA.
 * Swap: `setAuthProvider(new FakeAuthProvider())`
 */
// ── Auth ────────────────────────────────────────────────────
const authProvider = createProvider<IAuthProvider>(
  () => new BetterAuthProvider(),
)
export const getAuthProvider = authProvider.get
export const setAuthProvider = authProvider.set

/**
 * Transactional email — verification, password resets, notifications.
 * Swap: `setEmailInstance(new InMemoryEmailService())`
 */
// ── Email ───────────────────────────────────────────────────
const email = createProvider<IEmailService>(() => new ResendEmailService())
export const getEmailService = email.get
export const setEmailInstance = email.set

/**
 * File storage — uploads, downloads, deletion. Key: `public/{module}/{entityId}/{uuid}.{ext}`.
 * Swap: `setStorageInstance(new InMemoryStorageService())`
 */
// ── Storage ─────────────────────────────────────────────────
const storage = createProvider<IStorageService>(() => new R2StorageService())
export const getStorageService = storage.get
export const setStorageInstance = storage.set

/**
 * Excel export — generates `.xlsx` from structured data (reports, listings).
 * Swap: `setExcelExportInstance(new FakeExcelExportService())`
 */
// ── Export ───────────────────────────────────────────────────
const excelExport = createProvider<IExcelExportService>(
  () => new XLSXExportService(),
)
export const getExcelExportService = excelExport.get
export const setExcelExportInstance = excelExport.set

/**
 * PDF export — generates PDFs (invoices, receipts, reports).
 * Swap: `setPDFExportInstance(new FakePDFExportService())`
 */
const pdfExport = createProvider<IPDFExportService>(
  () => new ReactPDFExportService(),
)
export const getPDFExportService = pdfExport.get
export const setPDFExportInstance = pdfExport.set

/**
 * CSV import — parses `.csv` files for bulk data import.
 * Swap: `setCSVImportInstance(new FakeCSVImportService())`
 */
// ── Import ──────────────────────────────────────────────────
const csvImport = createProvider<ICSVImportService>(
  () => new PapaParseCSVImportService(),
)
export const getCSVImportService = csvImport.get
export const setCSVImportInstance = csvImport.set

/**
 * Excel import — parses `.xlsx` files for bulk data import.
 * Swap: `setExcelImportInstance(new FakeExcelImportService())`
 */
const excelImport = createProvider<IExcelImportService>(
  () => new XLSXImportService(),
)
export const getExcelImportService = excelImport.get
export const setExcelImportInstance = excelImport.set

/**
 * Background jobs — async tasks (bulk emails, file processing, reports).
 * Swap: `setJobsInstance(new InMemoryJobsService())`
 */
// ── Jobs ────────────────────────────────────────────────────
const jobs = createProvider<IJobsService>(() => new TriggerJobsService())
export const getJobsService = jobs.get
export const setJobsInstance = jobs.set

/**
 * HTTP client — external API calls. Use `createHttpClient(baseURL)` for fixed base URLs.
 * Swap: `setHttpClientInstance(new MockHttpClient())`
 */
// ── HTTP Client ─────────────────────────────────────────────
const httpClient = createProvider<IHttpClient>(() => new FetchHttpClient())
export const getHttpClient = httpClient.get
export const setHttpClientInstance = httpClient.set

export function createHttpClient(
  baseURL: string,
  defaultHeaders?: Record<string, string>,
): IHttpClient {
  return new AxiosHttpClient(baseURL, defaultHeaders)
}

/**
 * Error monitoring — captures and reports unhandled exceptions.
 * Swap: `setErrorMonitoringInstance(new NoOpMonitoringService())`
 */
// ── Error Monitoring ────────────────────────────────────────
const errorMonitoring = createProvider<IErrorMonitoringService>(
  () => new ConsoleMonitoringAdapter(),
)
export const getErrorMonitoring = errorMonitoring.get
export const setErrorMonitoringInstance = errorMonitoring.set

/**
 * Analytics — tracks user events, page views, and custom metrics.
 * Swap: `setAnalyticsInstance(new NoOpAnalyticsService())`
 */
// ── Analytics ───────────────────────────────────────────────
const analytics = createProvider<IAnalyticsService>(
  () => new GA4AnalyticsService(),
)
export const getAnalytics = analytics.get
export const setAnalyticsInstance = analytics.set

/**
 * Key-value cache — get/set/delete with TTL. Swap to Redis for multi-instance.
 * Swap: `setCacheInstance(new MemoryCacheService())`
 */
// ── Cache ───────────────────────────────────────────────────
const cache = createProvider<ICache>(() => new MemoryCacheService())
export const getCacheService = cache.get
export const setCacheInstance = cache.set

/**
 * Rate limiting — sliding window per key (IP, userId). Prevents abuse.
 * Swap: `setRateLimitService(new NoOpRateLimitService())`
 */
// ── Rate Limit ──────────────────────────────────────────────
const rateLimit = createProvider<IRateLimitService>(
  () => new InMemoryRateLimitService(),
)
export const getRateLimitService = rateLimit.get
export const setRateLimitService = rateLimit.set

/**
 * Structured logging — leveled (info, warn, error, debug) with context.
 * Swap: `setLoggerInstance(new SilentLogger())`
 */
// ── Logger ──────────────────────────────────────────────────
const logger = createProvider<ILogger>(() => new ConsoleLogger())
export const getLogger = logger.get
export const setLoggerInstance = logger.set

/**
 * User notifications — in-app alerts (bell icon, toasts, assignments).
 * Swap: `setNotificationService(new InMemoryNotificationService())`
 */
// ── Notifications ──────────────────────────────────────────
const notifications = createProvider<INotificationService>(
  () => new InAppNotificationService(),
)
export const getNotificationService = notifications.get
export const setNotificationService = notifications.set

/**
 * Full-text search — PostgreSQL by default. Swap to Meilisearch/Algolia.
 * Swap: `setSearchService(new InMemorySearchService())`
 */
// ── Search ─────────────────────────────────────────────────
const search = createProvider<ISearchService>(() => new PgSearchService())
export const getSearchService = search.get
export const setSearchService = search.set

/**
 * Outgoing webhooks — delivers payloads to external endpoints on events.
 * Swap: `setWebhookService(new FakeWebhookService())`
 */
// ── Webhooks ───────────────────────────────────────────────
const webhooks = createProvider<IWebhookService>(() => new WebhookService())
export const getWebhookService = webhooks.get
export const setWebhookService = webhooks.set

/**
 * GDPR compliance — data export, anonymization, right-to-be-forgotten.
 * Swap: `setGDPRService(new FakeGDPRService())`
 */
// ── GDPR ───────────────────────────────────────────────────
const gdpr = createProvider<IGDPRService>(() => new GDPRService())
export const getGDPRService = gdpr.get
export const setGDPRService = gdpr.set

/**
 * Feature flags — controls visibility and gradual rollouts. Env-based by default.
 * Swap: `setFeatureFlagService(new StaticFeatureFlagService({ myFlag: true }))`
 */
// ── Feature Flags ──────────────────────────────────────────
const featureFlags = createProvider<IFeatureFlagService>(
  () => new EnvFeatureFlagService(),
)
export const getFeatureFlagService = featureFlags.get
export const setFeatureFlagService = featureFlags.set

/**
 * Resets all providers to their default (lazy) state.
 * Call in `afterEach` hooks to ensure test isolation.
 */
// ── Reset — para testing ────────────────────────────────────
export function resetProviders(): void {
  ;[
    authProvider,
    email,
    storage,
    excelExport,
    pdfExport,
    csvImport,
    excelImport,
    jobs,
    httpClient,
    errorMonitoring,
    analytics,
    cache,
    rateLimit,
    logger,
    notifications,
    search,
    webhooks,
    featureFlags,
    gdpr,
  ].forEach((p) => p.reset())
}
