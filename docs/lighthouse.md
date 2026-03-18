# Lighthouse 100/100 — Guia de Optimizacion

> Objetivo: 100/100 en Performance, Accessibility, Best Practices y SEO en Google Lighthouse.

---

## Performance (100/100)

### Core Web Vitals — Targets

| Metrica | Objetivo | Como logramos                                       |
| ------- | -------- | --------------------------------------------------- |
| LCP     | < 2.5s   | ISR, Server Components, font `display: swap`        |
| FID/INP | < 100ms  | React Compiler, sin JS innecesario, useTransition   |
| CLS     | < 0.1    | Skeletons con dimensiones fijas, `scrollbar-gutter` |
| TTFB    | < 800ms  | ISR con revalidate, Neon serverless DB              |
| FCP     | < 1.8s   | Server Components default, CSS inline critico       |

### Implementacion

- **ISR** en paginas publicas (`revalidate = 3600` landing, `86400` info)
- **Server Components** por default — `'use client'` solo cuando necesario
- **Font optimization**: `next/font/google` con `display: 'swap'` y `subsets: ['latin']`
- **Image optimization**: `next/image` con formatos AVIF/WebP, cache 30 dias
- **Package optimization**: `optimizePackageImports` para libs grandes
- **Static asset caching**: `Cache-Control: public, max-age=31536000, immutable`
- **DNS prefetch/preconnect**: Solo cuando GA4_ID esta configurado
- **Skeleton loading**: `<Skeleton>` de shadcn/ui en todos los `loading.tsx`
- **CSS animations**: `prefers-reduced-motion: reduce` respetado
- **Bundle optimization**: `serverExternalPackages` para excluir libs pesadas del bundle

### Prohibido

- `animate-pulse` manual — usar `<Skeleton>` de shadcn/ui
- `useEffect` para fetching — usar Server Components
- Waterfall de queries — usar `Promise.all`
- Fuentes sin `display: swap`
- Imagenes sin dimensiones explicitas

---

## Accessibility (100/100)

### Estructura Semantica

- `<header>` con `<nav aria-label="...">`
- `<main id="main">` como landmark principal
- `<footer role="contentinfo">`
- `<section>` para bloques de contenido
- Headings jerarquicos: `h1` > `h2` > `h3` (sin saltar niveles)

### Skip Link

```tsx
<a href="#main" className="focus:translate-y-0 ...">
  {tCommon('skipToContent')}
</a>
```

- Posicion fija, invisible por default, visible con focus
- Primer elemento focusable del DOM

### Iconos y Elementos Decorativos

```tsx
// Decorativo — ocultar de lectores de pantalla
<Icon className="size-5" aria-hidden="true" />

// Interactivo — label accesible
<Button aria-label={t('label')}>
  <Icon className="size-4" />
</Button>
```

### Color y Contraste

- WCAG 2.1 AA minimo (ratio 4.5:1 texto normal, 3:1 texto grande)
- Colores documentados en `globals.css` con comentarios de ratio
- Dark mode con colores ajustados para contraste

### Teclado y Focus

- `outline-ring/50` global en `globals.css`
- Tab order natural — no usar `tabIndex` positivo
- `focus-visible` para estilos de focus solo con teclado
- Dropdowns con Radix UI (keyboard navigation incluida)

### Zoom

- `maximumScale: 5` — NUNCA deshabilitar zoom
- `userScalable: true` — OBLIGATORIO

### i18n y Accesibilidad

