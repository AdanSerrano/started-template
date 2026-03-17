# CLAUDE.md — Starter Template

> Plantilla full-stack para aplicaciones web modernas.
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

| Archivo                 | Leer cuando...                                               |
| ----------------------- | ------------------------------------------------------------ |
| `docs/architecture.md`  | Creas modulo, swappeas servicio, o agregas adapter           |
| `docs/database.md`      | Agregas tabla, creas migracion, tocas DB, o cambias dialecto |
| `docs/tech-stack.md`    | Configuras algo o agregas dependencia                        |
| `docs/patterns.md`      | Diseñas logica de negocio o servicios                        |
| `docs/conventions.md`   | Escribes cualquier codigo nuevo                              |
| `docs/auth.md`          | Tocas auth, sesiones o permisos                              |
| `docs/performance.md`   | Optimizas rendimiento o agregas monitoring                   |
| `docs/i18n.md`          | Agregas textos, traducciones o cambias tema                  |
| `docs/testing.md`       | Escribes CUALQUIER codigo nuevo o modificas existente        |
| `docs/deployment.md`    | Despliegas o configuras entorno                              |
| `docs/monitoring.md`    | Configuras observabilidad o depuras produccion               |
| `docs/security.md`      | Implementas seguridad o revisas vulnerabilidades             |
| `docs/api-routes.md`    | Creas o modificas endpoints en app/api/                      |
| `docs/jobs.md`          | Implementas tareas asincronas o programadas                  |
| `docs/caching.md`       | Implementas cache o tocas datos con alta frecuencia          |
| `docs/official-docs.md` | Usas cualquier paquete — SIEMPRE consultar primero           |

### Documentar componentes nuevos — OBLIGATORIO

- **Componentes reutilizables** — Documentar en `docs/`: proposito, props/API, ejemplo, variantes
- **Modulos nuevos** — Agregar seccion en `docs/architecture.md`
- **Adapters nuevos** — Documentar interface, config y ejemplo en `docs/architecture.md`

> Si no esta documentado, no esta terminado.

---

## 4. PROTOCOLO PRE-IMPLEMENTACION — OBLIGATORIO

**ANTES de escribir codigo, analiza el sistema existente.**

### Paso 1: Analizar el contexto existente

1. Lee `docs/` relevantes para la tarea
2. Revisa `db/schema/` — tablas/relaciones existentes
3. Revisa `lib/interfaces/` — contratos a implementar o reutilizar
4. Revisa `lib/adapters/` — servicios existentes
5. Revisa `components/` — componentes para componer
6. Revisa `modules/` — services/repos similares

### Paso 2: Consultar `docs/official-docs.md`

1. Localiza URLs de los paquetes que vas a tocar
2. Consulta docs oficiales para la VERSION EXACTA (ver `package.json`)
3. Busca patterns recomendados, breaking changes y deprecaciones
4. Si agregas paquete nuevo, agrega su URL a `docs/official-docs.md`

### Paso 3: Planificar antes de codificar

1. Identifica capas: Page → Action → Service → Repository
2. Verifica si necesitas nuevo schema, interface o adapter
3. Reutiliza lo maximo posible
4. Si es complejo, propone el plan al usuario antes de implementar

---

## 5. REGLAS ABSOLUTAS — RESUMEN

> Cada regla tiene ejemplos completos en el `docs/` indicado.

### Arquitectura — 5 capas (`docs/architecture.md`, `docs/patterns.md`)

| Capa       | Responsabilidad                 | NO hace               |
| ---------- | ------------------------------- | --------------------- |
| Page       | Compone componentes             | NO logica, NO queries |
| Action     | Valida Zod, autentica, orquesta | NO logica de negocio  |
| Service    | TODA logica de negocio          | NO Next.js APIs       |
| Repository | Queries Drizzle                 | NO logica             |
| Adapter    | Implementa interfaces           | NO logica de negocio  |

### Reglas criticas — referencia rapida

