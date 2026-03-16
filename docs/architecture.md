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
│   ├── interfaces/               # Contratos TypeScript (ports)
│   ├── adapters/                 # Implementaciones concretas (adapters)
│   ├── providers.ts              # Factory (Singleton) — todos los providers
│   ├── create-provider.ts        # Helper generico para crear providers
│   ├── db.ts                     # Cliente Drizzle + pool
│   ├── db-types.ts               # DbClient, DbTransaction, DbOrTx
│   ├── env.ts                    # Validacion de variables de entorno
│   ├── rate-limit.ts             # Rate limiter in-memory (sliding window)
│   ├── auth.ts                   # Better Auth server config
│   ├── auth-client.ts            # Better Auth client
│   ├── auth-server.ts            # Helpers Server Components
│   ├── audit.ts                  # Audit log (framework-agnostic)
│   ├── audit-helpers.ts          # getRequestMetadata() — Next.js specific
│   ├── safe-action.ts            # createSafeAction() — wrapper actions
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

| Interface                 | Adapter actual              | Alternativas futuras                         |
| ------------------------- | --------------------------- | -------------------------------------------- |
| `IAuthProvider`           | `BetterAuthProvider`        | AuthJSProvider, ClerkProvider, LuciaProvider |
| `IEmailService`           | `ResendEmailService`        | SendGridEmailService, SESEmailService        |
| `IStorageService`         | `R2StorageService`          | S3StorageService, GCSStorageService          |
| `IHttpClient`             | `FetchHttpClient` (default) | AxiosHttpClient (via `createHttpClient`)     |
| `ILogger`                 | `ConsoleLogger`             | PinoLogger, WinstonLogger                    |
| `IExcelExportService`     | `XLSXExportService`         | ExcelJSExportService                         |
| `IExcelImportService`     | `XLSXImportService`         | --                                           |
| `ICSVImportService`       | `PapaParseCSVImportService` | --                                           |
| `IPDFExportService`       | `ReactPDFExportService`     | PuppeteerPDF                                 |
| `IJobsService`            | `TriggerJobsService`        | BullMQJobsService                            |
| `IAnalyticsService`       | `GA4AnalyticsService`       | PostHog, Mixpanel                            |
| `IErrorMonitoringService` | `ConsoleMonitoringAdapter`  | SentryMonitoringAdapter                      |
| `IRateLimitService`       | `InMemoryRateLimitService`  | RedisRateLimitService                        |
| `ICache`                  | `MemoryCacheService`        | RedisCacheService                            |

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

| Componente         | Schema.org Type | Usado en     |
| ------------------ | --------------- | ------------ |
| `BreadcrumbJsonLd` | BreadcrumbList  | Paginas      |
| `JsonLdScripts`    | Organization    | Landing page |

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

## Transacciones en Repositories

> Los repositories aceptan un parametro opcional `tx?: DbOrTx` en sus metodos de mutacion.

```typescript
import { db, type DbOrTx } from '@/lib/db'

export interface IAddressRepository {
  create(data: AddressInsert, tx?: DbOrTx): Promise<Address>
  update(
    id: string,
    userId: string,
    data: Partial<AddressInsert>,
    tx?: DbOrTx,
  ): Promise<Address | null>
}

// Uso sin transaccion (comportamiento normal)
await addressRepository.create(data)

// Uso con transaccion (operaciones atomicas)
await db.transaction(async (tx) => {
  await addressRepository.create(addressData, tx)
  await profileRepository.update(userId, profileData, tx)
})
```

**Reglas:**

- Prepared statements NO pueden usar `tx` — se ejecutan siempre con `db`
- Solo metodos de escritura (`create`, `update`, `remove`) aceptan `tx`
- El service decide cuando usar transaccion, el repository la acepta

---

## Server Actions — `createSafeAction`

> Wrapper estandar para actions con auth, validacion Zod y error handling.

```typescript
import { createSafeAction } from '@/lib/safe-action'
import { createAuditLog } from '@/lib/audit'
import { mySchema } from './validations'

export const myAction = createSafeAction(
  { schema: mySchema, auth: true },
  async ({ data, session, metadata }) => {
    const result = await myService.doSomething(data)

    await createAuditLog({
      action: 'entity.created',
      entityType: 'entity',
      entityId: result.id,
      userId: session.user.id,
      metadata, // IP y User-Agent ya extraidos
    })

    return result
  },
)
```

**Que hace automaticamente:**

1. Verifica autenticacion (`requireAuth()`) si `auth: true`
2. Valida input con Zod si se proporciona `schema`
3. Extrae metadata del request (IP, User-Agent)
4. Captura errores y los formatea como `ActionResult`
5. Re-lanza errores internos de Next.js (`redirect`, `notFound`)

**Tipo de retorno:** `ActionResult<T>` con `success`, `data?`, `error?`, `fieldErrors?`.

---

## Logging Estructurado

> Interface `ILogger` con JSON estructurado y child loggers.

```typescript
import { getLogger } from '@/lib/providers'

const logger = getLogger()

// Logs basicos
logger.info('Usuario creado', { userId: 'u1', email: 'test@test.com' })
logger.error('Fallo al enviar email', error, { to: 'user@test.com' })

// Child logger con contexto persistente
const reqLogger = logger.child({ requestId: 'req-123', module: 'auth' })
reqLogger.info('Login exitoso') // incluye requestId y module automaticamente
```

**Adapter actual:** `ConsoleLogger` — JSON a stdout. Para produccion, crear `PinoLogger`.

---

## Health Check — `/api/health`

Endpoint para load balancers, uptime monitoring y deployment probes.

```
GET /api/health

// Respuesta 200:
{
  "status": "healthy",
  "checks": { "database": true },
  "timestamp": "2026-03-16T...",
  "uptime": 12345.67
}

// Respuesta 503 (degraded):
{
  "status": "degraded",
  "checks": { "database": false },
  ...
}
```

No requiere autenticacion. El proxy de Next.js ya permite todas las rutas `/api`.

---

## Instrumentacion — `instrumentation.ts`

Hook de Next.js 16 que se ejecuta una vez al iniciar el servidor.

```typescript
// instrumentation.ts (raiz del proyecto)
export async function register() {
  // Inicializar OpenTelemetry, Sentry, etc.
}

export async function onRequestError(error, request, context) {
  // Captura errores no manejados en routes, server components, etc.
}
```

Para activar OpenTelemetry, instalar `@opentelemetry/sdk-node` y descomentar el setup en `register()`.

---

## Como Swappear un Servicio

Para cambiar cualquier servicio externo (email, auth, storage, etc.):

1. **Crear adapter** en `lib/adapters/nuevo-adapter.ts` que implemente la interface
2. **Exportar** en `lib/adapters/index.ts`
3. **Cambiar UNA linea** en `lib/providers.ts`:

```typescript
// Antes
const email = createProvider<IEmailService>(() => new ResendEmailService())

// Despues
const email = createProvider<IEmailService>(() => new SendGridEmailService())
```

4. El resto del sistema no cambia — services, actions y components siguen usando `getEmailService()`

---

_Starter App (c) 2026_
