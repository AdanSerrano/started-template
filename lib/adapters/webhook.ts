/**
 * Webhook adapter con verificacion HMAC-SHA256 y retry.
 */

import type {
  IWebhookService,
  WebhookConfig,
  WebhookPayload,
  WebhookDelivery,
  WebhookSendOptions,
} from '@/lib/interfaces/webhook.interface'
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

export class WebhookService implements IWebhookService {
  private endpoints: Map<string, WebhookConfig> = new Map()

  async send(
    url: string,
    payload: WebhookPayload,
    secret: string,
    options?: WebhookSendOptions,
  ): Promise<WebhookDelivery> {
    const maxRetries = options?.retries ?? 3
    const timeoutMs = options?.timeoutMs ?? 10000
    const body = JSON.stringify(payload)
    const signature = sign(body, secret)

    let lastError: string | null = null
    let statusCode: number | null = null
    let responseBody: string | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), timeoutMs)

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': `sha256=${signature}`,
            'X-Webhook-Timestamp': String(payload.timestamp),
            'X-Webhook-Id': randomUUID(),
          },
          body,
          signal: controller.signal,
        })

        clearTimeout(timer)
        statusCode = response.status
        responseBody = await response.text()

        if (response.ok) {
          return {
            id: randomUUID(),
            webhookId: '',
            event: payload.event,
            payload,
            statusCode,
            response: responseBody,
            attempts: attempt,
            success: true,
            createdAt: new Date(),
          }
        }

        lastError = `HTTP ${statusCode}: ${responseBody}`
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Unknown error'
      }

      // Backoff exponencial entre reintentos
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)))
      }
    }

    return {
      id: randomUUID(),
      webhookId: '',
      event: payload.event,
      payload,
      statusCode,
      response: lastError,
      attempts: maxRetries,
      success: false,
      createdAt: new Date(),
    }
  }

  verify(body: string, signature: string, secret: string): boolean {
    const expected = `sha256=${sign(body, secret)}`
    try {
      return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    } catch {
      return false
    }
  }

  async registerEndpoint(
    config: Omit<WebhookConfig, 'id' | 'createdAt'>,
  ): Promise<WebhookConfig> {
    const endpoint: WebhookConfig = {
      ...config,
      id: randomUUID(),
      createdAt: new Date(),
    }
    this.endpoints.set(endpoint.id, endpoint)
    return endpoint
  }

  async listEndpoints(): Promise<WebhookConfig[]> {
    return Array.from(this.endpoints.values())
  }

  async removeEndpoint(id: string): Promise<void> {
    this.endpoints.delete(id)
  }
}