| Regla              | Detalle                                                                           | Docs                   |
| ------------------ | --------------------------------------------------------------------------------- | ---------------------- |
| **Server Actions** | SIEMPRE via `createSafeAction()` — provee Zod, auth, metadata, error handling     | `docs/architecture.md` |
| **Error Handling** | SIEMPRE clases tipadas de `lib/errors.ts` (NotFoundError, ForbiddenError, etc.)   | `docs/conventions.md`  |
| **Rate Limiting**  | OBLIGATORIO en actions sensibles via `checkRateLimit()`                           | `docs/security.md`     |
| **Soft Delete**    | SIEMPRE usar `notDeleted()` de `lib/query-helpers.ts` en reads                    | `docs/database.md`     |
| **Transacciones**  | `db.transaction()` OBLIGATORIO en operaciones multi-paso                          | `docs/database.md`     |
| **Repositories**   | Interface explicita + `tx?: DbOrTx` en mutaciones                                 | `docs/database.md`     |
| **DB Dialect**     | SIEMPRE importar de `@/db/dialect`, NUNCA de `drizzle-orm/pg-core` directamente   | `docs/database.md`     |
| **Adapters**       | NUNCA importar libs externas fuera de `lib/adapters/`. Usar providers             | `docs/architecture.md` |
| **Audit Logs**     | OBLIGATORIO en cada mutacion via `createAuditLog()`                               | `docs/conventions.md`  |
| **Branding**       | SIEMPRE via `appConfig` de `lib/config.ts`. NUNCA hardcodear                      | `docs/conventions.md`  |
| **Imports**        | SIEMPRE `@/` path aliases. NUNCA rutas relativas                                  | `docs/conventions.md`  |
| **Limite lineas**  | 250 max por archivo (excepto `components/ui/`, archivos auto-generados)           | `docs/conventions.md`  |
| **Env vars**       | Clasificar en `lib/env.ts` segun categoria (critical/recommended/paired/optional) | `docs/tech-stack.md`   |

### Componentes y UI (`docs/performance.md`, `docs/conventions.md`)

| Regla                 | Detalle                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| **Server Components** | Por default. Solo `'use client'` para: event handlers, hooks cliente, APIs navegador, Zustand  |
| **useEffect**         | CASI PROHIBIDO — ver tabla de alternativas en `docs/performance.md`                            |
| **Forms**             | React Hook Form + zodResolver + `useTransition` OBLIGATORIO                                    |
| **Loading**           | `<Skeleton>` de shadcn/ui. NUNCA `animate-pulse` manual                                        |
| **Special pages**     | `loading.tsx` en cada pagina, `error.tsx` en cada route group                                  |
| **File upload**       | `validateFile()` de `lib/upload-validation.ts` (magic bytes). Preview local, upload al guardar |
| **Paginacion**        | Usar `lib/pagination.ts` (schemas, helpers, defaults). NO crear custom                         |
| **Emails**            | Sin iconos/emojis decorativos                                                                  |

### Middleware — `proxy.ts` (`docs/architecture.md`)

En **Next.js 16**, middleware se renombro a `proxy.ts`. Al agregar rutas, modificar **`routes.ts`**, NO `proxy.ts`.

### Tailwind CSS 4 — Cambios criticos (`docs/tech-stack.md`)

`shadow-sm`→`shadow-xs`, `rounded-sm`→`rounded-xs`, `outline-none`→`outline-hidden`, `ring`→`ring-3`, `flex-grow`→`grow`

### Zod 4 — Usar `error` en vez de `message`

```ts
z.string().refine(fn, { error: 'Required' }) // CORRECTO (Zod 4)
```

### Tests — OBLIGATORIO (`docs/testing.md`)

| Capa       | Tipo        | Ubicacion                                 |
| ---------- | ----------- | ----------------------------------------- |
| Service    | Unit        | `tests/unit/mi-service.test.ts`           |
| Action     | Integration | `tests/integration/mi-action.test.ts`     |
| Repository | Unit        | `tests/unit/mi-repository.test.ts`        |
| Utility    | Unit        | `tests/unit/mi-util.test.ts`              |
| Component  | Component   | `tests/components/mi-componente.test.tsx` |

- NO entregar codigo sin tests — mockear solo boundaries — factories en `tests/factories/`
- Coverage >= 50% en archivos nuevos

### Utilidades disponibles — NO reimplementar

| Util                                                                                   | Import                                   |
| -------------------------------------------------------------------------------------- | ---------------------------------------- |
| `cn()`, `formatCurrency()`, `formatDate()`, `slugify()`                                | `@/lib/utils`                            |
| `apiSuccess()`, `apiError()`, `apiNotFound()`                                          | `@/lib/api-response`                     |
| `paginationSchema`, `createPaginatedResult()`                                          | `@/lib/pagination`                       |
| `corsHeaders()`, `handleCorsPreflight()`                                               | `@/lib/cors`                             |
| `getRequestId()`                                                                       | `@/lib/request-context`                  |
| `getTranslatedField()`, `createI18nField()`                                            | `@/lib/i18n-helpers`                     |
| `sanitizeHtml()`, `sanitizeText()`                                                     | `@/lib/sanitize`                         |
| `validateFile()`                                                                       | `@/lib/upload-validation`                |
| `ac` (access control), `requireRole()`                                                 | `@/lib/permissions`, `@/lib/auth-server` |
| `createSafeAction()`, `ActionResult<T>`                                                | `@/lib/safe-action`                      |
| `notDeleted()`, `byId()`, `activeById()`, `withLimit()`, `withOffset()`, `countRows()` | `@/lib/query-helpers`                    |
| `generateRequestId()`, `getRequestId()`, `withRequestContext()`                        | `@/lib/request-context`                  |

