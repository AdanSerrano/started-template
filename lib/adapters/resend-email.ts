import { Resend } from 'resend'
import type { ReactElement } from 'react'
import type {
  IEmailService,
  SendEmailParams,
  SendEmailResult,
} from '@/lib/interfaces'

const DEFAULT_FROM =
  process.env.EMAIL_FROM ?? 'Starter App <noreply@your-domain.com>'

/**
 * Implementacion de IEmailService usando Resend.
 * Para cambiar a SendGrid, AWS SES, etc., crear nuevo adapter.
 */
export class ResendEmailService implements IEmailService {
  private client: Resend

  constructor() {
    this.client = new Resend(process.env.RESEND_API_KEY!)
  }

  async send(params: SendEmailParams): Promise<SendEmailResult> {
    // Resend requires at least one of: html, react, or text
    if (!params.html && !params.react && !params.text) {
      throw new Error('Email must have either text, html, or react content')
    }

    // Build base options
    const baseOptions = {
      from: params.from ?? DEFAULT_FROM,
      to: params.to,
      subject: params.subject,
      ...(params.replyTo && { replyTo: params.replyTo }),
      ...(params.cc && { cc: params.cc }),
      ...(params.bcc && { bcc: params.bcc }),
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

    const { data, error } = await this.client.emails.send(options)

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return { id: data!.id }
  }

  async sendBatch(params: SendEmailParams[]): Promise<{ ids: string[] }> {
    const results = await Promise.all(params.map((p) => this.send(p)))
    return { ids: results.map((r) => r.id) }
  }
}
