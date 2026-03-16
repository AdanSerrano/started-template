# Security — Guia de seguridad

## OWASP Top 10 — Cobertura

| #   | Riesgo                    | Estado   | Implementacion                               |
| --- | ------------------------- | -------- | -------------------------------------------- |
| A01 | Broken Access Control     | Cubierto | `requireAuth()`, `requireRole()`, middleware |
| A02 | Cryptographic Failures    | Cubierto | Better Auth (bcrypt), HTTPS (HSTS)           |
| A03 | Injection                 | Cubierto | Drizzle ORM (prepared statements), Zod       |
| A04 | Insecure Design           | Cubierto | Arquitectura en capas, adapters pattern      |
| A05 | Security Misconfiguration | Cubierto | Security headers, env validation             |
| A06 | Vulnerable Components     | Cubierto | `bun audit` en CI                            |
| A07 | Auth Failures             | Cubierto | Rate limit, account lockout, 2FA             |
| A08 | Data Integrity Failures   | Cubierto | Zod validation, audit logs                   |
| A09 | Logging Failures          | Cubierto | Structured logging, audit trail              |
| A10 | SSRF                      | Parcial  | Adapters aislan llamadas externas            |

---

## Autenticacion

### Better Auth

- Sesiones con cookie HTTP-only
- Cache de sesion de 2 minutos
- Soporte 2FA (TOTP)
- OAuth (Google, etc.)
- Magic links (expiran en 10 min)

### Proteccion de rutas

```ts
// Server Component — requiere sesion
const session = await requireAuth()

// Requiere rol especifico
const session = await requireRole(['admin', 'super_admin'])
```

### Account lockout

- 5 intentos fallidos → cuenta bloqueada 15 minutos
- Tracking en DB (`failedLoginAttempts`, `lockedUntil`)

---

## Validacion de input

### Zod en todas las capas

```ts
// Server Action — siempre validar con Zod
const parsed = schema.safeParse(data)
if (!parsed.success) {
  return {
    success: false,
    fieldErrors: z.flattenError(parsed.error).fieldErrors,
  }
}
```

### Sanitizacion

- **DOMPurify** — Para rich text y markdown
- **React** — Escapa HTML por defecto en JSX
- **Drizzle** — Prepared statements previenen SQL injection

---

## Security headers

Configurados en `next.config.ts`:

| Header                   | Valor                             | Protege contra       |
| ------------------------ | --------------------------------- | -------------------- |
| `X-Content-Type-Options` | `nosniff`                         | MIME sniffing        |
| `X-Frame-Options`        | `DENY`                            | Clickjacking         |
| `Referrer-Policy`        | `strict-origin-when-cross-origin` | Info leak            |
| `Permissions-Policy`     | `camera=(), microphone=()`        | API abuse            |
| `COOP`                   | `same-origin`                     | Cross-origin attacks |
| `HSTS`                   | `max-age=63072000` (solo prod)    | Downgrade attacks    |
| `CSP`                    | `default-src 'self'` + reglas     | XSS, injection       |

### Content Security Policy

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'strict-dynamic' googletagmanager.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https:;
connect-src 'self' google-analytics.com googletagmanager.com;
object-src 'none';
base-uri 'self';
```

---

## Rate limiting

### In-memory (desarrollo)

```ts
import { getRateLimitService } from '@/lib/providers'

const result = await getRateLimitService().check('login:192.168.1.1', {
  limit: 5,
  windowSeconds: 300,
})
```

### Distribuido (produccion)

Configurar Upstash Redis:

```env
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

Cambiar provider:

```ts
import { UpstashRateLimitService } from '@/lib/adapters'
setRateLimitService(new UpstashRateLimitService())
```

**Fail-open**: si Redis no responde, permite el request (disponibilidad > seguridad).

---

## CORS

Helper en `lib/cors.ts` para API routes:

```ts
import { corsHeaders, handleCorsPreflight } from '@/lib/cors'

export function OPTIONS(request: Request) {
  return handleCorsPreflight(request)
}

export function GET() {
  return Response.json(data, { headers: corsHeaders(origin) })
}
```

Configurar origenes permitidos:

```env
CORS_ALLOWED_ORIGINS=https://miapp.com,https://admin.miapp.com
```

---

## File upload validation

```ts
import { validateFile } from '@/lib/upload-validation'

const result = await validateFile(file, {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ['image/jpeg', 'image/png'],
})

if (!result.valid) {
  return { error: result.error }
}
```

Incluye verificacion de magic bytes para prevenir file type spoofing.

---

## Audit logging

Todas las mutaciones DEBEN tener audit log:

```ts
await createAuditLog({
  action: 'entity.created',
  entityType: 'entity',
  entityId: entity.id,
  userId: session.user.id,
  severity: 'low', // low | medium | high | critical
  metadata: await getRequestMetadata(), // IP + User-Agent
})
```

---

## GDPR compliance

### Exportar datos del usuario

```ts
import { getGDPRService } from '@/lib/providers'

const data = await getGDPRService().exportUserData(userId)
// Retorna: perfil, direcciones, sesiones, audit logs
```

### Eliminar cuenta (derecho al olvido)

```ts
await getGDPRService().deleteUserData(userId)
// Soft delete + anonimiza PII + revoca sesiones
```

---

## Checklist de seguridad

- [ ] `BETTER_AUTH_SECRET` unico por entorno (min 32 chars)
- [ ] `DATABASE_URL` con SSL (`?sslmode=require`)
- [ ] Rate limiting activo en login/register
- [ ] 2FA habilitado para admin users
- [ ] `bun audit` sin vulnerabilidades criticas
- [ ] Security headers configurados
- [ ] No secrets hardcodeados en codigo
- [ ] Audit logs en todas las mutaciones

---

_Ultima actualizacion: Marzo 2026_
