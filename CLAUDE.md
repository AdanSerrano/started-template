# CLAUDE.md — Starter Template

> Plantilla de proyecto full-stack para aplicaciones web modernas.
> **La documentacion completa vive en `docs/`** — CLAUDE.md es el resumen ejecutivo y las reglas de comportamiento.

---

## 1. IDENTIDAD

**Producto:** Starter Template — plantilla base para proyectos web.

**Plataforma:** 100% web. Multi-idioma (ES/EN/CA).

---

## 2. PRINCIPIOS RECTORES

La **UX es prioridad #1**. Toda decision optimiza:

1. **Funcionalidad** — Flujos simples, sin pasos innecesarios
2. **Rapidez** — Carga < 2s, navegacion < 300ms, feedback inmediato
3. **Interfaz** — Mobile-first, accesible (WCAG 2.1 AA), dark/light mode
4. **Responsividad** — Funciona en cualquier dispositivo y orientacion

> Si hay conflicto entre complejidad tecnica y UX, **siempre gana el usuario**.

---

## 3. DOCUMENTACION — `docs/` ES LA FUENTE DE VERDAD

**ANTES de implementar cualquier cosa, LEE la documentacion relevante en `docs/`.**

| Archivo                 | Contenido                                                       | Leer cuando...                                        |
| ----------------------- | --------------------------------------------------------------- | ----------------------------------------------------- |
| `docs/architecture.md`  | Capas, adapters, transacciones, safe actions, health, logging   | Creas modulo, swappeas servicio, o agregas adapter    |
| `docs/database.md`      | Schemas, migraciones, transacciones, prepared statements, seeds | Agregas tabla, creas migracion, o tocas DB            |
| `docs/tech-stack.md`    | Stack completo, Tailwind v4, Drizzle, env vars                  | Configuras algo o agregas dependencia                 |
| `docs/patterns.md`      | 12 patrones de diseno con ejemplos y anti-patrones              | Diseñas logica de negocio o servicios                 |
| `docs/conventions.md`   | Naming, imports, limites, skeletons, errores, Zod, audit logs   | Escribes cualquier codigo nuevo                       |
| `docs/auth.md`          | Better Auth, cookie cache, roles, sesiones, 2FA                 | Tocas auth, sesiones o permisos                       |
| `docs/performance.md`   | ISR, React 19.2, Zustand, prepared statements, instrumentation  | Optimizas rendimiento o agregas monitoring            |
| `docs/i18n.md`          | next-intl (es/en/ca), theming dark/light, emails i18n           | Agregas textos, traducciones o cambias tema           |
| `docs/testing.md`       | Tests OBLIGATORIOS, patrones por capa, factories, MSW           | Escribes CUALQUIER codigo nuevo o modificas existente |
| `docs/deployment.md`    | Deploy a Vercel/Docker/Node, env vars, migraciones, rollback    | Despliegas o configuras entorno                       |
| `docs/monitoring.md`    | Logging estructurado, Sentry, health check, request IDs         | Configuras observabilidad o depuras produccion        |
| `docs/security.md`      | OWASP Top 10, rate limiting, CORS, GDPR, file upload            | Implementas seguridad o revisas vulnerabilidades      |
| `docs/api-routes.md`    | Convencion para API routes, proteccion, validacion, respuestas  | Creas o modificas endpoints en app/api/               |
| `docs/jobs.md`          | Background jobs con Trigger.dev, retry, scheduling, errores     | Implementas tareas asincronas o programadas           |
| `docs/caching.md`       | ICache interface, memoria vs Redis, TTL, naming, invalidacion   | Implementas cache o tocas datos con alta frecuencia   |
| `docs/official-docs.md` | URLs documentacion oficial de TODOS los paquetes del stack      | Usas cualquier paquete — SIEMPRE consultar primero    |

### Regla: Documentar componentes nuevos — OBLIGATORIO

Cada componente, modulo o utilidad nueva DEBE tener documentacion en `docs/`:

1. **Componentes reutilizables** — Crear o actualizar un archivo en `docs/` que documente:
   - Proposito y caso de uso
   - Props/API con tipos TypeScript
   - Ejemplo de uso minimo
   - Variantes si las tiene
2. **Modulos nuevos** — Agregar seccion en `docs/architecture.md` con:
   - Responsabilidad del modulo
   - Estructura de carpetas (actions, services, repositories, components)
   - Dependencias con otros modulos
3. **Adapters nuevos** — Documentar en `docs/architecture.md`:
   - Interface que implementa
   - Configuracion necesaria (env vars)
   - Ejemplo de uso via provider

> Si no esta documentado, no esta terminado.

---

## 4. PROTOCOLO PRE-IMPLEMENTACION — OBLIGATORIO

**ANTES de escribir codigo, analiza el sistema existente.** Esto aplica a CUALQUIER tarea: feature, bugfix, refactor.

### Paso 1: Analizar el contexto existente

```
1. Lee docs/ relevantes para la tarea
2. Revisa db/schema/ — ¿que tablas/relaciones existen que pueda aprovechar?
3. Revisa lib/interfaces/ — ¿hay contratos que debo implementar o reutilizar?
4. Revisa lib/adapters/ — ¿hay servicios existentes que resuelven parte del problema?
5. Revisa components/ — ¿hay componentes que puedo componer en vez de crear nuevos?
6. Revisa modules/ — ¿hay servicios o repositorios que ya hacen algo similar?
```

### Paso 2: Buscar mejores practicas — CONSULTAR `docs/official-docs.md`

