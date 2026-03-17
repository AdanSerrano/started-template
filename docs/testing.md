# Testing — Estrategia y Patrones

## Regla: Tests son OBLIGATORIOS

> **Todo codigo nuevo o modificado DEBE tener tests automaticos.** Si no tiene test, no esta terminado.

Esta regla aplica a:

- **Services** — Test unitario obligatorio (mockear repos/adapters)
- **Actions** — Test de integracion obligatorio (mockear auth/repos/audit)
- **Repositories** — Test unitario obligatorio (verificar queries y parametros)
- **Utilities/helpers** — Test unitario obligatorio (funciones puras = faciles de testear)
- **Componentes con interaccion** — Test de componente obligatorio (formularios, modales, etc.)

**Excepciones** (no requieren test):

- Pages (`app/[locale]/`) — son thin wrappers, se cubren con E2E
- `components/ui/` — shadcn/ui ya esta testeado por Radix
- Archivos de configuracion (`config.ts`, `env.ts`)
- Types/interfaces (`.d.ts`, `types.ts`)

---

## Filosofia

Test pyramid: **unit > integration > E2E**. Mas tests rapidos, menos tests lentos.

| Tipo        | Herramienta  | Directorio           | Que testea                        |
| ----------- | ------------ | -------------------- | --------------------------------- |
| Unit        | Vitest       | `tests/unit/`        | Services, utils, validaciones     |
| Integration | Vitest       | `tests/integration/` | Actions completas (mock repos)    |
| Component   | Vitest + RTL | `tests/components/`  | Componentes React con interaccion |
| E2E         | Playwright   | `e2e/`               | Flujos completos en navegador     |

---

## Estructura de directorios

```
tests/
├── unit/                  # Tests de funciones puras y services
├── integration/           # Tests de actions con mocks
├── components/            # Tests de componentes React
├── factories/             # Factories para datos de test
│   ├── user.factory.ts
│   ├── address.factory.ts
│   └── session.factory.ts
├── mocks/                 # MSW handlers
│   ├── handlers.ts
│   └── server.ts
└── setup.ts               # Setup global (MSW, jest-dom)

e2e/
├── auth.spec.ts           # Flujos de autenticacion
├── navigation.spec.ts     # Navegacion y rutas
└── seo.spec.ts            # Meta tags, sitemap, robots
```

---

## Naming

- Unit/Integration: `*.test.ts`
- Component: `*.test.tsx`
- E2E: `*.spec.ts`

---

## Scripts disponibles

```bash
bun run test              # Todos los tests (unit + integration + component)
bun run test:watch        # Watch mode
bun run test:unit         # Solo unit tests
bun run test:integration  # Solo integration tests
bun run test:components   # Solo component tests
bun run test:coverage     # Con reporte de cobertura
bun run test:ui           # Vitest UI (visual)
bun run test:e2e          # Playwright E2E
bun run test:all          # Todo (Vitest + Playwright)
```

---

## Patrones por capa

### 1. Unit test — Service

Mockear repositorios, testear logica de negocio.

```ts
import { describe, it, expect, vi } from 'vitest'

const mockRepo = {
  findById: vi.fn(),
  create: vi.fn(),
}

vi.mock('@/modules/products/repositories/product-repository', () => ({
  productRepository: mockRepo,
}))

describe('ProductService', () => {
  it('crea producto', async () => {
    mockRepo.create.mockResolvedValue({ id: '1', name: 'Test' })
    const { createProduct } =
      await import('@/modules/products/services/product-service')
    const result = await createProduct({ name: 'Test' })
    expect(result.name).toBe('Test')
  })
})
```

### 2. Integration test — Action

Mock auth + repositories, testear flujo completo de server action.

```ts
vi.mock('@/lib/auth-server', () => ({
  requireAuth: vi.fn().mockResolvedValue({
    user: { id: 'user-1', name: 'Test', email: 'test@test.com' },
  }),
}))
vi.mock('@/lib/audit', () => ({ createAuditLog: vi.fn() }))
vi.mock('@/lib/audit-helpers', () => ({
  getRequestMetadata: vi.fn().mockResolvedValue({ ip: '127.0.0.1' }),
}))

it('action valida input con Zod', async () => {
  const { createAction } = await import('@/modules/x/actions/x-actions')
  const result = await createAction({}) // datos invalidos
  expect(result.success).toBe(false)
  expect(result.fieldErrors).toBeDefined()
})
```

### 3. Component test — React Testing Library

#### 3a. Form fields simples (sin dependencias externas)

