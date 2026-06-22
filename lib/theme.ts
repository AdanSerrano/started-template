/**
 * Theme — Fuente unica de verdad para colores de toda la app.
 *
 * Este archivo centraliza la paleta de colores usada en:
 * - CSS variables (globals.css) — copiar valores HSL al cambiar tema
 * - Email templates (emails/styles-base.ts) — importa directamente de aqui
 * - Viewport themeColor (app/layout.tsx) — importa directamente de aqui
 *
 * COMO CAMBIAR EL TEMA:
 * 1. Modifica los colores en este archivo
 * 2. Actualiza los valores HSL correspondientes en globals.css
 * 3. Los emails y viewport se actualizan automaticamente
 */

// ─── Helpers ──────────────────────────────────────────────

/** Convierte HSL string a HEX para contextos que no soportan HSL (emails, viewport) */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/** Crea un color con ambos formatos */
function color(h: number, s: number, l: number) {
  return {
    hsl: `hsl(${h} ${s}% ${l}%)`,
    hex: hslToHex(h, s, l),
    h,
    s,
    l,
  } as const
}

export type ThemeColor = ReturnType<typeof color>

// ─── Paleta Base ──────────────────────────────────────────
// Cambiar estos valores para modificar el tema completo.
// Los nombres son semanticos — el "primary" puede ser cualquier color.

export const palette = {
  // ── Primary ──
  primary: color(221, 83, 53), // Blue #3B82F6
  primaryDark: color(221, 83, 43), // Darker blue for hover/email
  primaryLight: color(213, 94, 68), // Lighter blue (dark mode / accents)

  // ── Neutral Warm (base tones) ──
  background: color(50, 20, 97), // #FAFAF7
  foreground: color(0, 0, 10), // #1A1A1A
  card: color(0, 0, 100), // #FFFFFF
  surface: color(43, 11, 94), // #F0EFEB
  surfaceHover: color(43, 10, 90), // #E8E7E3
  border: color(36, 10, 86), // #E0DDD8
  muted: color(0, 0, 42), // #6B6B6B

  // ── Secondary ──
  secondary: color(43, 11, 94), // #F0EFEB
  accent: color(43, 11, 94), // #F0EFEB

  // ── Semantic ──
  destructive: color(0, 72, 51), // #DC2626
  success: color(150, 45, 33), // #2D7A4F
  successLight: color(152, 76, 96), // #ECFDF5
  warning: color(38, 92, 44), // #D97706
  warningLight: color(48, 100, 96), // #FFFBEB
  info: color(217, 91, 53), // #2563EB
  infoLight: color(214, 100, 97), // #EFF6FF

  // ── Header ──
  header: color(0, 0, 100), // #FFFFFF
  headerBorder: color(36, 10, 86), // #E0DDD8

  // ── Footer ──
  footer: color(0, 0, 10), // #1A1A1A
  footerForeground: color(0, 0, 75), // #BFBFBF
  footerMuted: color(0, 0, 55), // #8C8C8C

  // ── Badges ──
  badgeSale: color(0, 61, 48), // #C53030
  badgeNew: color(150, 45, 33), // #2D7A4F

  // ── Skeleton ──
  skeleton: color(43, 10, 90), // #E8E7E3

  // ── Charts ──
  chart1: color(221, 83, 53), // blue
  chart2: color(150, 45, 33), // verde
  chart3: color(38, 92, 44), // ámbar
  chart4: color(217, 91, 53), // azul
  chart5: color(0, 61, 48), // rojo
} as const

// ─── Dark Mode Overrides ──────────────────────────────────
// Solo los colores que cambian en dark mode.

export const paletteDark = {
  background: color(60, 4, 7), // #111110
  foreground: color(27, 18, 94), // #F5F0EB
  card: color(60, 4, 10), // #1C1C1A
  surface: color(60, 3, 15), // #262624
  surfaceHover: color(60, 3, 19), // #333330
  border: color(60, 3, 19), // #333330

  primary: color(213, 94, 68), // #60A5FA
  primaryLight: color(213, 94, 68), // same

  secondary: color(60, 3, 15), // #262624
  accent: color(60, 3, 15), // #262624
  muted: color(20, 6, 59), // #9A9590

  destructive: color(0, 72, 51), // same

  success: color(160, 51, 69), // #34D399
  successLight: color(158, 50, 12), // #0D2E1F
  warning: color(45, 93, 56), // #FBBF24
  warningLight: color(50, 70, 9), // #2A2005
  info: color(213, 94, 68), // #60A5FA
  infoLight: color(215, 60, 12), // #0E1A2E

  header: color(60, 4, 8), // #161614
  headerBorder: color(60, 3, 16), // #2A2A28

  footer: color(60, 6, 4), // #0A0A09
  footerForeground: color(60, 2, 55), // #8E8E8B
  footerMuted: color(60, 2, 45), // #747471

  skeleton: color(60, 3, 15), // #262624

  badgeSale: color(0, 86, 60), // #EF4444
  badgeNew: color(160, 51, 69), // #34D399

  chart1: color(213, 94, 68),
  chart2: color(160, 51, 69),
  chart3: color(45, 93, 56),
  chart4: color(213, 94, 68),
  chart5: color(0, 86, 60),
} as const

// ─── Brand Scale ──────────────────────────────────────────
// Escala completa del color principal para uso en Tailwind (brand-50..brand-950)

export const brandScale = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
} as const

// ─── Viewport Theme Colors ───────────────────────────────
// Usados en app/layout.tsx para la barra del navegador

export const viewportTheme = {
  light: palette.background.hex,
  dark: paletteDark.background.hex,
} as const

// ─── Email Brand Tokens ──────────────────────────────────
// Generados desde la paleta para uso en emails (solo light mode)

export const emailBrand = {
  primary: palette.primary.hex,
  primaryDark: palette.primaryDark.hex,
  primaryLight: palette.primaryLight.hex,
  accent: palette.primaryLight.hex,
  dark: palette.foreground.hex,
  text: palette.foreground.hex,
  textSecondary: '#4a5568', // email-specific: gray-600 legible
  textMuted: '#8898aa', // email-specific: gray-400 legible
  border: palette.border.hex,
  borderLight: '#edf2f7', // email-specific: muy sutil
  background: '#f7fafc', // email-specific: fondo gris muy claro
  white: '#ffffff',
  warningBg: palette.warningLight.hex,
  warningBorder: '#fcd34d', // amber-300
  warningText: '#92400e', // amber-800
} as const

// ─── Radius ──────────────────────────────────────────────

export const radius = {
  base: '0.625rem', // 10px — usado como --radius en globals.css
} as const