```
1. Abre docs/official-docs.md y localiza las URLs de los paquetes que vas a tocar
2. Consulta la documentacion oficial para la VERSION EXACTA del proyecto (ver package.json)
3. Busca patrones recomendados, breaking changes y deprecaciones en esa version
4. Si usas una API poco comun, confirma con la documentacion que es la forma correcta
5. Si agregas un paquete nuevo, agrega su URL a docs/official-docs.md
```

### Paso 3: Planificar antes de codificar

```
1. Identifica que capas necesitas tocar (Page → Action → Service → Repository)
2. Verifica si necesitas nuevo schema, nueva interface o nuevo adapter
3. Reutiliza lo maximo posible — no reinventes lo que ya existe
4. Si es complejo, propone el plan al usuario antes de implementar
```

> La documentacion de paquetes NO siempre muestra las mejores practicas.
> Busca patterns avanzados, edge cases y recomendaciones de la comunidad.

---

## 5. STACK RESUMIDO

| Capa      | Tecnologia                         |
| --------- | ---------------------------------- |
| Framework | Next.js 16, React 19.2, TypeScript |
| Estilos   | Tailwind CSS 4 + shadcn/ui         |
| DB        | PostgreSQL (Neon) + Drizzle ORM    |
| Auth      | Better Auth                        |
| Email     | Resend + React Email               |
| Storage   | Cloudflare R2                      |
| Jobs      | Trigger.dev                        |
| i18n      | next-intl (ES/EN/CA)               |
| CI/CD     | GitHub Actions + bun               |

**Detalles completos:** `docs/tech-stack.md`

---

## 6. ESTRUCTURA

```
starter-template/
├── app/[locale]/           # Routing — paginas thin con loading.tsx + error.tsx
├── app/api/health/         # Health check endpoint (DB connectivity)
├── modules/                # Domain — modulos con arquitectura limpia
│   ├── auth/               # Login, registro, OAuth, magic links, 2FA
│   └── account/            # Perfil, direcciones del usuario
│       ├── actions/
│       │   ├── account-actions.ts   # Profile + address CRUD
│       │   ├── avatar-actions.ts    # Upload avatar (rate limit: 5/5min)
│       │   └── gdpr-actions.ts      # Data export/deletion (rate limit: 3/hora)
│       ├── services/
│       ├── repositories/
│       └── components/
├── components/
│   ├── ui/                 # shadcn/ui (35 componentes)
│   ├── forms/              # 63 campos de formulario reutilizables
│   ├── custom-datatable/   # DataTable avanzado con Zustand, hooks, smart variant
│   └── sidebar/            # Sidebar navegacion (nav-content, header, user-menu)
├── hooks/                  # Custom hooks (use-in-view, use-mobile)
├── lib/
│   ├── interfaces/         # 17 contratos TypeScript (auth, email, storage, logger, etc.)
│   ├── adapters/           # 22+ implementaciones (UNICO lugar con libs externas)
│   ├── providers.ts        # Factory (Singleton) — 20 providers con createProvider<T>
│   ├── safe-action.ts      # createSafeAction() — wrapper estandar para actions
│   ├── errors.ts           # Jerarquia de errores (AppError, NotFoundError, etc.)
│   ├── audit.ts            # Audit log (framework-agnostic)
│   ├── audit-helpers.ts    # getRequestMetadata() — Next.js specific
│   ├── db.ts               # Cliente Drizzle + tipos DbOrTx
│   ├── db-types.ts         # DbClient, DbTransaction, DbOrTx (union para tx opcional)
│   ├── rate-limit.ts       # Rate limiter in-memory (sliding window)
│   ├── api-response.ts     # Helpers estandar para API routes (apiSuccess, apiError)
│   ├── pagination.ts       # Tipos, schemas Zod, y helpers de paginacion
│   ├── sanitize.ts         # DOMPurify centralizado (sanitizeHtml, sanitizeText)
│   ├── query-helpers.ts    # Helpers Drizzle (notDeleted para soft-delete)
│   ├── upload-validation.ts # Validacion de archivos (tamano, MIME, magic bytes)
│   ├── cors.ts             # CORS headers helper para API routes
│   ├── request-context.ts  # AsyncLocalStorage para request ID propagation
│   ├── permissions.ts      # Roles y access control (super_admin, admin, user)
│   ├── i18n-helpers.ts     # Helpers para campos i18n en DB (getTranslatedField, etc.)
│   ├── utils.ts            # cn(), formatCurrency(), formatDate(), slugify()
│   ├── config.ts           # Branding centralizado (appConfig)
│   ├── auth.ts             # Config Better Auth (plugins, session, hooks, rate limits)
│   ├── auth-server.ts      # getServerSession(), requireAuth(), requireRole()
│   ├── auth-client.ts      # authClient — Better Auth client-side (login, register, etc.)
│   ├── email.ts            # sendEmail() — envio abstracto via provider
│   ├── create-provider.ts  # createProvider<T>() — factory generico lazy singleton
│   ├── fonts.ts            # Fuentes Google (Geist Sans + Geist Mono) con next/font
│   ├── i18n-field.ts       # getI18n() — lee campo i18n desde JSON string o objeto
│   └── env.ts              # Validacion de entorno (critical vs recommended vs paired)
├── db/schema/              # 13 schemas Drizzle + relaciones + indexes
├── emails/                 # Templates React Email (sin emojis/iconos decorativos)
├── messages/               # Traducciones (es.json, en.json, ca.json)
├── tests/                  # Vitest setup + tests unitarios/integracion/componentes
│   ├── unit/               # Tests de services, repositories, utils
│   ├── integration/        # Tests de actions (flujo completo)
│   ├── components/         # Tests de componentes React
│   ├── factories/          # Factories de datos (user, session, address)
│   └── mocks/              # MSW handlers + server setup
├── e2e/                    # Playwright E2E tests
├── scripts/                # Generadores (modulos, iconos) + validador de commits
├── proxy.ts                # Middleware Next.js 16 (antes middleware.ts) — i18n, auth, request ID
├── routes.ts               # Configuracion de rutas auth/public/protected
├── instrumentation.ts      # Next.js 16 — OpenTelemetry + error monitoring hook
├── .claude/commands/       # 5 slash commands para workflow de desarrollo
├── .github/workflows/      # CI: format + type-check + lint + test + build + e2e
└── docs/                   # DOCUMENTACION COMPLETA DEL SISTEMA
```

