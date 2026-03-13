import { Resend } from 'resend'
import type { ReactElement } from 'react'
import type {
  IEmailService,
  SendEmailParams,
  SendEmailResult,
} from '@/lib/interfaces'

/**
 * Implementacion de IEmailService usando Resend.
 * Para cambiar a SendGrid, AWS SES, etc., crear nuevo adapter.
 */
export class ResendEmailService implements IEmailService {
  private client: Resend

  constructor() {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error(
        'RESEND_API_KEY is not defined. Set it in your environment variables.',
      )
    }
    this.client = new Resend(apiKey)
  }

  async send(params: SendEmailParams): Promise<SendEmailResult> {
    // Resend requires at least one of: html, react, or text
    if (!params.html && !params.react && !params.text) {
      throw new Error('Email must have either text, html, or react content')
    }

    // Build base options
    const baseOptions = {
      from: params.from ?? '',
      to: params.to,
      subject: params.subject,
      ...(params.replyTo && { replyTo: params.replyTo }),
      ...(params.cc && { cc: params.cc }),
      ...(params.bcc && { bcc: params.bcc }),
      ...(params.tags && { tags: params.tags }),
    }

    // Add content - priority: react > html > text
    let options: typeof baseOptions & {
      react?: ReactElement
      html?: string
      text?: string
    }
    if (params.react) {
      options = { ...baseOptions, react: params.react }
    } else if (params.html) {
      options = { ...baseOptions, html: params.html }
    } else {
      options = { ...baseOptions, text: params.text! }
    }

    // Build headers with optional idempotency key
    const headers: Record<string, string> = {}
    if (params.idempotencyKey) {
      headers['Idempotency-Key'] = params.idempotencyKey
    }

    const { data, error } = await this.client.emails.send(options, {
      headers,
    })

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return { id: data!.id }
  }

  async sendBatch(params: SendEmailParams[]): Promise<{ ids: string[] }> {
    const emails = params.map((p) => {
      // Build content
      const content: { react?: ReactElement; html?: string; text?: string } = {}
      if (p.react) {
        content.react = p.react
      } else if (p.html) {
        content.html = p.html
      } else {
        content.text = p.text ?? ''
      }

      return {
        from: p.from ?? '',
        to: p.to,
        subject: p.subject,
        ...content,
        ...(p.replyTo && { replyTo: p.replyTo }),
        ...(p.cc && { cc: p.cc }),
        ...(p.bcc && { bcc: p.bcc }),
        ...(p.tags && { tags: p.tags }),
      }
    })

    const { data, error } = await this.client.batch.send(emails)

    if (error) {
      throw new Error(`Failed to send batch email: ${error.message}`)
    }

    return { ids: data!.data.map((r) => r.id) }
  }
}
