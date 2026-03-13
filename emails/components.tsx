import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'
import type { ReactNode } from 'react'
import { getEmailTranslations, type EmailLocale } from './i18n'
import {
  body,
  accentBar,
  container,
  headerSection,
  logoName,
  contentSection,
  buttonSection,
  buttonTd,
  buttonLink,
  infoBoxStyle,
  infoBoxText,
  warningBoxStyle,
  warningBoxText,
  footerSectionStyle,
  footerDivider,
  footerTagline,
  footerLinksRow,
  footerLinkStyle,
  footerLinkDot,
  footerCopyright,
  footerAddress,
} from './styles'

// Re-export styles for email templates
export { styles } from './styles'

// ——— Shared Layout ———

interface EmailLayoutProps {
  preview: string
  children: ReactNode
  locale?: EmailLocale
}

export function EmailLayout({
  preview,
  children,
  locale = 'es',
}: EmailLayoutProps) {
  const t = getEmailTranslations(locale)
  const websiteUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://your-domain.com'
  return (
    <Html lang={locale} dir="ltr">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <meta name="google" content="notranslate" />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={body} className="notranslate">
        <Section style={accentBar} />

        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logoName}>Starter App</Text>
          </Section>

          <Section style={contentSection}>{children}</Section>

          <Section style={footerSectionStyle}>
            <Hr style={footerDivider} />
            <Text style={footerTagline}>{t.layout.tagline}</Text>
            <Row style={footerLinksRow}>
              <Column align="center">
                <Link href={websiteUrl} style={footerLinkStyle}>
                  {t.layout.website}
                </Link>
                <Text style={footerLinkDot}>&nbsp;&middot;&nbsp;</Text>
                <Link
                  href={`mailto:${t.layout?.supportEmail}`}
                  style={footerLinkStyle}
                >
                  {t.layout.support}
                </Link>
              </Column>
            </Row>
            <Text style={footerCopyright}>
              &copy; {new Date().getFullYear()} Starter App.{' '}
              {t.layout.copyright}
            </Text>
            <Text style={footerAddress}>{t.layout.location}</Text>
          </Section>
        </Container>

        <Section style={{ height: '32px' }} />
      </Body>
    </Html>
  )
}

// ——— Shared Components ———

export function PrimaryButton({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <Section style={buttonSection}>
      <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto' }}>
        <tr>
          <td style={buttonTd}>
            <Link href={href} style={buttonLink}>
              {children}
            </Link>
          </td>
        </tr>
      </table>
    </Section>
  )
}

export function InfoBox({ children }: { children: ReactNode }) {
  return (
    <Section style={infoBoxStyle}>
      <Text style={infoBoxText}>{children}</Text>
    </Section>
  )
}

export function WarningBox({ children }: { children: ReactNode }) {
  return (
    <Section style={warningBoxStyle}>
      <Text style={warningBoxText}>{children}</Text>
    </Section>
  )
}
