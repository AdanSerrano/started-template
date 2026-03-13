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

| Archivo                | Contenido                                             | Leer cuando...                                 |
| ---------------------- | ----------------------------------------------------- | ---------------------------------------------- |
| `docs/architecture.md` | Estructura, capas, adapters, SEO, skeletons, modulos  | Creas un modulo, pagina o componente nuevo     |
| `docs/tech-stack.md`   | Stack completo, Tailwind v4, Drizzle, env vars        | Configuras algo o agregas dependencia          |
| `docs/patterns.md`     | 12 patrones de diseno con ejemplos y anti-patrones    | Diseñas logica de negocio o servicios          |
| `docs/conventions.md`  | Naming, imports, limites, skeletons, errores, Zod     | Escribes cualquier codigo nuevo                |
| `docs/auth.md`         | Better Auth, cookie cache, roles, sesiones, 2FA       | Tocas auth, sesiones o permisos                |
| `docs/performance.md`  | ISR, React 19.2, Zustand, analytics, rate limiting    | Optimizas rendimiento o agregas estado cliente |
| `docs/i18n.md`         | next-intl (es/en/ca), theming dark/light, emails i18n | Agregas textos, traducciones o cambias tema    |

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

### Paso 2: Buscar mejores practicas

```
1. Consulta la documentacion oficial de cada paquete involucrado (versiones actuales)
2. Busca patrones recomendados para la version especifica del stack
3. Verifica que no existan breaking changes o deprecaciones en las APIs que vas a usar
4. Si usas una API poco comun, confirma con la documentacion que es la forma correcta
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
├── app/[locale]/           # Routing — paginas thin con loading.tsx
├── modules/                # Domain — modulos con arquitectura limpia
│   ├── auth/               # Login, registro, OAuth, magic links, 2FA
│   └── account/            # Perfil, direcciones del usuario
├── components/
│   ├── ui/                 # shadcn/ui
│   └── forms/              # 40+ campos de formulario reutilizables
├── lib/
│   ├── interfaces/         # Contratos TypeScript (email, storage, cache, etc.)
│   ├── adapters/           # Implementaciones (UNICO lugar con libs externas)
│   ├── providers.ts        # Factory (Singleton) — todos los providers
│   ├── rate-limit.ts       # Rate limiter in-memory
│   └── env.ts              # Validacion de entorno (critical vs recommended)
├── db/schema/              # Drizzle schemas + relaciones + indexes
├── emails/                 # Templates React Email (sin emojis/iconos decorativos)
├── messages/               # Traducciones (es.json, en.json, ca.json)
├── tests/                  # Vitest setup + tests unitarios
├── .github/workflows/      # CI: type-check + lint + build
└── docs/                   # DOCUMENTACION COMPLETA DEL SISTEMA
```

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
await createAuditLog({
  action: 'entity.created',
  entityType: 'entity',
  entityId: entity.id,
})
```

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

---

## 13. CHECKLIST PRE-COMMIT

### Protocolo

- [ ] Lei `docs/` relevantes antes de implementar
- [ ] Analice DB schema, adapters y componentes existentes
- [ ] Busque mejores practicas en documentacion oficial de paquetes

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
- [ ] Componente nuevo documentado en `docs/`

### Rendimiento

- [ ] Promise.all para fetching paralelo
- [ ] ISR con `revalidate` en paginas publicas
- [ ] Zustand con selectores atomicos

### Calidad

- [ ] Imports con @/
- [ ] Archivos < 250 lineas
- [ ] TypeScript strict sin errores
- [ ] Nuevos textos en es.json, en.json Y ca.json
- [ ] Documentacion actualizada en `docs/`

---

_Starter Template — Ultima actualizacion: Marzo 2026_
