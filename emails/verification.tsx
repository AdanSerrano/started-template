import { Heading, Hr, Link, Text } from '@react-email/components'
import {
  EmailLayout,
  FeatureRow,
  InfoBox,
  PrimaryButton,
  styles,
} from './components'
import {
  getEmailTranslations,
  interpolate,
  parseSimpleHtml,
  type EmailLocale,
} from './i18n'

interface VerificationEmailProps {
  name: string
  url: string
  locale?: EmailLocale
}

export function VerificationEmail({
  name,
  url,
  locale = 'es',
}: VerificationEmailProps) {
  const t = getEmailTranslations(locale)
  const m = t.verification

  return (
    <EmailLayout preview={m.preview} locale={locale}>
      <Heading style={styles.heading}>{m.heading}</Heading>
      <Text style={styles.subheading}>{m.subheading}</Text>

      <Text style={styles.greeting}>{interpolate(m.greeting, { name })}</Text>

      <Text style={styles.paragraph}>{parseSimpleHtml(m.paragraph)}</Text>

      <PrimaryButton href={url}>{m.button}</PrimaryButton>

      <InfoBox>{parseSimpleHtml(m.infoBox)}</InfoBox>

      <Hr style={styles.divider} />

      <Text style={styles.label}>{m.whatYouCanDo}</Text>

      <FeatureRow emoji="&#127910;" text={m.featureQr} />
      <FeatureRow emoji="&#127912;" text={m.featureEvents} />
      <FeatureRow emoji="&#128230;" text={m.featurePayments} />
      <FeatureRow emoji="&#11088;" text={m.featureWallet} />

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

export default VerificationEmail
