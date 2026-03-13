/**
 * Email utilities — usa el adapter system para escalabilidad.
 *
 * Para cambiar de Resend a otro proveedor (SendGrid, AWS SES, etc.),
 * solo se modifica lib/providers.ts sin tocar este archivo.
 */
import type { ReactElement } from 'react'
import { getEmailService } from '@/lib/providers'
import type { EmailLocale } from '@/emails/i18n'

const FROM =
  process.env.EMAIL_FROM ?? 'Starter App <no-reply@your-domain.com>'

interface SendEmailParams {
  to: string
  subject: string
  text?: string
  react?: ReactElement
  locale?: EmailLocale
}

/**
 * Envia un email usando el servicio de email configurado.
 * Relanza el error para que el caller pueda manejarlo.
 */
export async function sendEmail({
  to,
  subject,
  text,
  react,
}: SendEmailParams): Promise<void> {
  const emailService = getEmailService()

  await emailService.send({
    from: FROM,
    to,
    subject,
    ...(react ? { react } : { text: text ?? '' }),
  })
}

// Re-export EmailLocale para conveniencia
export type { EmailLocale }
