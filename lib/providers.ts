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

// ── Auth ────────────────────────────────────────────────────
const authProvider = createProvider<IAuthProvider>(
  () => new BetterAuthProvider(),
)
export const getAuthProvider = authProvider.get
export const setAuthProvider = authProvider.set

// ── Email ───────────────────────────────────────────────────
const email = createProvider<IEmailService>(() => new ResendEmailService())
export const getEmailService = email.get
export const setEmailInstance = email.set

// ── Storage ─────────────────────────────────────────────────
const storage = createProvider<IStorageService>(() => new R2StorageService())
export const getStorageService = storage.get
export const setStorageInstance = storage.set

// ── Export ───────────────────────────────────────────────────
const excelExport = createProvider<IExcelExportService>(
  () => new XLSXExportService(),
)
export const getExcelExportService = excelExport.get
export const setExcelExportInstance = excelExport.set

const pdfExport = createProvider<IPDFExportService>(
  () => new ReactPDFExportService(),
)
export const getPDFExportService = pdfExport.get
export const setPDFExportInstance = pdfExport.set

// ── Import ──────────────────────────────────────────────────
const csvImport = createProvider<ICSVImportService>(
  () => new PapaParseCSVImportService(),
)
export const getCSVImportService = csvImport.get
export const setCSVImportInstance = csvImport.set

const excelImport = createProvider<IExcelImportService>(
  () => new XLSXImportService(),
)
export const getExcelImportService = excelImport.get
export const setExcelImportInstance = excelImport.set

// ── Jobs ────────────────────────────────────────────────────
const jobs = createProvider<IJobsService>(() => new TriggerJobsService())
export const getJobsService = jobs.get
export const setJobsInstance = jobs.set

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

// ── Error Monitoring ────────────────────────────────────────
const errorMonitoring = createProvider<IErrorMonitoringService>(
  () => new ConsoleMonitoringAdapter(),
)
export const getErrorMonitoring = errorMonitoring.get
export const setErrorMonitoringInstance = errorMonitoring.set

// ── Analytics ───────────────────────────────────────────────
const analytics = createProvider<IAnalyticsService>(
  () => new GA4AnalyticsService(),
)
export const getAnalytics = analytics.get
export const setAnalyticsInstance = analytics.set

// ── Cache ───────────────────────────────────────────────────
const cache = createProvider<ICache>(() => new MemoryCacheService())
export const getCacheService = cache.get
export const setCacheInstance = cache.set

// ── Rate Limit ──────────────────────────────────────────────
const rateLimit = createProvider<IRateLimitService>(
  () => new InMemoryRateLimitService(),
)
export const getRateLimitService = rateLimit.get
export const setRateLimitService = rateLimit.set

// ── Logger ──────────────────────────────────────────────────
const logger = createProvider<ILogger>(() => new ConsoleLogger())
export const getLogger = logger.get
export const setLoggerInstance = logger.set

// ── Notifications ──────────────────────────────────────────
const notifications = createProvider<INotificationService>(
  () => new InAppNotificationService(),
)
export const getNotificationService = notifications.get
export const setNotificationService = notifications.set

// ── Search ─────────────────────────────────────────────────
const search = createProvider<ISearchService>(() => new PgSearchService())
export const getSearchService = search.get
export const setSearchService = search.set

// ── Webhooks ───────────────────────────────────────────────
const webhooks = createProvider<IWebhookService>(() => new WebhookService())
export const getWebhookService = webhooks.get
export const setWebhookService = webhooks.set

// ── GDPR ───────────────────────────────────────────────────
const gdpr = createProvider<IGDPRService>(() => new GDPRService())
export const getGDPRService = gdpr.get
export const setGDPRService = gdpr.set

// ── Feature Flags ──────────────────────────────────────────
const featureFlags = createProvider<IFeatureFlagService>(
  () => new EnvFeatureFlagService(),
)
export const getFeatureFlagService = featureFlags.get
export const setFeatureFlagService = featureFlags.set

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
