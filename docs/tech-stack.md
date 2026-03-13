# Tech Stack — Starter App

> Stack completo, Tailwind CSS 4 y variables de entorno.

---

## Stack Principal

| Capa            | Tecnologia                   | Funcion                                |
| --------------- | ---------------------------- | -------------------------------------- |
| Framework       | Next.js 16 (App Router)      | UI, SSR, Server Components             |
| UI              | React 19.2                   | Componentes, hooks                     |
| Lenguaje        | TypeScript 5.x (strict)      | Type-safety en todo el stack           |
| Estilos         | Tailwind CSS 4 + shadcn/ui   | Design system utility-first            |
| Base de Datos   | PostgreSQL (Neon serverless)  | Datos relacionales                     |
| ORM             | Drizzle ORM                  | Queries type-safe, migraciones SQL     |
| HTTP Client     | Axios (via adapter)          | Requests HTTP a APIs externas          |
| Auth            | Better Auth                  | Magic links, OAuth, 2FA, roles         |
| Email           | Resend + React Email         | Transaccional + invitaciones           |
| Storage         | Cloudflare R2                | Archivos, imagenes ($0 egress)         |
| Background Jobs | Trigger.dev                  | Emails, tareas asincronas, crons       |
| Validacion      | Zod 4                        | Schemas, forms, API, webhooks          |
| Estado Cliente  | Zustand 5                    | UI state compartido                    |
| Forms           | react-hook-form              | Forms performantes con Zod             |
| Tablas          | @tanstack/react-table        | Sorting, filtering, paginacion         |
| Graficas        | recharts                     | Visualizaciones del dashboard          |
| Animaciones     | motion                       | Transiciones, modales                  |
| Toasts          | sonner                       | Notificaciones toast                   |
| Command         | cmdk                         | Paleta de comandos                     |
| URL State       | nuqs                         | Query params type-safe                 |
| Temas           | next-themes                  | Dark/light mode                        |
| i18n            | next-intl                    | Internacionalizacion ES/EN/CA          |
| Excel           | xlsx (SheetJS)               | Importar/exportar Excel                |
| CSV             | papaparse                    | Parsear CSV                            |
| PDF             | @react-pdf/renderer          | Reportes PDF                           |
| Iconos          | lucide-react                 | Iconos SVG tree-shakeable              |
| Analytics       | Google Analytics 4           | Tracking (via adapter)                 |
| Rate Limiting   | In-memory sliding window     | Proteccion auth (sin Redis)            |
| CI/CD           | GitHub Actions + bun         | type-check + lint + build              |
| Deploy          | Vercel                       | Hosting, edge                          |

---

## Tailwind CSS 4 — Cambios Criticos

> **IMPORTANTE:** Muchas clases fueron renombradas. NUNCA usar sintaxis v3.

### Utilidades renombradas (v3 -> v4)

| v3 (PROHIBIDO)   | v4 (USAR)                | Nota                         |
| ---------------- | ------------------------ | ---------------------------- |
| `shadow-sm`      | `shadow-xs`              | Escala bajo un nivel         |
| `shadow`         | `shadow-sm`              |                              |
| `rounded-sm`     | `rounded-xs`             | Escala bajo un nivel         |
| `rounded`        | `rounded-sm`             |                              |
| `blur-sm`        | `blur-xs`                | Escala bajo un nivel         |
| `blur`           | `blur-sm`                |                              |
| `outline-none`   | `outline-hidden`         | `outline-none` = style: none |
| `ring`           | `ring-3`                 | Default: 1px, usar ring-3    |
| `flex-grow`      | `grow`                   | Eliminado en v4              |
| `flex-shrink`    | `shrink`                 | Eliminado en v4              |
| `text-opacity-*` | `text-{color}/{opacity}` | Ej: `text-red-500/50`        |
| `bg-opacity-*`   | `bg-{color}/{opacity}`   | Ej: `bg-blue-500/25`         |

### Cambios de comportamiento

| Cambio          | v3                 | v4                  | Accion                                 |
| --------------- | ------------------ | ------------------- | -------------------------------------- |
| Border color    | `gray-200`         | `currentColor`      | Siempre especificar: `border-gray-200` |
| Ring width      | `3px`              | `1px`               | Usar `ring-3` para mantener ancho      |
| Ring color      | `blue-500/50`      | `currentColor`      | Especificar: `ring-blue-500`           |
| Space utilities | `~ :not([hidden])` | `:not(:last-child)` | Preferir `gap-*` con flex/grid         |

---

## Drizzle ORM — Base de Datos

### Conexion

```typescript
// lib/db.ts
import '@/lib/env' // Validacion de env al iniciar
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from '@/db/schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

### Schema — Un archivo por tabla en `db/schema/`

Relaciones organizadas en `db/schema/relations/`:

- `auth-relations.ts` — users, sessions

---

## Variables de Entorno

### Criticas (siempre requeridas)

```bash
DATABASE_URL=                        # Neon PostgreSQL
BETTER_AUTH_SECRET=                   # openssl rand -base64 32
```

### Recomendadas (warn en dev, error en prod)

```bash
NEXT_PUBLIC_APP_URL=                 # http://localhost:3000
RESEND_API_KEY=
```

### Opcionales

```bash
NEXT_PUBLIC_GA4_ID=                  # Google Analytics 4
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
TRIGGER_API_KEY=
```

---

_Starter App (c) 2026_
