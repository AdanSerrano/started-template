import { Heading, Hr, Link, Text } from '@react-email/components'
import {
  EmailLayout,
  FeatureRow,
  InfoBox,
  PrimaryButton,
  styles,
} from './components'
import { getEmailTranslations, parseSimpleHtml, type EmailLocale } from './i18n'

interface MagicLinkEmailProps {
  url: string
  locale?: EmailLocale
}

export function MagicLinkEmail({ url, locale = 'es' }: MagicLinkEmailProps) {
  const t = getEmailTranslations(locale)
  const m = t.magicLink

  return (
    <EmailLayout preview={m.preview} locale={locale}>
      <Heading style={styles.heading}>{m.heading}</Heading>
      <Text style={styles.subheading}>{m.subheading}</Text>

      <Text style={styles.paragraph}>{parseSimpleHtml(m.paragraph)}</Text>

      <PrimaryButton href={url}>{m.button}</PrimaryButton>

      <InfoBox>{parseSimpleHtml(m.infoBox)}</InfoBox>

      <Hr style={styles.divider} />

      <Text style={styles.label}>{m.whyMagicLink}</Text>

      <FeatureRow emoji="&#128274;" text={m.featureSecure} />
      <FeatureRow emoji="&#9889;" text={m.featureOneClick} />
      <FeatureRow emoji="&#128737;" text={m.featureTemporary} />

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

export default MagicLinkEmail
