// Brand tokens
export const BRAND = {
  primary: '#C44D2B',
  primaryDark: '#A33D22',
  primaryLight: '#D4623F',
  accent: '#E07A5A',
  dark: '#3D1A0E',
  text: '#1a1a1a',
  textSecondary: '#4a5568',
  textMuted: '#8898aa',
  border: '#e2e8f0',
  borderLight: '#edf2f7',
  background: '#f7fafc',
  white: '#ffffff',
  warningBg: '#fffbeb',
  warningBorder: '#fcd34d',
  warningText: '#92400e',
}

// Exported style tokens for email templates
export const styles = {
  heading: {
    color: BRAND.text,
    fontSize: '26px',
    fontWeight: 800,
    lineHeight: '32px',
    margin: '0 0 8px',
    textAlign: 'center' as const,
    letterSpacing: '-0.02em',
  } as React.CSSProperties,

  subheading: {
    color: BRAND.textSecondary,
    fontSize: '15px',
    lineHeight: '22px',
    margin: '0 0 28px',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  greeting: {
    color: BRAND.text,
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '24px',
    margin: '0 0 16px',
  } as React.CSSProperties,

  paragraph: {
    color: BRAND.textSecondary,
    fontSize: '15px',
    lineHeight: '26px',
    margin: '0 0 20px',
  } as React.CSSProperties,

  muted: {
    color: BRAND.textMuted,
    fontSize: '13px',
    lineHeight: '20px',
    margin: '0 0 8px',
  } as React.CSSProperties,

  link: {
    color: BRAND.primary,
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
    wordBreak: 'break-all' as const,
  } as React.CSSProperties,

  divider: {
    borderColor: BRAND.borderLight,
    margin: '28px 0',
  } as React.CSSProperties,

  label: {
    color: BRAND.textMuted,
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    margin: '0 0 4px',
  } as React.CSSProperties,
}

// Internal styles for layout components
export const body: React.CSSProperties = {
  backgroundColor: BRAND.background,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  margin: 0,
  padding: 0,
  WebkitTextSizeAdjust: '100%',
}

export const accentBar: React.CSSProperties = {
  backgroundColor: BRAND.primary,
  height: '4px',
  width: '100%',
}

export const container: React.CSSProperties = {
  backgroundColor: BRAND.white,
  borderRadius: '12px',
  margin: '32px auto',
  maxWidth: '500px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.04)',
}

export const headerSection: React.CSSProperties = {
  padding: '36px 40px 0',
  textAlign: 'center' as const,
}

export const logoName: React.CSSProperties = {
  color: BRAND.primary,
  fontSize: '20px',
  fontWeight: 700,
  margin: 0,
  textAlign: 'center' as const,
  letterSpacing: '-0.01em',
}

export const contentSection: React.CSSProperties = {
  padding: '32px 40px',
}

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
