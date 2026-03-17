# API Routes — Convenciones y Patrones

> Guia para crear y mantener API routes (`app/api/`).
> Las server actions (`createSafeAction`) son preferidas para mutaciones desde el frontend.
> Las API routes se usan para: webhooks, integraciones externas, health checks, y endpoints publicos.

---

## Cuando usar API Routes vs Server Actions

| Caso de uso                    | Usar          |
| ------------------------------ | ------------- |
| Mutacion desde UI propia       | Server Action |
| Webhook externo (Stripe, etc.) | API Route     |
| Health check / status          | API Route     |
| Integracion con servicio ext.  | API Route     |
| Endpoint publico (API publica) | API Route     |
| CRUD desde formularios         | Server Action |

---

## Estructura de un API Route

```ts
// app/api/[recurso]/route.ts
import {
  apiSuccess,
  apiError,
  apiNotFound,
  apiUnauthorized,
  apiRateLimited,
} from '@/lib/api-response'
import { requireAuth } from '@/lib/auth-server'
import { checkRateLimit } from '@/lib/rate-limit'
import { getLogger } from '@/lib/providers'
import { z } from 'zod/v4'

const logger = getLogger()

// Schema de validacion
const createItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export async function GET() {
  try {
    const session = await requireAuth()
    const items = await itemService.findByUser(session.user.id)
    return apiSuccess(items)
  } catch (error) {
    logger.error('Error fetching items', error as Error)
    return apiError('Error interno', 500)
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth()

    // Rate limiting
    const limit = checkRateLimit(`api:items:${session.user.id}`, {
      maxAttempts: 30,
      windowMs: 60_000,
    })
    if (!limit.success) {
      return apiRateLimited(Math.ceil((limit.reset - Date.now()) / 1000))
    }

    // Validacion
    const body = await req.json()
    const parsed = createItemSchema.safeParse(body)
    if (!parsed.success) {
      return apiError('Datos invalidos', 422, {
        code: 'VALIDATION_ERROR',
        details: z.flattenError(parsed.error).fieldErrors,
      })
    }

    const item = await itemService.create(session.user.id, parsed.data)
    return apiSuccess(item, { status: 201 })
  } catch (error) {
    logger.error('Error creating item', error as Error)
    return apiError('Error interno', 500)
  }
}
```

---

## Helpers de respuesta — `lib/api-response.ts`

| Helper                       | Status | Uso                               |
| ---------------------------- | ------ | --------------------------------- |
| `apiSuccess(data)`           | 200    | Respuesta exitosa con datos       |
| `apiError(msg, status)`      | N      | Error con mensaje y status custom |
| `apiNotFound(entity)`        | 404    | Recurso no encontrado             |
| `apiUnauthorized()`          | 401    | No autenticado                    |
| `apiRateLimited(retryAfter)` | 429    | Rate limit con Retry-After header |

Todas las respuestas siguen el formato:

```json
// Exito
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": "mensaje", "code": "ERROR_CODE" }
```

---

## Webhook Routes

Para webhooks de servicios externos (Stripe, Trigger.dev, etc.):

```ts
// app/api/webhooks/[service]/route.ts
export async function POST(req: Request) {
  // 1. Verificar firma/secreto del webhook
  const signature = req.headers.get('x-webhook-signature')
  if (!verifySignature(signature, await req.text())) {
    return apiUnauthorized('Firma invalida')
  }

  // 2. Procesar evento
  // 3. Retornar 200 rapido (procesar async si es pesado)
  return apiSuccess({ received: true })
}
```

**Reglas para webhooks:**

- SIEMPRE verificar la firma/secreto del servicio externo
- Responder rapido (< 5s) — encolar trabajo pesado en background jobs
- Loggear el evento recibido para debugging
- Idempotencia — manejar duplicados

---

## Proteccion

| Tipo de endpoint | Proteccion                              |
| ---------------- | --------------------------------------- |
| Privado          | `requireAuth()` + rate limit            |
| Admin            | `requireRole(['admin', 'super_admin'])` |
| Webhook          | Verificacion de firma                   |
| Publico          | Rate limit agresivo + validacion        |
| Health check     | Sin auth, sin rate limit                |

---

## Convenciones de nombrado

```
app/api/
├── health/route.ts          # GET — health check
├── auth/[...all]/route.ts   # Better Auth catch-all
├── webhooks/
│   └── stripe/route.ts      # POST — webhook de Stripe
├── export/route.ts          # GET — exportar datos
└── [modulo]/
    ├── route.ts             # GET (list), POST (create)
    └── [id]/route.ts        # GET (one), PATCH (update), DELETE
```