### Auth (`docs/auth.md`) — Quick ref

```ts
await getServerSession() // Server Component (cookie cache 5min)
await requireAuth() // Proteger pagina
await requireRole(['super_admin']) // Solo admins
```

Roles: `super_admin` > `admin` > `user`. Detalle en `lib/permissions.ts`.

### i18n (`docs/i18n.md`) — Quick ref

```ts
const t = await getTranslations('ns') // Server
const t = useTranslations('ns') // Client
import { Link } from '@/i18n/navigation' // SIEMPRE (no next/link)
```

Idiomas: ES/EN/CA. Textos en `messages/*.json`.

---

## 6. ESTRUCTURA RESUMIDA

> Estructura completa con responsabilidades: `docs/architecture.md`

```
starter-template/
├── app/[locale]/           # Pages thin (loading.tsx + error.tsx)
├── app/api/health/         # Health check
├── modules/                # Domain modules (auth, account)
│   └── [module]/           # actions/ services/ repositories/ components/
├── components/             # ui/ (shadcn), forms/, custom-datatable/, sidebar/
├── lib/                    # Core: interfaces/, adapters/, providers, utils
├── db/dialect/             # Abstraccion multi-DB (pg, mysql, sqlite, turso, singlestore)
├── db/schema/              # 13 Drizzle schemas (importan de db/dialect/)
├── emails/                 # React Email templates
├── messages/               # i18n (es/en/ca.json)
├── tests/                  # unit/ integration/ components/ factories/ mocks/
├── e2e/                    # Playwright
├── proxy.ts                # Middleware Next.js 16 (i18n, auth, request ID)
├── routes.ts               # Config rutas auth/public/protected
└── docs/                   # DOCUMENTACION COMPLETA
```

---

## 7. STACK RESUMIDO

> Detalle completo: `docs/tech-stack.md`

Next.js 16 · React 19.2 · TypeScript · Tailwind 4 + shadcn/ui · PostgreSQL (Neon) + Drizzle · Better Auth · Resend + React Email · Cloudflare R2 · Trigger.dev · next-intl (ES/EN/CA) · GitHub Actions + bun

---

## 8. MODULOS Y GENERADOR

| Modulo    | Responsabilidad                            |
| --------- | ------------------------------------------ |
| `auth`    | Login, registro, OAuth, magic links, roles |
| `account` | Perfil, direcciones del usuario            |

```bash
bun run generate:module  # Genera estructura completa — NO crear manualmente
```

---

## 9. CI/CD Y HOOKS

### Pre-commit (Husky + lint-staged)

Automatico en cada commit: `prettier --write` + `eslint --fix --cache`. NUNCA usar `--no-verify`.

### Scripts principales

| Script                                                                                  | Proposito             |
| --------------------------------------------------------------------------------------- | --------------------- |
| `bun run dev`                                                                           | Desarrollo            |
| `bun run build`                                                                         | Build produccion      |
| `bun run test` / `test:coverage`                                                        | Tests / con cobertura |
| `bun run test:e2e`                                                                      | Playwright E2E        |
| `bun run lint` / `lint:fix`                                                             | ESLint                |
| `bun run format` / `format:check`                                                       | Prettier              |
| `bun run type-check`                                                                    | TypeScript strict     |
| `bun run knip`                                                                          | Codigo muerto         |
| `bun run db:generate` / `db:push` / `db:migrate` / `db:studio` / `db:seed` / `db:reset` | DB ops                |
| `bun run email:preview`                                                                 | Preview emails (3001) |
| `bun run start`                                                                         | Iniciar produccion    |
| `bun run test:watch`                                                                    | Tests en modo watch   |
| `bun run test:unit` / `test:integration` / `test:components`                            | Tests por tipo        |
| `bun run test:coverage`                                                                 | Tests con cobertura   |
| `bun run test:ui`                                                                       | UI de Vitest          |
| `bun run test:all`                                                                      | Unit + E2E            |
| `bun run lint:fix`                                                                      | ESLint con auto-fix   |
| `bun run generate:module` / `generate:icons`                                            | Generadores           |

