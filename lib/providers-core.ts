/**
 * Core Providers — Auth, Email, Storage, Jobs, HTTP, Cache, Logger, Rate Limit.
 */

import {
  BetterAuthProvider,
  ResendEmailService,
  R2StorageService,
  TriggerJobsService,
  AxiosHttpClient,
  FetchHttpClient,
  MemoryCacheService,
  InMemoryRateLimitService,
  PinoLogger,
} from '@/lib/adapters'
import { createProvider } from '@/lib/create-provider'
import type {
  IAuthProvider,
  IEmailService,
  IStorageService,
  IJobsService,
  IHttpClient,
  ICache,
  IRateLimitService,
  ILogger,
} from '@/lib/interfaces'

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
const logger = createProvider<ILogger>(() => new PinoLogger())
export const getLogger = logger.get
export const setLoggerInstance = logger.set

// Internal references for resetProviders
export const _coreProviders = [
  authProvider,
  email,
  storage,
  jobs,
  httpClient,
  cache,
  rateLimit,
  logger,
]