Renderizar con FormProvider, interactuar, verificar.

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, FormProvider } from 'react-hook-form'

function Wrapper({ children }) {
  const form = useForm({ defaultValues: {} })
  return <FormProvider {...form}>{children}</FormProvider>
}

it('muestra label y acepta input', async () => {
  const user = userEvent.setup()
  render(
    <Wrapper>
      <FormTextField name="name" label="Nombre" />
    </Wrapper>,
  )
  await user.type(screen.getByRole('textbox'), 'Test')
  expect(screen.getByRole('textbox')).toHaveValue('Test')
})
```

#### 3b. Componentes con next-intl, auth-client, navigation — Mocks OBLIGATORIOS

Los componentes client que usan `useTranslations`, `authClient`, o `useRouter` de i18n necesitan mocks.

> **IMPORTANTE:** `vi.mock()` se hoistea al top del archivo. NO usar variables externas en la factory — usar `vi.fn()` directamente.

```tsx
// CORRECTO — mock inline sin variables externas
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key, // Retorna el key como traduccion
}))

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => null }),
}))

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      email: vi.fn().mockResolvedValue({ data: {}, error: null }),
      username: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  },
}))

vi.mock('@/routes', () => ({
  DEFAULT_LOGIN_REDIRECT: '/account',
  DEFAULT_LOGOUT_REDIRECT: '/login',
}))

// PROHIBIDO — ReferenceError por hoisting de vi.mock
const mockFn = vi.fn()
vi.mock('@/lib/auth-client', () => ({
  authClient: { signIn: { email: mockFn } }, // ✗ mockFn no existe aun
}))
```

**Mocks por dependencia:**

| Dependencia                             | Mock necesario                                 | Cuando                         |
| --------------------------------------- | ---------------------------------------------- | ------------------------------ |
| `next-intl`                             | `useTranslations: () => (key) => key`          | Componentes con traducciones   |
| `@/i18n/navigation`                     | `Link` como `<a>`, `useRouter` mock            | Componentes con Link o router  |
| `next/navigation`                       | `useSearchParams: () => ({ get: () => null })` | Componentes con search params  |
| `@/lib/auth-client`                     | `authClient` con metodos mock                  | Forms de auth                  |
| `@/routes`                              | Constantes de rutas                            | Componentes con redirects      |
| `sonner`                                | `toast: { success: vi.fn(), error: vi.fn() }`  | Componentes con notificaciones |
| `@/components/password-strength.client` | `PasswordStrengthField: () => null`            | Forms con campo de password    |

### 4. E2E test — Playwright

```ts
import { test, expect } from '@playwright/test'

test('login flow', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'user@test.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/account')
})
```

---

## Factories

Usar factories para crear datos de test consistentes:

```ts
import { createMockUser, createMockAdmin } from '../factories/user.factory'
import { createMockAddress } from '../factories/address.factory'

const user = createMockUser({ email: 'custom@test.com' })
const admin = createMockAdmin()
const address = createMockAddress({ userId: user.id })
```

---

## MSW (Mock Service Worker)

Los handlers MSW interceptan requests HTTP en tests:

```ts
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/products', () => {
    return HttpResponse.json([{ id: '1', name: 'Product' }])
  }),
]
```

Para override en un test especifico:

```ts
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

it('handles error', async () => {
  server.use(
    http.get('/api/products', () => {
      return HttpResponse.json({ error: 'Failed' }, { status: 500 })
    }),
  )
  // test error handling...
})
```

---

## Coverage

Thresholds minimos configurados en `vitest.config.ts`:

| Metrica    | Minimo |
| ---------- | ------ |
| Statements | 50%    |
| Branches   | 50%    |
| Functions  | 50%    |
| Lines      | 50%    |

Archivos excluidos del coverage: `components/ui/`, `messages/`, `db/migrations/`.

---

## Anti-patrones

- **NO testear implementacion** — testear comportamiento, no como se hace internamente
- **NO over-mockear** — mockear solo los boundaries (repos, adapters), no logica interna
- **NO testear shadcn/ui** — ya estan testeados por el equipo de Radix
- **NO tests fragiles** — no depender de selectores CSS especificos
- **NO snapshot abuse** — snapshots solo para outputs serializados estables

---

## CI Pipeline

Los tests corren automaticamente en CI:

1. **Unit + Integration + Component** — en cada push/PR
2. **Coverage** — se genera reporte (no bloquea por ahora)
3. **E2E** — solo en PRs (mas lento, requiere build)

---

_Ultima actualizacion: Marzo 2026_