---

## 10. WORKFLOW — Slash Commands

```
/brainstorm → /spec-task → /plan-task → /implement-task → /review-task
```

| Comando           | Proposito                            | Output                                   |
| ----------------- | ------------------------------------ | ---------------------------------------- |
| `/brainstorm`     | Explorar codebase, proponer enfoques | `brainstorm.md` + `sprint.md`            |
| `/spec-task`      | Definir QUE construir                | `spec.md`                                |
| `/plan-task`      | Diseñar COMO, fase por fase          | `plan.md` + `decisions.md` + `status.md` |
| `/implement-task` | Ejecutar implementacion              | Codigo + tests + `status.md`             |
| `/review-task`    | Auditar codigo vs spec               | `audit.md`                               |

- **Tarea simple (< 30 min):** directo a `/implement-task`
- **Tarea mediana (1-3h):** `/spec-task` → `/plan-task` → `/implement-task`
- **Tarea compleja (> 3h):** flujo completo desde `/brainstorm`
- **Continuidad:** `/implement-task continuar` retoma desde `docs/tasks/status.md`

Artefactos en `docs/tasks/` son temporales por feature (en `.gitignore`).

---

## 11. CHECKLIST PRE-COMMIT

### Protocolo

- [ ] Lei `docs/` relevantes — analice schema, adapters, componentes existentes

### Arquitectura

- [ ] Pages solo componen — Actions usan `createSafeAction()` — Services sin Next.js APIs
- [ ] Repositories con interface + `tx?: DbOrTx` — `db.transaction()` en multi-paso
- [ ] Audit log en mutaciones — Rate limit en actions sensibles
- [ ] Adapters: nunca libs externas fuera de `lib/adapters/`, usar providers

### Componentes

- [ ] Server Components default — Forms con RHF + zod + useTransition
- [ ] `<Skeleton>` para loading — `loading.tsx` + `error.tsx` en rutas nuevas
- [ ] File uploads con `validateFile()` — Queries soft-delete con `notDeleted()`

### Seguridad

- [ ] Validacion Zod en toda entrada — No secrets hardcodeados
- [ ] CORS si API publica — Env vars clasificadas en `lib/env.ts`
- [ ] Nuevos roles/recursos en `lib/permissions.ts`

### Rendimiento

- [ ] `Promise.all` para fetching paralelo — ISR con `revalidate` en paginas publicas
- [ ] Zustand con selectores atomicos — Paginacion con `lib/pagination.ts`

### Tests — OBLIGATORIO

- [ ] Tests para cada service/action/componente nuevo o modificado
- [ ] `bun run test` pasa — Coverage >= 50%

### i18n

- [ ] Textos en es/en/ca.json — Links con `@/i18n/navigation`
- [ ] Campos i18n en DB usan `lib/i18n-helpers.ts`

### Calidad

- [ ] `bun run format:check` + `bun run lint` + `bun run type-check` pasan
- [ ] Imports con `@/` — Archivos < 250 lineas — Docs actualizados

### CI/CD — OBLIGATORIO antes de merge

> **NINGÚN PR se mergea si CI falla.** Ambos jobs deben pasar en verde.

#### Code Quality (cada push a main/develop y PRs)

- [ ] `bun run format:check` — Prettier formatting
- [ ] `bun run type-check` — TypeScript strict, 0 errores
- [ ] `bun run lint` — ESLint, 0 errores, 0 warnings
- [ ] `bun run test` — Todos los unit/integration/component tests pasan
- [ ] `bun run test:coverage` — Coverage >= 50% en archivos nuevos
- [ ] `bun run knip` — 0 codigo muerto
- [ ] `bun run build` — Build de produccion exitoso

#### E2E Tests (cada PR a main)

- [ ] `bun run test:e2e` — Todos los tests Playwright pasan (Chromium + Firefox)
- [ ] Navegacion y rutas protegidas funcionan
- [ ] Health endpoint responde correctamente
- [ ] SEO metadata (robots.txt, sitemap.xml, canonical) presente
- [ ] Auth flow (redirect a login, locale switching) funciona

#### Reglas de proteccion de branch

- `main` esta protegido — **cambios solo via Pull Request**
- Code Quality y E2E deben pasar antes de merge
- Dependabot mantiene dependencias actualizadas automaticamente

---

_Starter Template — Ultima actualizacion: Marzo 2026_
