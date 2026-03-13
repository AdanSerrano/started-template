# Autenticacion — Starter App

> Better Auth optimizado, roles y sesiones.

---

## Arquitectura de Archivos

| Archivo              | Proposito                                           |
| -------------------- | --------------------------------------------------- |
| `lib/auth.ts`        | Configuracion Better Auth (server) — plugins, hooks |
| `lib/auth-client.ts` | Cliente Better Auth (browser)                       |
| `lib/auth-server.ts` | Helpers para Server Components                      |

---

## Optimizaciones de Rendimiento

### 1. Cookie Cache — Evita llamadas a DB

```typescript
// lib/auth.ts
session: {
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60,        // 5 minutos
    strategy: 'compact',   // menor tamano
  },
}
```

**Impacto:** Sesion se lee de cookie (~1-2ms) en lugar de DB (~50-100ms).

### 2. nextCookies Plugin

```typescript
// lib/auth.ts
plugins: [
  username(),
  twoFactor({ issuer: 'Starter App' }),
  admin({ ac, roles, defaultRole: 'org_admin' }),
  magicLink({ ... }),
  nextCookies(), // DEBE ser el ULTIMO plugin
]
```

### 3. Bundle Optimization

```typescript
import { betterAuth } from 'better-auth/minimal' // NO 'better-auth'
```

**Impacto:** Excluye Kysely, reduce bundle ~30KB.

---

## Server Session — Patron OBLIGATORIO

> **REGLA:** SIEMPRE obtener sesion en Server Components y pasarla a Client Components.

### Helpers (`lib/auth-server.ts`)

```typescript
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { auth } from '@/lib/auth'

// Obtener sesion (cacheada por request)
export const getServerSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

// Requerir autenticacion
export async function requireAuth(redirectTo = '/login') {
  const session = await getServerSession()
  if (!session) redirect(redirectTo)
  return session
}

// Requerir rol especifico
export async function requireRole(
  allowedRoles: ('super_admin' | 'org_admin' | 'org_staff')[],
  redirectTo = '/dashboard',
) {
  const session = await requireAuth()
  const userRole = (session.user as { role?: string }).role
  if (!userRole || !allowedRoles.includes(userRole)) redirect(redirectTo)
  return session
}

export type ServerSession = Awaited<ReturnType<typeof getServerSession>>
export type AuthenticatedSession = NonNullable<ServerSession>
```

### Patron Server -> Client

```tsx
// CORRECTO — Server Component obtiene sesion
// app/[locale]/page.tsx (Server Component)
import { getServerSession } from '@/lib/auth-server'
import { NavAuthButtons } from '@/components/nav-auth-buttons.client'

export default async function Page() {
  const session = await getServerSession()
  return <NavAuthButtons session={session} />
}

// components/nav-auth-buttons.client.tsx (Client Component)
;('use client')
import { authClient } from '@/lib/auth-client'
import type { ServerSession } from '@/lib/auth-server'

interface Props {
  session?: ServerSession
}

export function NavAuthButtons({ session: serverSession }: Props) {
  const { data: clientSession } = authClient.useSession()
  const session = serverSession ?? clientSession

  if (!session) return <LoginButtons />
  return <UserMenu user={session.user} />
}
```

```tsx
// PROHIBIDO — Client Component hace fetch
'use client'
export function NavAuthButtons() {
  const { data: session, isPending } = authClient.useSession()
  if (isPending) return <Skeleton /> // EVITAR
}
```

---

## Flujo de Autenticacion

```
Request HTTP
    |
Proxy (proxy.ts) — cookie check rapido
    |
Server Component — getServerSession()
    |
+- Cookie Cache HIT (95% casos) ------------------+
|  Lee sesion de cookie firmada                    |
|  Tiempo: ~1-2ms                                  |
|  NO toca la base de datos                        |
+--------------------------------------------------+
    | MISS (cada 5 min)
+- Database Query ---------------------------------+
|  Consulta sessions + users                       |
|  Actualiza cookie cache                          |
|  Tiempo: ~50-100ms                               |
+--------------------------------------------------+
    |
Render INMEDIATO — sin loading/skeleton
    |
Client Component recibe session como prop
```

---

## Database Indexes — OBLIGATORIOS

```typescript
// db/schema/sessions.ts
(table) => [
  index('session_user_idx').on(table.userId),
  index('session_token_idx').on(table.token),
]

// db/schema/users.ts
(table) => [
  index('user_email_idx').on(table.email),
  index('user_org_idx').on(table.organizationId),
]
```

---

## Roles y Permisos

| Rol           | Acceso                        | Asignacion            |
| ------------- | ----------------------------- | --------------------- |
| `super_admin` | Todo el sistema               | Hardcoded fundadores  |
| `org_admin`   | CRUD su org, config           | Al crear organizacion |
| `org_staff`   | Ver recursos, gestionar datos | Invitado por admin    |

---

## Proteccion de Rutas

### En Server Components

```tsx
// app/[locale]/dashboard/page.tsx
import { requireAuth } from '@/lib/auth-server'

export default async function DashboardPage() {
  const session = await requireAuth()
  return <Dashboard user={session.user} />
}

// app/[locale]/dashboard/admin/page.tsx
import { requireRole } from '@/lib/auth-server'

export default async function AdminPage() {
  const session = await requireRole(['super_admin'])
  return <AdminPanel />
}
```

---

## Multi-tenancy — REGLA ABSOLUTA

> **NUNCA una query sin filtrar por `organizationId`.**

```typescript
// SIEMPRE
const session = await requireAuth()
await db
  .select()
  .from(resources)
  .where(eq(resources.organizationId, session.user.organizationId))

// NUNCA
await db.select().from(resources)
```

---

## Cuando Usar Cada Helper

| Situacion                         | Helper                      |
| --------------------------------- | --------------------------- |
| Pagina publica con UI condicional | `getServerSession()`        |
| Pagina protegida (dashboard)      | `requireAuth()`             |
| Pagina solo para admins           | `requireRole(['...'])`      |
| Server Action que modifica datos  | `requireAuth()`             |
| Client Component interactivo      | Recibir `session` como prop |
| Fallback si no hay server session | `authClient.useSession()`   |

---

_Starter App (c) 2026_
