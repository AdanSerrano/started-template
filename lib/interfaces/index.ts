// Auth
export type { IAuthProvider, AuthSessionData } from './auth.interface'

// Cache
export type { ICache } from './cache.interface'

// Email
export type {
  IEmailService,
  SendEmailParams,
  SendEmailResult,
} from './email.interface'

// Storage
export type { IStorageService } from './storage.interface'

// Export
export type {
  IPDFExportService,
  IExcelExportService,
  PDFExportOptions,
  ExcelExportOptions,
} from './export.interface'

// Import
export type {
  ICSVImportService,
  IExcelImportService,
  ParseResult,
  CSVParseOptions,
  ExcelParseOptions,
} from './import.interface'

// Rate Limit
export type {
  IRateLimitService,
  RateLimitResult,
  RateLimitConfig,
} from './rate-limit.interface'

// Analytics
export type {
  IAnalyticsService,
  AnalyticsEventProperties,
  AnalyticsUserProperties,
  AnalyticsEcommerceItem,
} from './analytics.interface'

// Jobs
export type {
  IJobsService,
  JobStatus,
  JobResult,
  JobOptions,
} from './jobs.interface'

// HTTP
export type {
  IHttpClient,
  HttpRequestOptions,
  HttpResponse,
} from './http.interface'

// Error Monitoring
export type { IErrorMonitoringService } from './error-monitoring.interface'

// Logger
export type { ILogger, LogContext, LogLevel } from './logger.interface'

// Notifications
export type {
  INotificationService,
  Notification,
  NotificationPayload,
  NotificationChannel,
  NotificationPriority,
} from './notification.interface'

// Search
export type {
  ISearchService,
  SearchOptions,
  SearchResult,
  SearchHit,
  SearchFacet,
  IndexDocument,
} from './search.interface'

// Webhooks
export type {
  IWebhookService,
  WebhookConfig,
  WebhookPayload,
  WebhookDelivery,
  WebhookSendOptions,
} from './webhook.interface'

// Feature Flags
export type {
  IFeatureFlagService,
  FeatureFlag,
  FlagContext,
  FlagVariant,
} from './feature-flag.interface'

// GDPR
export type {
  IGDPRService,
  UserDataExport,
  DataCategory,
} from './gdpr.interface'
