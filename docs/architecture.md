# Arquitectura — Starter App

> Estructura de carpetas, capas, modulos, adapters y flujos de datos.

---

## Estructura del Proyecto

> **IMPORTANTE:** Este proyecto NO usa directorio `src/`. Todo esta en la raiz.

```
starter-app/
├── app/                          # ROUTING ONLY — paginas thin
│   └── [locale]/                 # i18n routing (es/en/ca)
│       ├── (auth)/               # Login, registro, forgot/reset password
│       ├── account/              # Perfil, direcciones
│       ├── contacto/             # Formulario de contacto
│       ├── dashboard/            # Panel admin (protegido)
│       ├── legal/                # Terminos, privacidad, cookies
│       ├── layout.tsx            # Root layout con providers
│       └── page.tsx              # Landing page
│
├── modules/                      # DOMAIN — modulos con arquitectura limpia
│   ├── account/                  # Perfil usuario, direcciones
│   └── auth/                     # Login, registro, OAuth, roles, permisos
│
├── components/                   # DESIGN SYSTEM
│   ├── ui/                       # shadcn/ui
│   ├── seo/                      # JSON-LD (Breadcrumb, Organization)
│   ├── landing/                  # Landing page sections
│   └── [shared-components].tsx   # Componentes compartidos
│
├── lib/                          # INFRAESTRUCTURA
│   ├── interfaces/               # Contratos TypeScript
│   ├── adapters/                 # Implementaciones concretas
│   ├── providers.ts              # Factory (Singleton) — providers
│   ├── db.ts                     # Cliente Drizzle
│   ├── env.ts                    # Validacion de variables de entorno
│   ├── rate-limit.ts             # Rate limiter in-memory (sliding window)
│   ├── auth.ts                   # Better Auth server config
│   ├── auth-client.ts            # Better Auth client
│   ├── auth-server.ts            # Helpers Server Components
│   ├── audit.ts                  # Audit log helper
│   ├── errors.ts                 # Custom error classes
│   └── ...
│
├── db/schema/                    # Drizzle schemas
│   ├── relations/                # Relaciones
│   └── ...
├── messages/                     # Traducciones JSON (es/en/ca)
├── i18n/                         # next-intl config (routing, request, navigation)
├── emails/                       # React Email templates
└── .github/workflows/ci.yml     # CI: type-check + lint + build
```

---

## Arquitectura de Modulos

> **REGLA:** TODOS los modulos siguen EXACTAMENTE la misma estructura interna.

### Estructura de cada modulo

```
modules/[nombre-modulo]/
├── actions/                    # Server Actions — uno por accion
├── services/                   # Logica de negocio PURA
├── repositories/               # Acceso a datos — SOLO Drizzle
├── components/                 # UI especifica del modulo
├── store/                      # Zustand store (si necesario)
├── config/                     # Tabla/dialog config (admin)
├── validations.ts              # Schemas Zod
├── types.ts                    # Tipos TypeScript
└── index.ts                    # API publica
```

### Reglas de dependencia

```
app/pages → modules/actions + modules/components
              ↓
         modules/services
              ↓
         modules/repositories
              ↓
         lib/providers.ts (Factory)
              ↓
         lib/adapters/ (Implementaciones)
              ↓
         lib/interfaces/ (Contratos)
              ↓
         Servicios externos
```

**NUNCA:** repository importa service, service importa action, modulo importa de capas internas de otro modulo.

---

## Matriz de Responsabilidades

| Capa           | Que hace                                     | Que NO hace                |
| -------------- | -------------------------------------------- | -------------------------- |
| **Page**       | Compone componentes, define metadata         | NO logica, NO queries      |
| **Action**     | Valida Zod, autentica, orquesta, revalidate  | NO logica de negocio       |
| **Service**    | TODA la logica de negocio                    | NO conoce Next.js          |
| **Repository** | Queries Drizzle, CRUD puro                   | NO logica de negocio       |
| **Component**  | Renderiza UI, maneja interacciones           | NO importa db directamente |
| **Interface**  | Define contratos                             | NO implementa logica       |
| **Adapter**    | Implementa interfaces con librerias externas | NO logica de negocio       |
| **Provider**   | Factory que instancia adapters (Singleton)   | NO implementa logica       |

---

## Sistema de Adapters

> **PRINCIPIO:** Nunca importar librerias externas directamente fuera de `lib/adapters/`.

### Interfaces disponibles

| Interface                 | Adapter actual              | Alternativas futuras |
| ------------------------- | --------------------------- | -------------------- |
| `IHttpClient`             | `AxiosHttpClient`           | FetchHttpClient      |
| `IEmailService`           | `ResendEmailService`        | SendGridEmailService |
| `IStorageService`         | `R2StorageService`          | S3StorageService     |
| `IExcelExportService`     | `XLSXExportService`         | ExcelJSExportService |
| `IExcelImportService`     | `XLSXImportService`         | --                   |
| `ICSVImportService`       | `PapaParseCSVImportService` | --                   |
| `IPDFExportService`       | `ReactPDFExportService`     | PuppeteerPDF         |
| `IJobsService`            | `TriggerJobsService`        | BullMQJobsService    |
| `IAnalyticsService`       | `GA4AnalyticsService`       | PostHog, Mixpanel    |
| `IErrorMonitoringService` | `SentryMonitoringAdapter`   | Real Sentry SDK      |
| `IRateLimitResult`        | In-memory sliding window    | Redis-based          |

### Uso correcto

```typescript
// CORRECTO — Usar providers
import { getEmailService } from '@/lib/providers'

async function sendNotification(email: string, subject: string) {
  const emailService = getEmailService()
  await emailService.send({ to: email, subject, ... })
}

// PROHIBIDO — Importar libreria externa directamente
import { Resend } from 'resend'  // NUNCA fuera de lib/adapters/
import axios from 'axios'        // NUNCA fuera de lib/adapters/
```

---

## SEO — Datos Estructurados

Componentes en `components/seo/`:

| Componente         | Schema.org Type | Usado en      |
| ------------------ | --------------- | ------------- |
| `BreadcrumbJsonLd` | BreadcrumbList  | Paginas       |
| `JsonLdScripts`    | Organization    | Landing page  |

Cada pagina publica incluye: canonical URL, hreflang alternates (es/en/ca), OG images.

---

## Loading Skeletons

Todas las paginas tienen `loading.tsx` con `<Skeleton>` de shadcn/ui:

| Ruta         | Skeleton                      |
| ------------ | ----------------------------- |
| `/`          | Header + hero section         |
| `/account`   | Header + card perfil con form |
| `/dashboard` | Stats cards + contenido       |

**Patron:** Siempre usar `<Skeleton>` de `@/components/ui/skeleton`, nunca divs manuales con `animate-pulse`.

---

## Mapa de Modulos

| #   | Modulo    | Responsabilidad                                      |
| --- | --------- | ---------------------------------------------------- |
| 1   | `auth`    | Login, registro, OAuth, magic links, sesiones, roles |
| 2   | `account` | Perfil, direcciones del usuario                      |

---

_Starter App (c) 2026_