### Middleware — `proxy.ts` (cambio de Next.js 16)

En **Next.js 16**, el middleware se renombro de `middleware.ts` a **`proxy.ts`**. Este es el nombre oficial en Next.js 16 — no es un nombre custom. Si ves documentacion antigua que referencia `middleware.ts`, en este proyecto el equivalente es `proxy.ts`.

Responsabilidades:

1. **Request ID** — Inyecta `x-request-id` en headers para tracing
2. **i18n** — Procesa rutas con `next-intl/middleware` (ES/EN/CA)
3. **Auth guards** — Redirige rutas protegidas a login si no hay session cookie
4. **Auth redirect** — Redirige rutas de auth (login/register) a dashboard si ya autenticado
5. **API bypass** — Rutas `/api/*` no pasan por i18n

```ts
// proxy.ts — Orden de evaluacion:
// 1. API routes → skip i18n, inject request ID
// 2. Public routes → allow always
// 3. Auth routes → redirect to dashboard if authenticated
// 4. Protected routes → redirect to login if no session
```

> **IMPORTANTE:** Al agregar nuevas rutas publicas o protegidas, modificar `routes.ts`, NO `proxy.ts`.

**Estructura de modulos:** `docs/architecture.md`

---

## 7. REGLAS ABSOLUTAS

### Arquitectura — 5 capas

| Capa       | Responsabilidad                 | NO hace               |
| ---------- | ------------------------------- | --------------------- |
| Page       | Compone componentes             | NO logica, NO queries |
| Action     | Valida Zod, autentica, orquesta | NO logica de negocio  |
| Service    | TODA logica de negocio          | NO Next.js APIs       |
| Repository | Queries Drizzle                 | NO logica             |
| Adapter    | Implementa interfaces           | NO logica de negocio  |

**Detalles y ejemplos:** `docs/architecture.md` y `docs/patterns.md`

### Server Actions — `createSafeAction()` OBLIGATORIO

Toda server action DEBE usar `createSafeAction()`. Este wrapper automatiza validacion Zod, autenticacion, metadata de request y error handling estandarizado.

```ts
// CORRECTO — siempre via createSafeAction
import { createSafeAction } from '@/lib/safe-action'

export const updateProfileAction = createSafeAction(
  { schema: updateProfileSchema, auth: true },
  async ({ data, session, metadata }) => {
    const result = await accountService.updateProfile(session.user.id, data)
    await createAuditLog({
      action: 'profile.updated',
      entityType: 'user',
      entityId: session.user.id,
      userId: session.user.id,
      metadata,
    })
    return result
  },
)

// PROHIBIDO — action manual sin wrapper
export async function updateProfile(input: unknown) {
  const session = await requireAuth() // manual
  const data = schema.parse(input) // manual
  // ... sin error handling estandarizado
}
```

`createSafeAction` provee automaticamente:

- **Validacion Zod** — retorna `fieldErrors` si falla
- **Auth** — llama `requireAuth()` (desactivable con `auth: false`)
- **Metadata** — `{ ip, userAgent }` para audit logs
- **Error handling** — captura `AppError`, re-throws Next.js redirects, loggea errores inesperados

### Error Handling — Jerarquia de errores `lib/errors.ts`

SIEMPRE usar las clases de error existentes. `createSafeAction()` las captura automaticamente y retorna el mensaje al cliente.

```ts
import { NotFoundError, ForbiddenError, ConflictError } from '@/lib/errors'

// En services — lanzar errores tipados
throw new NotFoundError('User', userId) // 404
throw new ForbiddenError('Sin permisos') // 403
throw new ConflictError('Email ya registrado') // 409
throw new ValidationError('Datos invalidos', { email: ['Email invalido'] }) // 422
throw new TooManyRequestsError('Intenta mas tarde', retryAfterMs) // 429

// PROHIBIDO — errores genericos
throw new Error('Not found') // createSafeAction no sabe el status code
```

| Clase                     | Status | Cuando usar                            |
| ------------------------- | ------ | -------------------------------------- |
| `AppError`                | 500    | Base — nunca usar directamente         |
| `NotFoundError`           | 404    | Entidad no existe                      |
| `ValidationError`         | 422    | Datos invalidos con fieldErrors        |
| `UnauthorizedError`       | 401    | No autenticado                         |
| `ForbiddenError`          | 403    | Sin permisos                           |
| `ConflictError`           | 409    | Duplicado o conflicto                  |
| `AccountLockedError`      | 423    | Cuenta bloqueada por intentos fallidos |
| `TooManyRequestsError`    | 429    | Rate limit excedido                    |
| `ServiceUnavailableError` | 503    | Servicio externo caido                 |

### Rate Limiting — OBLIGATORIO en actions sensibles

Toda action publica o que maneje datos sensibles DEBE tener rate limit.

