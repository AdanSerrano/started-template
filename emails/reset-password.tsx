import { Heading, Hr, Link, Text } from '@react-email/components'
import { EmailLayout, PrimaryButton, WarningBox, styles } from './components'
import {
  getEmailTranslations,
  interpolate,
  parseSimpleHtml,
  type EmailLocale,
} from './i18n'

interface ResetPasswordEmailProps {
  name: string
  url: string
  locale?: EmailLocale
}

export function ResetPasswordEmail({
  name,
  url,
  locale = 'es',
}: ResetPasswordEmailProps) {
  const t = getEmailTranslations(locale)
  const m = t.resetPassword

  return (
    <EmailLayout preview={m.preview} locale={locale}>
      <Heading style={styles.heading}>{m.heading}</Heading>
      <Text style={styles.subheading}>{m.subheading}</Text>

      <Text style={styles.greeting}>{interpolate(m.greeting, { name })}</Text>

      <Text style={styles.paragraph}>{parseSimpleHtml(m.paragraph)}</Text>

      <PrimaryButton href={url}>{m.button}</PrimaryButton>

      <WarningBox>{parseSimpleHtml(m.warningBox)}</WarningBox>

      <Hr style={styles.divider} />

      <Text style={styles.label}>{m.securityTips}</Text>

      <Text style={styles.paragraph}>
        &#8226;&nbsp;&nbsp;{m.tipStrong}
        <br />
        &#8226;&nbsp;&nbsp;{m.tipUnique}
        <br />
        &#8226;&nbsp;&nbsp;{m.tipTwoFactor}
      </Text>

      <Hr style={styles.divider} />

      <Text style={styles.muted}>{t.common.fallbackLink}</Text>
      <Text style={styles.muted}>
        <Link href={url} style={styles.link}>
          {url}
        </Link>
      </Text>
    </EmailLayout>
  )
}

export default ResetPasswordEmail
