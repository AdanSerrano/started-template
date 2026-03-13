# CLAUDE.md — Starter Template

> Plantilla de proyecto full-stack para aplicaciones web modernas.
> **Documentacion detallada en `docs/`** — este archivo es el resumen ejecutivo.

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

## 3. STACK RESUMIDO

| Capa      | Tecnologia                                      |
| --------- | ----------------------------------------------- |
| Framework | Next.js 16, React 19.2, TypeScript              |
| Estilos   | Tailwind CSS 4 + shadcn/ui                      |
| DB        | PostgreSQL (Neon) + Drizzle ORM                 |
| Auth      | Better Auth                                     |
| Email     | Resend + React Email                            |
| Storage   | Cloudflare R2                                   |
| Jobs      | Trigger.dev                                     |
| i18n      | next-intl (ES/EN/CA)                            |
| CI/CD     | GitHub Actions + bun                            |

**Ver:** `docs/tech-stack.md` para detalles y variables de entorno.

---

## 4. ESTRUCTURA

```
starter-template/
├── app/[locale]/           # Routing — paginas thin con loading.tsx
├── modules/                # Domain — modulos con arquitectura limpia
│   ├── auth/               # Login, registro, OAuth, magic links, 2FA
│   └── account/            # Perfil, direcciones del usuario
├── components/
│   ├── ui/                 # shadcn/ui
│   └── forms/              # 40+ campos de formulario reutilizables
├── lib/
│   ├── interfaces/         # 12 contratos TypeScript
│   ├── adapters/           # 11 implementaciones (UNICO lugar con libs externas)
│   ├── providers.ts        # Factory (Singleton) — 11 providers
│   ├── rate-limit.ts       # Rate limiter in-memory
│   └── env.ts              # Validacion de entorno
├── db/schema/              # Drizzle schemas
├── messages/               # Traducciones (es/en/ca)
├── .github/workflows/      # CI: type-check + lint + build
└── docs/                   # Documentacion detallada
```

---

## 5. REGLAS ABSOLUTAS

### Arquitectura

| Capa       | Responsabilidad                 | NO hace               |
| ---------- | ------------------------------- | --------------------- |
| Page       | Compone componentes             | NO logica, NO queries |
| Action     | Valida Zod, autentica, orquesta | NO logica de negocio  |
| Service    | TODA logica de negocio          | NO Next.js APIs       |
| Repository | Queries Drizzle                 | NO logica             |
| Adapter    | Implementa interfaces           | NO logica de negocio  |

### Adapters — OBLIGATORIO

```ts
// CORRECTO
import { getEmailService } from '@/lib/providers'
await getEmailService().send({ to, subject, html })

// PROHIBIDO — NUNCA fuera de lib/adapters/
import { Resend } from 'resend'
import axios from 'axios'
```

### Server Components por Default

Solo `'use client'` para: event handlers, React hooks cliente, APIs navegador, Zustand.

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
<Skeleton className="h-8 w-40" />
```

Cada pagina DEBE tener `loading.tsx` que refleje su layout real.

### Audit Logs — OBLIGATORIO en mutaciones

```ts
await createAuditLog({
  action: 'entity.created',
  entityType: 'entity',
  entityId: entity.id,
})
```

### ISR — Paginas publicas con revalidate

```tsx
export const revalidate = 3600
```

### Imports — Path aliases

```ts
import { db } from '@/lib/db' // CORRECTO
import { db } from '../../lib/db' // PROHIBIDO
```

### Limite de lineas — 250 maximo por archivo

### Image Upload — Preview local, upload al guardar OBLIGATORIO

```tsx
const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
const previewUrl = URL.createObjectURL(file)

startTransition(async () => {
  const formData = new FormData()
  formData.append('file', file)
  const result = await uploadImageAction(formData)
})
```

Key en R2: `public/{modulo}/{entityId}/{uuid}.{ext}`

---

## 6. RENDIMIENTO

### Data Fetching — Paralelo OBLIGATORIO

```tsx
const [a, b] = await Promise.all([getA(), getB()])
```

### Zustand — Selectores atomicos

```ts
const count = useStore((s) => s.items.length) // CORRECTO
const { items, total } = useStore() // PROHIBIDO
```

---

## 7. AUTH

```ts
const session = await getServerSession() // Server Component
const session = await requireAuth() // Proteger pagina
const session = await requireRole(['super_admin']) // Solo admins
```

---

## 8. i18n (ES/EN/CA)

```tsx
const t = await getTranslations('namespace') // Server Component
const t = useTranslations('namespace') // Client Component
import { Link, useRouter } from '@/i18n/navigation' // SIEMPRE
```

---

## 9. TAILWIND CSS 4 — Cambios criticos

| v3 (PROHIBIDO) | v4 (USAR)        |
| -------------- | ---------------- |
| `shadow-sm`    | `shadow-xs`      |
| `rounded-sm`   | `rounded-xs`     |
| `outline-none` | `outline-hidden` |
| `ring`         | `ring-3`         |
| `flex-grow`    | `grow`           |

---

## 10. MODULOS INCLUIDOS

| Modulo    | Responsabilidad                            |
| --------- | ------------------------------------------ |
| `auth`    | Login, registro, OAuth, magic links, roles |
| `account` | Perfil, direcciones del usuario            |

---

## 11. CHECKLIST PRE-COMMIT

### Arquitectura

- [ ] Paginas solo componen, sin logica
- [ ] Server Actions: Zod + requireAuth() + service
- [ ] Services NO usan Next.js APIs
- [ ] Audit log en cada mutacion

### Adapters

- [ ] NUNCA importar libs externas fuera de adapters/
- [ ] Usar providers para obtener servicios

### Componentes

- [ ] Server Components por default
- [ ] React Hook Form + zodResolver + useTransition para forms
- [ ] Loading skeletons con `<Skeleton>` de shadcn/ui

### Rendimiento

- [ ] Promise.all para fetching paralelo
- [ ] ISR con `revalidate` en paginas publicas
- [ ] Zustand con selectores atomicos

### Calidad

- [ ] Imports con @/
- [ ] Archivos < 250 lineas
- [ ] TypeScript strict sin errores
- [ ] Nuevos textos en es.json, en.json Y ca.json

---

_Starter Template — Ultima actualizacion: Marzo 2026_