```ts
import { checkRateLimit } from '@/lib/rate-limit'
import { TooManyRequestsError } from '@/lib/errors'

// En el service o al inicio del handler
const limit = checkRateLimit(`avatar:${userId}`, {
  maxAttempts: 5,
  windowMs: 5 * 60 * 1000, // 5 minutos
})
if (!limit.success) {
  throw new TooManyRequestsError()
}
```

| Tipo de action         | Rate limit recomendado |
| ---------------------- | ---------------------- |
| Upload (avatar, docs)  | 5 / 5 min              |
| GDPR (export, delete)  | 3 / 1 hora             |
| Auth (login, register) | 10 / 15 min            |
| Mutaciones normales    | 30 / 1 min             |
| APIs publicas          | 60 / 1 min             |

### Soft Delete — `notDeleted()` helper OBLIGATORIO

Tablas con `deletedAt` DEBEN usar `notDeleted()` en todas las queries de lectura.

```ts
import { notDeleted } from '@/lib/query-helpers'

// CORRECTO — helper centralizado
db.select().from(users).where(notDeleted(users.deletedAt))

// PROHIBIDO — condicion manual
db.select().from(users).where(isNull(users.deletedAt))
```

### Rutas — Configuracion en `routes.ts`

Al agregar nuevas rutas, modificar **`routes.ts`**, NUNCA `proxy.ts`.

```ts
// routes.ts — arrays de rutas por tipo
export const publicRoutes = ['/'] // Sin auth requerida
export const authRoutes = ['/login', '/register'] // Solo sin sesion
export const apiAuthPrefix = '/api/auth' // Better Auth catch-all
export const DEFAULT_LOGIN_REDIRECT = '/account' // Redirect post-login
export const DEFAULT_LOGOUT_REDIRECT = '/login' // Redirect post-logout
```

**Para agregar una ruta nueva:**

- **Ruta publica** (landing, about) → agregar a `publicRoutes`
- **Ruta de auth** (login, register) → agregar a `authRoutes`
- **Ruta protegida** → no agregar a ningun array (por defecto son protegidas)

### Adapters — OBLIGATORIO

```ts
// CORRECTO — siempre via provider
import { getEmailService } from '@/lib/providers'
await getEmailService().send({ to, subject, html })

// PROHIBIDO — NUNCA importar libs externas fuera de lib/adapters/
import { Resend } from 'resend'
import axios from 'axios'
```

**Interfaces disponibles:** `docs/architecture.md` > Sistema de Adapters

### Server Components por Default

Solo `'use client'` para: event handlers, React hooks cliente, APIs navegador, Zustand.

**Decision table React 19.2:** `docs/performance.md` > React 19.2

### useEffect — CASI PROHIBIDO

> `useEffect` es el ultimo recurso. Siempre buscar alternativas primero.

| Necesitas...                  | NO uses           | USA                                    |
| ----------------------------- | ----------------- | -------------------------------------- |
| Derivar valor de props/state  | `useEffect`       | Calculo directo o `useMemo`            |
| Datos del servidor            | `useEffect`+fetch | Server Component                       |
| Subscribirse a evento externo | `useEffect`       | `useSyncExternalStore`                 |
| Estado pending de accion      | `useEffect`       | `useTransition`                        |
| Feedback instantaneo          | `useEffect`       | `useOptimistic`                        |
| Animacion al montar           | `useEffect`       | CSS transition o Intersection Observer |
| Timer/interval                | `useEffect`       | Aceptable — unico caso valido comun    |

**Solo usar `useEffect` cuando:** conectas con API del navegador (ResizeObserver, IntersectionObserver), cleanup de recursos externos, o timer/interval que no tiene alternativa.

### Forms — React Hook Form + Zod + useTransition OBLIGATORIO

```tsx
const [isPending, startTransition] = useTransition()
const form = useForm({ resolver: zodResolver(schema), mode: 'onTouched' })

function onSubmit(values: FormInput) {
  startTransition(async () => {
    const result = await serverAction(values)
    if (result.success) toast.success('OK')
    else toast.error(result.error)
  })
}
```

### Loading Skeletons — Skeleton de shadcn/ui OBLIGATORIO

```tsx
import { Skeleton } from '@/components/ui/skeleton'
;<Skeleton className="h-8 w-40" />
// PROHIBIDO: <div className="animate-pulse..." />
```

Cada pagina DEBE tener `loading.tsx` que refleje su layout real.

### Audit Logs — OBLIGATORIO en mutaciones

```ts
import { createAuditLog } from '@/lib/audit'
import { getRequestMetadata } from '@/lib/audit-helpers'

const metadata = await getRequestMetadata() // En actions (Next.js)

await createAuditLog({
  action: 'entity.created',
  entityType: 'entity',
  entityId: entity.id,
  userId: session.user.id,
  metadata, // IP + User-Agent (opcional en background jobs)
})
```

### Branding — Centralizado en `lib/config.ts`

```ts
import { appConfig } from '@/lib/config'

// CORRECTO — siempre via appConfig
appConfig.name     // "Starter App"
appConfig.url      // process.env.NEXT_PUBLIC_APP_URL
appConfig.emailFrom // remitente de emails

// PROHIBIDO — hardcodear nombre de la app
<span>Starter App</span>  // NUNCA
```

Al copiar la plantilla para un nuevo proyecto, solo cambiar `lib/config.ts`.

### ISR — Paginas publicas con revalidate

```tsx
export const revalidate = 3600 // Landing, catalogo
export const revalidate = 86400 // Paginas info, legales
```

