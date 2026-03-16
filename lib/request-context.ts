/**
 * Request context via AsyncLocalStorage.
 *
 * Permite propagar el requestId a traves de todo el stack
 * sin pasarlo explicitamente como parametro.
 */

import { AsyncLocalStorage } from 'node:async_hooks'
import { randomUUID } from 'node:crypto'

interface RequestContext {
  requestId: string
  [key: string]: unknown
}

const storage = new AsyncLocalStorage<RequestContext>()

export function generateRequestId(): string {
  return randomUUID().slice(0, 8)
}

export function getRequestId(): string | undefined {
  return storage.getStore()?.requestId
}

export function getRequestContext(): RequestContext | undefined {
  return storage.getStore()
}

export function withRequestContext<T>(context: RequestContext, fn: () => T): T {
  return storage.run(context, fn)
}
