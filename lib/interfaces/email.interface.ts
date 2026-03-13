import type { ReactElement } from 'react'

/**
 * Parametros para enviar un email.
 */
export interface SendEmailParams {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  react?: ReactElement
  from?: string
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
  idempotencyKey?: string | undefined
  tags?: { name: string; value: string }[] | undefined
}

/**
 * Resultado de enviar un email.
 */
export interface SendEmailResult {
  id: string
}

/**
 * Interface para servicios de email.
 * Permite cambiar Resend por SendGrid, AWS SES, etc. sin tocar services.
 */
export interface IEmailService {
  send(params: SendEmailParams): Promise<SendEmailResult>
  sendBatch(params: SendEmailParams[]): Promise<{ ids: string[] }>
}