### Imports — Path aliases SIEMPRE

```ts
import { db } from '@/lib/db' // CORRECTO
import { db } from '../../lib/db' // PROHIBIDO
```

### Limite de lineas — 250 maximo por archivo

**Excepciones aceptables:**

- `components/ui/` — shadcn/ui se mantiene como viene del CLI
- `messages/*.d.json.ts` — auto-generado por next-intl
- Componentes complejos (datatable, forms avanzados) — dividir en sub-componentes si supera 400 lineas

### Emails — Sin iconos/emojis decorativos

```tsx
// PROHIBIDO: <IconBadge emoji="🛒" />
// CORRECTO: solo texto, tablas y botones CTA
```

### Image Upload — Preview local, upload al guardar

```tsx
const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
const previewUrl = URL.createObjectURL(file) // Solo preview

startTransition(async () => {
  const formData = new FormData()
  formData.append('file', file)
  const result = await uploadImageAction(formData) // Upload al guardar
})
// PROHIBIDO: upload al seleccionar, presigned URLs
```

Key en R2: `public/{modulo}/{entityId}/{uuid}.{ext}`

### Validaciones Zod 4 — Usar `error` en vez de `message`

```ts
// CORRECTO (Zod 4)
z.string().refine((val) => val.length > 0, { error: 'Required' })

// DEPRECADO (Zod 3)
z.string().refine((val) => val.length > 0, { message: 'Required' })
```

### Repositories — Interfaces + tx? OBLIGATORIO

```ts
// Cada repository DEBE tener interface explicita y aceptar tx? en mutaciones
export interface IAddressRepository {
  findByUserId(userId: string): Promise<Address[]>
  create(data: AddressInsert, tx?: DbOrTx): Promise<Address>
}

export const addressRepository: IAddressRepository = { ... }
```

### Transacciones — `db.transaction()` OBLIGATORIO en operaciones multi-paso

Si una operacion toca **mas de una fila o tabla**, DEBE usar `db.transaction()`. Sin transaccion, si el paso 2 falla, el paso 1 ya se ejecuto y la DB queda en estado inconsistente.

```ts
// CORRECTO — atomico en el service
return db.transaction(async (tx) => {
  await addressRepository.setDefault(id, userId, tx)
  return addressRepository.update(id, userId, data, tx)
})

// PROHIBIDO — race condition
await addressRepository.setDefault(id, userId) // si esto pasa...
return addressRepository.update(id, userId, data) // ...y esto falla → inconsistente
```

**Reglas:**

- **Services** orquestan transacciones cuando coordinan multiples repos
- **Repositories** aceptan `tx?: DbOrTx` y reusan transaccion si ya existe (`if (tx) return run(tx)`)
- **Reads** NO necesitan transaccion
- **Detalles completos y tabla de cuando usar:** `docs/database.md`

### Tests Automaticos — OBLIGATORIO en toda implementacion

**Cada service, action, utilidad o componente nuevo DEBE tener tests unitarios.**

| Capa       | Tipo de test | Que testear                                   | Ejemplo ubicacion                         |
| ---------- | ------------ | --------------------------------------------- | ----------------------------------------- |
| Service    | Unit         | Logica de negocio, casos edge, errores        | `tests/unit/mi-service.test.ts`           |
| Action     | Integration  | Validacion Zod, auth, flujo completo          | `tests/integration/mi-action.test.ts`     |
| Repository | Unit         | Queries correctas, parametros, soft-delete    | `tests/unit/mi-repository.test.ts`        |
| Utility    | Unit         | Funciones puras, transformaciones, edge cases | `tests/unit/mi-util.test.ts`              |
| Component  | Component    | Renderizado, interaccion, estados             | `tests/components/mi-componente.test.tsx` |

```bash
# SIEMPRE ejecutar ANTES de commit — el CI verifica todo esto
bun run format:check      # Prettier — formato correcto
bun run lint              # ESLint — sin errores
bun run type-check        # TypeScript — sin errores de tipos
bun run test              # Todos los tests
bun run test:coverage     # Verificar cobertura >= 50%
```

> **Si `format:check` falla**, corregir con `bun run format` y volver a hacer commit.

**Reglas:**

- **NO entregar codigo sin tests** — si no tiene test, no esta terminado
- **Testear comportamiento, no implementacion** — que hace, no como lo hace
- **Mockear solo boundaries** — repositories, adapters, auth; nunca logica interna
- **Factories para datos** — usar `tests/factories/` para datos consistentes
- **Tests deben pasar en CI** — `bun run test` debe ser exitoso antes de commit

**Patrones completos:** `docs/testing.md`

### API Routes — Helpers estandar `lib/api-response.ts`

Las API routes (`app/api/`) DEBEN usar los helpers estandar para respuestas consistentes.

```ts
import {
  apiSuccess,
  apiError,
  apiNotFound,
  apiUnauthorized,
  apiRateLimited,
} from '@/lib/api-response'

export async function GET() {
  const data = await getItems()
  return apiSuccess(data) // { success: true, data: [...] }
}

export async function POST(req: Request) {
  return apiError('Datos invalidos', 422) // { success: false, error: '...' }
  return apiNotFound('User') // { success: false, error: 'User not found', code: 'NOT_FOUND' }
  return apiUnauthorized() // 401
  return apiRateLimited(60) // 429 + Retry-After header
}

// PROHIBIDO — Response manual
return new Response(JSON.stringify({ error: '...' }), { status: 400 })
```

### Special Pages — OBLIGATORIAS por ruta

