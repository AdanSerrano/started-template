/**
 * Core Providers — Email, Storage, Jobs, HTTP, Cache, Logger.
 *
 * Auth NO va aquí: la app usa `auth` (lib/auth) y getServerSession
 * (lib/auth-server) directamente. Rate limit vive en lib/rate-limit.ts
 * (in-memory) o catalog/adapters/upstash-rate-limit para multi-instancia.
 */

import {
  ResendEmailService,
  R2StorageService,
  TriggerJobsService,
  FetchHttpClient,
  MemoryCacheService,
  PinoLogger,
} from '@/lib/adapters'
import { createProvider } from '@/lib/create-provider'
import type {
  IEmailService,
  IStorageService,
  IJobsService,
  IHttpClient,
  ICache,
  ILogger,
} from '@/lib/interfaces'

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
  return new FetchHttpClient(baseURL, defaultHeaders)
}

// ── Cache ───────────────────────────────────────────────────
const cache = createProvider<ICache>(() => new MemoryCacheService())
export const getCacheService = cache.get
export const setCacheInstance = cache.set

// ── Logger ──────────────────────────────────────────────────
const logger = createProvider<ILogger>(() => new PinoLogger())
export const getLogger = logger.get
export const setLoggerInstance = logger.set

// Internal references for resetProviders
export const _coreProviders = [email, storage, jobs, httpClient, cache, logger]