- `<html lang={locale}>` correcto por idioma
- Labels de botones traducidos via i18n
- `hreflang` alternates en metadata

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .hero-stagger-item {
    opacity: 1;
    animation: none;
  }
}
```

### Prohibido

- Deshabilitar zoom (`maximumScale: 1`, `userScalable: false`)
- Iconos interactivos sin `aria-label`
- Imagenes sin `alt` text
- Color como unico indicador (agregar iconos/texto)
- `tabIndex` positivo (rompe orden natural)
- Links sin texto descriptivo

---

## Best Practices (100/100)

### Security Headers

Configurados en `next.config.ts`:

| Header                   | Valor                                      |
| ------------------------ | ------------------------------------------ |
| `X-Content-Type-Options` | `nosniff`                                  |
| `X-Frame-Options`        | `DENY`                                     |
| `Referrer-Policy`        | `strict-origin-when-cross-origin`          |
| `Permissions-Policy`     | `camera=(), microphone=(), geolocation=()` |
| `COOP`                   | `same-origin`                              |
| `HSTS`                   | `max-age=63072000` (solo prod)             |
| `CSP`                    | `default-src 'self'` + reglas              |

### HTTPS

- HSTS con `preload` en produccion
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

### Otros

- `poweredByHeader: false` — no exponer Next.js version
- Links externos con `rel="noopener noreferrer"`
- No APIs deprecadas del navegador
- Console limpia (sin errores/warnings en produccion)
- Manifest correcto (`manifest.webmanifest`)
- favicon.ico + iconos en multiples resoluciones

### Prohibido

- `target="_blank"` sin `rel="noopener noreferrer"`
- Console.log en produccion
- APIs deprecadas del navegador
- Mixed content (HTTP en pagina HTTPS)
- Requests a dominios inseguros

---

## SEO (100/100)

### Metadata Completa

```tsx
// generateMetadata en app/[locale]/layout.tsx
return {
  metadataBase: new URL(BASE_URL),
  title: { default: t('title'), template: t('titleTemplate') },
  description: t('description'),
  applicationName: appConfig.name,
  openGraph: { type: 'website', locale, siteName, title, description, url },
  twitter: { card: 'summary_large_image', title, description },
  robots: { index: true, follow: true },
  icons: { icon: [...], apple: [...] },
  alternates: { canonical: '...', languages: { 'es-ES', 'en-US', 'ca' } },
}
```

### Checklist SEO

- [x] `<title>` unico por pagina (via template `%s | App Name`)
- [x] `<meta name="description">` unico y descriptivo
- [x] `<meta name="viewport">` correcto
- [x] `<html lang>` con locale correcto
- [x] `<link rel="canonical">` por pagina/locale
- [x] `hreflang` alternates para todos los idiomas + `x-default`
- [x] Open Graph tags completos (`og:title`, `og:description`, `og:type`, `og:url`, `og:locale`)
- [x] Twitter card tags (`twitter:card`, `twitter:title`, `twitter:description`)
- [x] `robots.ts` con reglas para bots
- [x] `sitemap.ts` dinamico con todos los locales y alternates
- [x] JSON-LD structured data (Organization)
- [x] `favicon.ico` + iconos PNG en multiples resoluciones
- [x] `apple-touch-icon.png` para iOS
- [x] Headings jerarquicos (`h1` unico, `h2`, `h3`)
- [x] Links con texto descriptivo (no "click aqui")
- [x] Imagenes con `alt` text

### robots.ts

- Permite `/` y `/_next/static/`
- Bloquea: `/api/`, `/account/`, rutas de auth
- Apunta a `sitemap.xml`

### sitemap.ts

- Genera URLs para todas las paginas publicas x todos los locales
- Incluye `lastModified`, `changeFrequency`, `priority`
- Incluye `alternates.languages` con hreflang

### JSON-LD Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "App Name",
  "url": "https://...",
  "logo": "https://.../icon-512.png"
}
```

### Prohibido

- Paginas sin `<title>` o con titulo generico
- `<meta name="robots" content="noindex">` en paginas publicas
- Links rotos (404)
- Contenido duplicado sin canonical
- Imagenes sin `alt`
- Heading levels saltados (h1 → h3)

---

## Herramientas de Verificacion

```bash
# Lighthouse CLI
npx lighthouse https://localhost:3000 --view

# Chrome DevTools
# F12 → Lighthouse tab → Generate report

# Web Vitals extension
# Chrome Web Store: Web Vitals
```

---

## Checklist Pre-Deploy

- [ ] `favicon.ico` presente en `public/`
- [ ] Iconos PNG: 16, 32, 192, 512 + apple-touch-icon
- [ ] `manifest.webmanifest` valido
- [ ] Metadata: title, description, OG, twitter card por pagina
- [ ] `robots.ts` con sitemap URL correcta
- [ ] `sitemap.ts` con todas las paginas publicas
- [ ] JSON-LD structured data en layout
- [ ] Canonical + hreflang en todas las paginas
- [ ] Security headers configurados
- [ ] HTTPS habilitado con HSTS
- [ ] `<html lang>` correcto
- [ ] Skip link funcional
- [ ] Headings jerarquicos sin saltos
- [ ] Iconos decorativos con `aria-hidden="true"`
- [ ] Botones con `aria-label` cuando solo tienen icono
- [ ] Font `display: swap` en todas las fuentes
- [ ] `<Skeleton>` para loading states (no `animate-pulse` manual)
- [ ] `prefers-reduced-motion` respetado
- [ ] Zoom permitido (`maximumScale >= 5`)
- [ ] No console.log en produccion
- [ ] Links externos con `rel="noopener noreferrer"`

---

_Ultima actualizacion: Marzo 2026_