| Archivo            | Proposito                         | Obligatorio en...  |
| ------------------ | --------------------------------- | ------------------ |
| `loading.tsx`      | Skeleton mientras carga la pagina | CADA pagina        |
| `error.tsx`        | Error boundary del route group    | CADA route group   |
| `not-found.tsx`    | Pagina 404 personalizada          | `app/[locale]/`    |
| `global-error.tsx` | Ultimo recurso si error.tsx falla | `app/` (ya existe) |

```tsx
// error.tsx — SIEMPRE 'use client'
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Algo salio mal</h2>
      <button onClick={reset}>Reintentar</button>
    </div>
  )
}
```

> `global-error.tsx` ya existe en `app/` y NO usa el design system (renderiza HTML inline porque el layout puede estar roto).

### Utilidades — `lib/utils.ts`

Usar las utilidades centralizadas. NO reimplementar.

```ts
import { cn, formatCurrency, formatDate, slugify } from '@/lib/utils'

cn('px-4', isActive && 'bg-primary') // clsx + tailwind-merge
formatCurrency(29.99) // "$29.99" (usa appConfig.currency)
formatDate(new Date()) // "17 mar 2026, 10:30" (usa appConfig.timezone)
slugify('Hola Mundo!') // "hola-mundo"
```

### Paginacion — `lib/pagination.ts`

Usar el sistema de paginacion estandar. NO crear schemas o tipos custom.

```ts
import {
  paginationSchema,
  paginatedSortSchema,
  createPaginatedResult,
  getPaginationOffset,
} from '@/lib/pagination'

// En action — validar params
const params = paginatedSortSchema.parse(searchParams)

// En repository — calcular offset
const offset = getPaginationOffset(params) // (page - 1) * pageSize

// En service — construir resultado
return createPaginatedResult(items, totalCount, params)
// → { items: [...], pagination: { page, pageSize, totalItems, totalPages, hasNext, hasPrev } }
```

Defaults: `page=1`, `pageSize=20`, `maxPageSize=100`, `sortBy=createdAt`, `sortOrder=desc`

### File Upload Validation — `lib/upload-validation.ts`

Toda subida de archivos DEBE validar con `validateFile()`. Verifica tamano, MIME type, extension Y magic bytes (previene MIME spoofing).

```ts
import { validateFile } from '@/lib/upload-validation'

const result = await validateFile(file) // Default: 5MB, imagenes + PDF + CSV + XLSX
const result = await validateFile(file, {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/png'],
  allowedExtensions: ['jpg', 'jpeg', 'png'],
})

if (!result.valid) {
  throw new ValidationError(result.error!)
}

// PROHIBIDO — validar solo por extension o MIME sin magic bytes
if (file.type === 'image/jpeg') { ... }  // Spoofeable
```

### CORS — `lib/cors.ts`

Para API routes que necesiten CORS (integraciones externas):

```ts
import { corsHeaders, handleCorsPreflight } from '@/lib/cors'

export function OPTIONS(request: Request) {
  return handleCorsPreflight(request) // Lee CORS_ALLOWED_ORIGINS de env
}

export function GET(request: Request) {
  const origin = request.headers.get('origin')
  return Response.json(data, { headers: corsHeaders(origin) })
}
```

### Request Context — `lib/request-context.ts`

El request ID se propaga automaticamente via AsyncLocalStorage. Disponible en todo el stack sin pasarlo como parametro.

```ts
import { getRequestId } from '@/lib/request-context'

// En cualquier parte del stack
const requestId = getRequestId() // "a1b2c3d4" (8 chars)
logger.info('Processing', { requestId })
```

> El `proxy.ts` inyecta el request ID automaticamente. NO generar IDs manuales.

### Permisos y Roles — `lib/permissions.ts`

3 roles con access control granular. Definidos con Better Auth `createAccessControl()`.

| Rol           | Acceso                                            |
| ------------- | ------------------------------------------------- |
| `super_admin` | Todo — incluyendo impersonate y delete users      |
| `admin`       | Gestion completa excepto impersonate/delete users |
| `user`        | Solo lectura + crear ordenes                      |

```ts
// En actions — verificar rol
const session = await requireRole(['admin', 'super_admin'])

// Para permisos granulares — usar ac (access control)
import { ac } from '@/lib/permissions'
```

> Al agregar un recurso nuevo, agregar sus acciones en `lib/permissions.ts` y definir permisos por rol.

### Campos i18n en DB — `lib/i18n-helpers.ts`

Para campos multi-idioma almacenados como JSONB en la base de datos:

```ts
import {
  getTranslatedField,
  createI18nField,
  mergeI18nField,
} from '@/lib/i18n-helpers'

// Leer — obtiene el idioma o fallback a 'es'
const name = getTranslatedField(product.name, locale)

// Crear — genera campo i18n
const field = createI18nField('Posters de pelicula', 'es')
// → { es: 'Posters de pelicula' }

// Actualizar — merge parcial
const updated = mergeI18nField(existing, { en: 'Movie Posters' })
```

> Tipo `I18nField`: `{ es: string, en?: string, ca?: string }`

### Env Vars — Validacion categorizada `lib/env.ts`

Las variables de entorno se validan al iniciar la app con 4 niveles:

| Categoria       | Comportamiento             | Variables                               |
| --------------- | -------------------------- | --------------------------------------- |
| **Critical**    | App NO arranca sin ellas   | `DATABASE_URL`, `BETTER_AUTH_SECRET`    |
| **Recommended** | Warn en dev, throw en prod | `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY` |
| **Paired**      | Ambas o ninguna            | Google OAuth, Upstash Redis, R2 Storage |
| **Optional**    | Solo warn en dev           | `SENTRY_DSN`, `CORS_ALLOWED_ORIGINS`    |

