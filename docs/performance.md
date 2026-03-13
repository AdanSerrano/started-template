# Performance — Starter App

> Next.js 16, React 19.2, ISR, Skeletons, Zustand y Component Isolation.

---

## ISR (Incremental Static Regeneration)

Todas las paginas publicas usan `revalidate` para ISR:

| Pagina       | `revalidate` | Razon                          |
| ------------ | ------------ | ------------------------------ |
| Landing `/`  | 3600 (1h)    | Contenido destacado            |
| Paginas info | 86400 (24h)  | Contenido que cambia poco      |

```tsx
export const revalidate = 3600 // En la pagina
```

---

## Loading Skeletons

Cada pagina tiene `loading.tsx` con `<Skeleton>` de shadcn/ui para feedback inmediato durante navegacion. El skeleton refleja el layout real de la pagina.

```tsx
import { Skeleton } from '@/components/ui/skeleton'
// Nunca divs manuales con bg-muted animate-pulse
```

---

## Server Components por Default

Solo `'use client'` para: event handlers, React hooks cliente, APIs navegador, Zustand.

---

## React 19.2 — Tabla de Decision

| Situacion                    | NO uses                  | USA                             |
| ---------------------------- | ------------------------ | ------------------------------- |
| Datos del servidor           | `useState` + `useEffect` | Server Component + query        |
| Derivar valor de props/state | `useState` + `useEffect` | Calculo directo                 |
| Form con Server Action       | `useState` + fetch       | React Hook Form + useTransition |
| Estado pending del form      | `useState` isLoading     | `useTransition`                 |
| Feedback instantaneo         | `useState` flag          | `useOptimistic`                 |
| Navegacion sin bloquear      | `router.push`            | `useTransition` + `router.push` |
| Estado UI compartido         | Context                  | Zustand selector atomico        |

---

## Zustand 5 — Estado del Cliente

### Regla de oro

> Zustand SOLO para estado UI del cliente. NUNCA para datos del servidor.

| Zustand                 | NO Zustand           |
| ----------------------- | -------------------- |
| Sidebar abierta/cerrada | Lista de entidades   |
| Tema (dark/light)       | Datos de servidor    |
| Filtros activos de UI   | Transacciones        |
| Estado temporal de UI   | Metricas/estadisticas|

### Selectors atomicos — OBLIGATORIO

```typescript
// Solo re-renderiza cuando itemCount cambia
const itemCount = useUIStore((s) => s.items.length)

// PROHIBIDO — re-renderiza con CUALQUIER cambio
const { items, total } = useUIStore()
```

### Stores co-localizados en modulos

```
modules/auth/store/auth-store.ts
modules/account/store/account-store.ts
```

---

## Component Isolation

> Cada pieza de estado debe vivir en el componente mas pequeno posible.

### State Colocation

```tsx
// PROHIBIDO — Estado en padre causa re-render de TODO
export function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  return <div><Header /><Grid /><Button onClick={...} /></div>
}

// CORRECTO — Estado aislado
export function UsersPage() {
  return <div><Header /><Grid /><CreateUserButton /></div>
}
```

### Children Pattern

```tsx
function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  return (
    <div>
      <Sidebar />
      <main>{children}</main>
    </div>
  )
  // children NO se re-renderizan cuando sidebar cambia
}
```

---

## Data Fetching — Paralelo OBLIGATORIO

```tsx
// CORRECTO
const [stats, users] = await Promise.all([getStats(), getUsers()])

// PROHIBIDO (waterfall)
const stats = await getStats()
const users = await getUsers()
```

---

## SEO Performance

- JSON-LD estructurado (Breadcrumb, Organization)
- Canonical URLs + hreflang alternates (es/en/ca)
- OG images con dimensiones
- `robots.ts` y `sitemap.ts` automaticos

---

## Analytics — GA4

Via adapter pattern (`lib/adapters/ga4-analytics.ts`):

```typescript
import { getAnalytics } from '@/lib/providers'

// Eventos disponibles:
// pageView, trackEvent, identify
```

Solo se carga en produccion con `NEXT_PUBLIC_GA4_ID`.

---

## Rate Limiting

In-memory sliding window (`lib/rate-limit.ts`):

- 10 intentos / 15min para login
- Sin dependencia de Redis
- Adecuado para single-instance

---

## Patrones PROHIBIDOS

```tsx
// #1 — useState + useEffect para datos del servidor
const [data, setData] = useState(null)
useEffect(() => { fetch('/api/data')... }, [])

// #2 — useEffect para derivar estado
useEffect(() => { setFullName(`${first} ${last}`) }, [first, last])

// #3 — Desestructurar store completo
const { sidebar, theme } = useUIStore()

// #4 — divs manuales en loading.tsx
<div className="bg-muted animate-pulse" />
```

---

_Starter App (c) 2026_
