/**
 * Providers — Factory para instanciar adapters.
 *
 * Este archivo centraliza la creacion de todas las instancias de infraestructura.
 * Para cambiar una implementacion, solo cambiar aqui.
 *
 * Los services NUNCA importan directamente de adapters, siempre via este provider.
 */

import type {
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
} from '@/lib/interfaces'

import {
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
} from '@/lib/adapters'

// ────────────────────────────────────────────────────────────
// Singletons — se instancian una vez y se reutilizan
// ────────────────────────────────────────────────────────────

let emailInstance: IEmailService | null = null
let storageInstance: IStorageService | null = null
let excelExportInstance: IExcelExportService | null = null
let pdfExportInstance: IPDFExportService | null = null
let csvImportInstance: ICSVImportService | null = null
let excelImportInstance: IExcelImportService | null = null
let jobsInstance: IJobsService | null = null
let httpClientInstance: IHttpClient | null = null
let errorMonitoringInstance: IErrorMonitoringService | null = null
let analyticsInstance: IAnalyticsService | null = null
let cacheInstance: ICache | null = null

// ────────────────────────────────────────────────────────────
// Email
// ────────────────────────────────────────────────────────────

export function getEmailService(): IEmailService {
  if (!emailInstance) {
    emailInstance = new ResendEmailService()
  }
  return emailInstance
}

// ────────────────────────────────────────────────────────────
// Storage
// ────────────────────────────────────────────────────────────

export function getStorageService(): IStorageService {
  if (!storageInstance) {
    storageInstance = new R2StorageService()
  }
  return storageInstance
}

// ────────────────────────────────────────────────────────────
// Export
// ────────────────────────────────────────────────────────────

export function getExcelExportService(): IExcelExportService {
  if (!excelExportInstance) {
    excelExportInstance = new XLSXExportService()
  }
  return excelExportInstance
}

export function getPDFExportService(): IPDFExportService {
  if (!pdfExportInstance) {
    pdfExportInstance = new ReactPDFExportService()
  }
  return pdfExportInstance
}

// ────────────────────────────────────────────────────────────
// Import
// ────────────────────────────────────────────────────────────

export function getCSVImportService(): ICSVImportService {
  if (!csvImportInstance) {
    csvImportInstance = new PapaParseCSVImportService()
  }
  return csvImportInstance
}

export function getExcelImportService(): IExcelImportService {
  if (!excelImportInstance) {
    excelImportInstance = new XLSXImportService()
  }
  return excelImportInstance
}

// ────────────────────────────────────────────────────────────
// Jobs
// ────────────────────────────────────────────────────────────

export function getJobsService(): IJobsService {
  if (!jobsInstance) {
    jobsInstance = new TriggerJobsService()
  }
  return jobsInstance
}

// ────────────────────────────────────────────────────────────
// HTTP Client
// ────────────────────────────────────────────────────────────

export function getHttpClient(): IHttpClient {
  if (!httpClientInstance) {
    httpClientInstance = new FetchHttpClient()
  }
  return httpClientInstance
}

export function createHttpClient(
  baseURL: string,
  defaultHeaders?: Record<string, string>,
): IHttpClient {
  return new AxiosHttpClient(baseURL, defaultHeaders)
}

// ────────────────────────────────────────────────────────────
// Error Monitoring
// ────────────────────────────────────────────────────────────

export function getErrorMonitoring(): IErrorMonitoringService {
  if (!errorMonitoringInstance) {
    errorMonitoringInstance = new ConsoleMonitoringAdapter()
  }
  return errorMonitoringInstance
}

// ────────────────────────────────────────────────────────────
// Analytics
// ────────────────────────────────────────────────────────────

export function getAnalytics(): IAnalyticsService {
  if (!analyticsInstance) {
    analyticsInstance = new GA4AnalyticsService()
  }
  return analyticsInstance
}

// ────────────────────────────────────────────────────────────
// Cache
// ────────────────────────────────────────────────────────────

export function getCacheService(): ICache {
  if (!cacheInstance) {
    cacheInstance = new MemoryCacheService()
  }
  return cacheInstance
}

// ────────────────────────────────────────────────────────────
// Testing — permite inyectar mocks
// ────────────────────────────────────────────────────────────

export function setEmailInstance(email: IEmailService): void {
  emailInstance = email
}

export function setStorageInstance(storage: IStorageService): void {
  storageInstance = storage
}

export function setHttpClientInstance(http: IHttpClient): void {
  httpClientInstance = http
}

export function setErrorMonitoringInstance(
  monitoring: IErrorMonitoringService,
): void {
  errorMonitoringInstance = monitoring
}

export function resetProviders(): void {
  emailInstance = null
  storageInstance = null
  excelExportInstance = null
  pdfExportInstance = null
  csvImportInstance = null
  excelImportInstance = null
  jobsInstance = null
  httpClientInstance = null
  errorMonitoringInstance = null
  analyticsInstance = null
  cacheInstance = null
}

export function setAnalyticsInstance(analytics: IAnalyticsService): void {
  analyticsInstance = analytics
}

export function setCacheInstance(cache: ICache): void {
  cacheInstance = cache
}
