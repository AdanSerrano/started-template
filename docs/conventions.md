# Convenciones de Codigo — Starter App

> Naming, imports, limites de archivo, skeletons y manejo de errores.

---

## Naming

| Tipo                | Convencion            | Ejemplo                          |
| ------------------- | --------------------- | -------------------------------- |
| Archivos componente | kebab-case            | `user-form.client.tsx`           |
| Client Components   | sufijo `.client.tsx`  | `sidebar-nav.client.tsx`         |
| Server Components   | sin sufijo            | `user-grid.tsx`                  |
| Server Actions      | un archivo por action | `create-user.ts`                 |
| Zustand stores      | sufijo `-store.ts`    | `ui-store.ts`                    |
| Hooks               | prefijo `use-`        | `use-debounce.ts`               |
| Schemas Drizzle     | un archivo por tabla  | `db/schema/users.ts`            |
| Schemas Zod         | `validations.ts`      | `modules/account/validations.ts` |
| Emails              | kebab-case            | `welcome-email.tsx`              |
| Loading pages       | `loading.tsx`         | `app/[locale]/account/loading.tsx` |

---

## Imports — SIEMPRE Path Aliases

```typescript
// CORRECTO
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// PROHIBIDO — nunca imports relativos entre modulos
import { userService } from '../../account/services/user-service'
```

---

## Limite de Lineas — MAXIMO 250

> **REGLA OBLIGATORIA:** Ningun archivo debe superar las 250 lineas.

### Que hacer cuando un archivo crece

| Situacion                  | Solucion                          |
| -------------------------- | --------------------------------- |
| Componente grande          | Extraer sub-componentes           |
| Service con muchos metodos | Dividir por dominio               |
| Repository complejo        | Extraer en archivos separados     |
| Muchos tipos/interfaces    | Mover a `types.ts`                |
| Validaciones extensas      | Archivo `validations.ts` separado |

---

## Loading Skeletons — Patron OBLIGATORIO

> Todos los `loading.tsx` DEBEN usar `<Skeleton>` de `@/components/ui/skeleton`.

```tsx
// CORRECTO
import { Skeleton } from '@/components/ui/skeleton'

export default function PageLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4">
      <Skeleton className="h-8 w-40" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="space-y-2 p-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// PROHIBIDO — divs manuales con animate-pulse
;<div className="bg-muted h-8 w-40 animate-pulse rounded" />
```

### Principios del skeleton

1. **Reflejar el layout real** de la pagina
2. Usar `<Skeleton>` de shadcn/ui, nunca divs manuales
3. Mismos max-width y padding que la pagina real
4. Aspectos ratio correctos para imagenes (`aspect-square`, `aspect-[3/4]`)

---

## Errores de Dominio

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
  ) {
    super(message)
  }
}
export class NotFoundError extends AppError {
  /* 404 */
}
export class ValidationError extends AppError {
  /* 422 */
}
export class UnauthorizedError extends AppError {
  /* 401 */
}
export class ForbiddenError extends AppError {
  /* 403 */
}
```

---

## Validacion de Entorno

```typescript
// lib/env.ts — 2 niveles de validacion
const critical = ['DATABASE_URL', 'BETTER_AUTH_SECRET'] // Siempre throw
const recommended = ['RESEND_API_KEY', ...] // Warn en dev, throw en prod

export const env = { DATABASE_URL, BETTER_AUTH_SECRET, ... }
```

---

## Audit Logs — CADA mutacion

```typescript
await createAuditLog({
  action: 'user.updated', // entity.verb
  entityType: 'user',
  entityId: user.id,
})
```

---

## Validacion con Zod

### SIEMPRE `safeParse()`, NUNCA `parse()`

```typescript
const parsed = schema.safeParse(data)
if (!parsed.success) {
  return { success: false, error: parsed.error.flatten() }
}
```

---

## Pre-Commit Checklist

### Arquitectura

- [ ] Paginas solo componen, sin logica
- [ ] Server Actions: Zod `safeParse` + `requireAuth()` + service
- [ ] Services NO usan Next.js APIs
- [ ] CADA mutacion llama `createAuditLog()`

### Adapters

- [ ] NUNCA importar libs externas fuera de adapters/
- [ ] Usar providers para obtener servicios

### Componentes

- [ ] Server Components por default
- [ ] `'use client'` solo para event handlers, hooks cliente, Zustand
- [ ] React Hook Form + zodResolver + useTransition para forms

### Loading Skeletons

- [ ] `<Skeleton>` de shadcn/ui, nunca divs manuales
- [ ] Layout refleja la pagina real

### Rendimiento

- [ ] Promise.all para fetching paralelo
- [ ] Zustand con selectores atomicos
- [ ] ISR con `revalidate` en paginas publicas

### i18n

- [ ] `Link` de `@/i18n/navigation`, NUNCA `next/link`
- [ ] Nuevos textos en es.json, en.json Y ca.json

### Calidad

- [ ] Imports con `@/`
- [ ] TypeScript strict sin errores
- [ ] **NINGUN archivo supera 250 lineas**

---

_Starter App (c) 2026_