```ts
// Importar para acceso tipado
import { env } from '@/lib/env'
env.DATABASE_URL // string (validado)
env.APP_URL // string (con fallback localhost)
```

> Al agregar una env var nueva, clasificarla en `lib/env.ts` segun su categoria.

### Logging — via ILogger provider

```ts
import { getLogger } from '@/lib/providers'

const logger = getLogger()
logger.info('Operacion completada', { userId, action })
logger.error('Fallo al procesar', error, { context })
```

**Convenciones completas:** `docs/conventions.md`

---

## 8. RENDIMIENTO

### Data Fetching — Paralelo OBLIGATORIO

```tsx
const [a, b] = await Promise.all([getA(), getB()])
```

### Zustand — Selectores atomicos

```ts
const count = useStore((s) => s.items.length) // CORRECTO
const { items, total } = useStore() // PROHIBIDO
```

### Prepared Statements — Queries frecuentes

```ts
const prepared = db
  .select()
  .from(users)
  .where(eq(users.id, sql.placeholder('id')))
  .prepare()
const user = await prepared.execute({ id })
```

**Optimizaciones completas:** `docs/performance.md`

---

## 9. AUTH

```ts
const session = await getServerSession() // Server Component (cookie cache 5min)
const session = await requireAuth() // Proteger pagina
const session = await requireRole(['super_admin']) // Solo admins
```

**Config, roles, 2FA, multi-tenancy:** `docs/auth.md`

---

## 10. i18n (ES/EN/CA)

```tsx
const t = await getTranslations('namespace') // Server Component
const t = useTranslations('namespace') // Client Component
import { Link, useRouter } from '@/i18n/navigation' // SIEMPRE
```

**Traducciones, emails i18n, theming:** `docs/i18n.md`

---

## 11. TAILWIND CSS 4 — Cambios criticos

| v3 (PROHIBIDO) | v4 (USAR)        |
| -------------- | ---------------- |
| `shadow-sm`    | `shadow-xs`      |
| `rounded-sm`   | `rounded-xs`     |
| `outline-none` | `outline-hidden` |
| `ring`         | `ring-3`         |
| `flex-grow`    | `grow`           |

**Tabla completa con ejemplos:** `docs/tech-stack.md` > Tailwind CSS 4

---

## 12. MODULOS INCLUIDOS

| Modulo    | Responsabilidad                            |
| --------- | ------------------------------------------ |
| `auth`    | Login, registro, OAuth, magic links, roles |
| `account` | Perfil, direcciones del usuario            |

**Como crear modulos nuevos:** `docs/architecture.md` > Arquitectura de Modulos

### Generador de modulos — `bun run generate:module`

Para crear un modulo nuevo con toda la estructura, usa el generador:

```bash
bun run generate:module
# Interactivo — pregunta nombre del modulo y genera:
# modules/[nombre]/
#   ├── actions/
#   ├── services/
#   ├── repositories/
#   ├── components/
#   ├── types.ts
#   └── validations.ts
```

> **NO crear la estructura manualmente** — el generador garantiza consistencia con la arquitectura del proyecto.

---

## 13. CI/CD Y HOOKS

### Husky + lint-staged — Pre-commit automatico

El proyecto tiene **pre-commit hooks** que se ejecutan automaticamente. No intentar bypasearlos.

**En cada commit, Husky ejecuta lint-staged que:**

1. `prettier --write` en archivos staged (`.ts`, `.tsx`, `.json`, `.md`, `.css`)
2. `eslint --fix --cache` en archivos staged (`.ts`, `.tsx`)

> Si el commit falla por el hook, corregir el error y volver a hacer commit. NUNCA usar `--no-verify`.

### GitHub Actions CI Pipeline

El CI ejecuta en cada push a `main`/`develop` y en PRs:

```
Format Check → Type Check → Lint → Unit Tests → Coverage → Dead Code (Knip) → Security Audit → Build → Bundle Size
```

E2E tests (Playwright) se ejecutan solo en PRs despues de que pase el quality check.

**Scripts disponibles:**

| Script                    | Proposito                       |
| ------------------------- | ------------------------------- |
| `bun run dev`             | Servidor de desarrollo          |
| `bun run build`           | Build de produccion             |
| `bun run test`            | Tests unitarios + integracion   |
| `bun run test:watch`      | Tests en modo watch             |
| `bun run test:coverage`   | Tests con reporte de cobertura  |
| `bun run test:e2e`        | Tests E2E (Playwright)          |
| `bun run lint`            | ESLint                          |
| `bun run lint:fix`        | ESLint con autofix              |
| `bun run format`          | Prettier format                 |
| `bun run format:check`    | Verificar formato               |
| `bun run type-check`      | TypeScript strict               |
| `bun run knip`            | Deteccion de codigo muerto      |
| `bun run db:generate`     | Generar migracion Drizzle       |
| `bun run db:push`         | Push schema a DB                |
| `bun run db:migrate`      | Ejecutar migraciones            |
| `bun run db:studio`       | Drizzle Studio (visual)         |
| `bun run db:seed`         | Seed data                       |
| `bun run db:reset`        | Reset DB + seed                 |
| `bun run email:preview`   | Preview de emails (puerto 3001) |
| `bun run generate:module` | Generar modulo nuevo            |
| `bun run generate:icons`  | Generar iconos SVG              |

---

## 14. WORKFLOW DE DESARROLLO — Slash Commands

