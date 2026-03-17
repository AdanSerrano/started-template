import { BRAND } from './styles-base'

export const buttonSection: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '28px 0',
}

export const buttonTd: React.CSSProperties = {
  backgroundColor: BRAND.primary,
  borderRadius: '8px',
  textAlign: 'center' as const,
}

export const buttonLink: React.CSSProperties = {
  backgroundColor: BRAND.primary,
  borderRadius: '8px',
  color: BRAND.white,
  display: 'inline-block',
  fontSize: '15px',
  fontWeight: 700,
  lineHeight: '100%',
  padding: '16px 36px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  letterSpacing: '0.02em',
}

export const iconBadgeCell: React.CSSProperties = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  textAlign: 'center' as const,
  verticalAlign: 'middle',
}

export const iconBadgeEmoji: React.CSSProperties = {
  fontSize: '28px',
  lineHeight: '64px',
  margin: 0,
}

export const infoBoxStyle: React.CSSProperties = {
  backgroundColor: '#f0fdfa',
  border: `1px solid ${BRAND.accent}33`,
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '24px 0',
}

export const infoBoxText: React.CSSProperties = {
  color: BRAND.primaryDark,
  fontSize: '13px',
  lineHeight: '20px',
  margin: 0,
}

export const warningBoxStyle: React.CSSProperties = {
  backgroundColor: BRAND.warningBg,
  border: `1px solid ${BRAND.warningBorder}`,
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '24px 0',
}

export const warningBoxText: React.CSSProperties = {
  color: BRAND.warningText,
  fontSize: '13px',
  lineHeight: '20px',
  margin: 0,
}

export const featureIconCell: React.CSSProperties = {
  width: '36px',
  verticalAlign: 'top',
  paddingTop: '2px',
}

export const featureIcon: React.CSSProperties = {
  fontSize: '18px',
  margin: 0,
  lineHeight: '24px',
}

export const featureTextCell: React.CSSProperties = {
  verticalAlign: 'top',
}

export const featureText: React.CSSProperties = {
  color: BRAND.textSecondary,
  fontSize: '14px',
  lineHeight: '22px',
  margin: 0,
}

export const footerSectionStyle: React.CSSProperties = {
  padding: '0 40px 36px',
}

export const footerDivider: React.CSSProperties = {
  borderColor: BRAND.borderLight,
  margin: '0 0 24px',
}

export const footerTagline: React.CSSProperties = {
  color: BRAND.primary,
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.04em',
  textAlign: 'center' as const,
  textTransform: 'uppercase' as const,
  margin: '0 0 16px',
}

export const footerLinksRow: React.CSSProperties = {
  margin: '0 0 16px',
}

export const footerLinkStyle: React.CSSProperties = {
  color: BRAND.textMuted,
  fontSize: '12px',
  textDecoration: 'none',
}

export const footerLinkDot: React.CSSProperties = {
  color: BRAND.border,
  fontSize: '12px',
  margin: 0,
  display: 'inline',
}

export const footerCopyright: React.CSSProperties = {
  color: BRAND.textMuted,
  fontSize: '11px',
  lineHeight: '16px',
  margin: '0 0 2px',
  textAlign: 'center' as const,
}

export const footerAddress: React.CSSProperties = {
  color: BRAND.textMuted,
  fontSize: '11px',
  lineHeight: '16px',
  margin: 0,
  textAlign: 'center' as const,
}
