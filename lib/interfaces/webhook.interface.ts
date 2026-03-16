/**
 * Interface para servicios de webhooks.
 * Enviar y recibir webhooks con verificacion HMAC y retry.
 */

export interface WebhookConfig {
  id: string
  url: string
  secret: string
  events: string[]
  active: boolean
  createdAt: Date
}

export interface WebhookPayload {
  event: string
  data: Record<string, unknown>
  timestamp: number
}

export interface WebhookDelivery {
  id: string
  webhookId: string
  event: string
  payload: WebhookPayload
  statusCode: number | null
  response: string | null
  attempts: number
  success: boolean
  createdAt: Date
}

export interface WebhookSendOptions {
  retries?: number
  timeoutMs?: number
}

export interface IWebhookService {
  send(
    url: string,
    payload: WebhookPayload,
    secret: string,
    options?: WebhookSendOptions,
  ): Promise<WebhookDelivery>

  verify(body: string, signature: string, secret: string): boolean

  registerEndpoint(
    config: Omit<WebhookConfig, 'id' | 'createdAt'>,
  ): Promise<WebhookConfig>
  listEndpoints(): Promise<WebhookConfig[]>
  removeEndpoint(id: string): Promise<void>
}