Este proyecto usa **5 slash commands** que convierten Claude Code en un flujo de ingenieria real. Cada comando genera artefactos en `docs/tasks/` que el siguiente comando consume.

### Flujo completo

```
/brainstorm → /spec-task → /plan-task → /implement-task → /review-task
```

| Comando           | Proposito                               | Input                    | Output                                   |
| ----------------- | --------------------------------------- | ------------------------ | ---------------------------------------- |
| `/brainstorm`     | Explorar codebase, proponer enfoques    | Descripcion del feature  | `brainstorm.md` + `sprint.md`            |
| `/spec-task`      | Definir QUE construir (no como)         | Brainstorm o descripcion | `spec.md`                                |
| `/plan-task`      | Disenar COMO construirlo, fase por fase | Spec                     | `plan.md` + `decisions.md` + `status.md` |
| `/implement-task` | Ejecutar implementacion fase por fase   | Plan                     | Codigo + tests + `status.md` actualizado |
| `/review-task`    | Auditar codigo contra spec              | Codigo implementado      | `audit.md`                               |

### Cuando usar cada comando

- **Tarea simple (< 30 min):** Salta directo a `/implement-task` con la descripcion
- **Tarea mediana (1-3 horas):** `/spec-task` → `/plan-task` → `/implement-task`
- **Tarea compleja (> 3 horas):** Flujo completo desde `/brainstorm`
- **Revision post-implementacion:** `/review-task` en cualquier momento

### Continuidad entre sesiones

Si el contexto se llena o necesitas retomar en otra sesion:

1. `/implement-task` guarda progreso en `docs/tasks/status.md`
2. Una sesion nueva lee `status.md` y retoma desde la ultima fase completada
3. Usa `/implement-task continuar` para retomar

### Agentes automaticos

Los commands lanzan agentes en paralelo cuando es necesario:

- **Exploracion de codebase** — schema, adapters, componentes, modules
- **Documentacion oficial** — via context7 MCP para docs actualizados
- **Revision de seguridad** — OWASP Top 10 en codigo nuevo
- **Revision de performance** — N+1, Promise.all, ISR, server components
- **Compliance con spec** — compara implementacion vs especificacion

### Artefactos (`docs/tasks/`)

Los archivos en `docs/tasks/` son **temporales por feature** — se regeneran con cada nuevo feature. Estan en `.gitignore` porque son artefactos de trabajo, no documentacion permanente.

---

## 15. CHECKLIST PRE-COMMIT

### Protocolo

- [ ] Lei `docs/` relevantes antes de implementar
- [ ] Analice DB schema, adapters y componentes existentes
- [ ] Busque mejores practicas en documentacion oficial de paquetes

### Arquitectura

- [ ] Paginas solo componen, sin logica
- [ ] Server Actions usan `createSafeAction()` (Zod + auth + metadata automaticos)
- [ ] Services NO usan Next.js APIs, lanzan errores tipados (`lib/errors.ts`)
- [ ] Repositories tienen interface explicita + `tx?: DbOrTx` en mutaciones
- [ ] `db.transaction()` en operaciones multi-paso (ver `docs/database.md`)
- [ ] Audit log en cada mutacion
- [ ] Rate limit en actions sensibles (`checkRateLimit`)

### Adapters

- [ ] NUNCA importar libs externas fuera de adapters/
- [ ] Usar providers para obtener servicios
- [ ] Nuevos roles/recursos agregados a `lib/permissions.ts`

### Componentes

- [ ] Server Components por default
- [ ] React Hook Form + zodResolver + useTransition para forms
- [ ] Loading skeletons con `<Skeleton>` de shadcn/ui
- [ ] `loading.tsx` en cada pagina nueva
- [ ] `error.tsx` en cada route group nuevo
- [ ] Componente nuevo documentado en `docs/`

### Seguridad

- [ ] File uploads validados con `validateFile()` (magic bytes)
- [ ] Queries soft-delete usan `notDeleted()` helper
- [ ] CORS configurado si es API publica (`lib/cors.ts`)
- [ ] Validacion Zod en toda entrada de usuario
- [ ] No hay secrets hardcodeados
- [ ] Env vars nuevas clasificadas en `lib/env.ts`

### Rendimiento

- [ ] Promise.all para fetching paralelo
- [ ] ISR con `revalidate` en paginas publicas
- [ ] Zustand con selectores atomicos
- [ ] Paginacion con `lib/pagination.ts` (no custom)

### Tests — OBLIGATORIO

- [ ] Tests unitarios para cada service/util nuevo o modificado
- [ ] Tests de integracion para cada action nueva o modificada
- [ ] Tests de componente para componentes con interaccion
- [ ] Factories actualizadas si hay nuevas entidades
- [ ] `bun run test` pasa sin errores
- [ ] Coverage >= 50% en archivos nuevos

### i18n

- [ ] Nuevos textos en es.json, en.json Y ca.json
- [ ] Campos i18n en DB usan `lib/i18n-helpers.ts` (getTranslatedField, etc.)
- [ ] Links usan `@/i18n/navigation` (no `next/link`)

### Calidad

- [ ] `bun run format:check` pasa sin errores (Prettier)
- [ ] `bun run lint` pasa sin errores (ESLint)
- [ ] `bun run type-check` pasa sin errores (TypeScript)
- [ ] Imports con @/
- [ ] Archivos < 250 lineas
- [ ] Utilidades existentes reutilizadas (`cn`, `formatCurrency`, `slugify`, etc.)
- [ ] Documentacion actualizada en `docs/`

---

_Starter Template — Ultima actualizacion: Marzo 2026_
