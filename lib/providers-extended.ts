/**
 * Extended Providers — Analytics, Monitoring, Notifications, Search,
 * Webhooks, Feature Flags, GDPR, Export/Import.
 */

import {
  XLSXExportService,
  ReactPDFExportService,
  XLSXImportService,
  PapaParseCSVImportService,
  ConsoleMonitoringAdapter,
  GA4AnalyticsService,
  InAppNotificationService,
  PgSearchService,
  WebhookService,
  EnvFeatureFlagService,
  GDPRService,
} from '@/lib/adapters'
import { createProvider } from '@/lib/create-provider'
import type {
  IExcelExportService,
  IPDFExportService,
  ICSVImportService,
  IExcelImportService,
  IErrorMonitoringService,
  IAnalyticsService,
  INotificationService,
  ISearchService,
  IWebhookService,
  IFeatureFlagService,
  IGDPRService,
} from '@/lib/interfaces'

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

// Internal references for resetProviders
export const _extendedProviders = [
  excelExport,
  pdfExport,
  csvImport,
  excelImport,
  errorMonitoring,
  analytics,
  notifications,
  search,
  webhooks,
  featureFlags,
  gdpr,
]
