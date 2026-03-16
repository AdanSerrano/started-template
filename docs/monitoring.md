# Monitoring — Observabilidad

## Arquitectura de logging

```
Request → middleware → [requestId generado]
  → action/service → logger.info('...', { requestId })
  → repository → logger.debug('query', { requestId })
  → response
```

### Logger providers

| Provider        | Uso        | Output                     |
| --------------- | ---------- | -------------------------- |
| `ConsoleLogger` | Desarrollo | JSON a console             |
| `PinoLogger`    | Produccion | JSON estructurado con pino |

Cambiar en `lib/providers.ts`:

```ts
import { PinoLogger } from '@/lib/adapters'
setLoggerInstance(new PinoLogger())
```

### Request ID tracking

```ts
import {
  withRequestContext,
  generateRequestId,
  getRequestId,
} from '@/lib/request-context'

// En middleware o al inicio del request
withRequestContext({ requestId: generateRequestId() }, () => {
  // Todos los logs dentro incluyen requestId automaticamente
  logger.info('Processing request') // { requestId: "a1b2c3d4", ... }
})
```

---

## Error monitoring

### Sentry (recomendado)

Configurar `SENTRY_DSN` en env vars. Se inicializa automaticamente en `instrumentation.ts`.

```env
SENTRY_DSN=https://xxx@sentry.io/yyy
SENTRY_TRACES_SAMPLE_RATE=0.1
```

El adapter en `lib/adapters/sentry-monitoring.ts`:

- Captura excepciones con contexto
- Captura mensajes con nivel de severidad
- Setea usuario para asociar errores

### Uso en services

```ts
import { getErrorMonitoring } from '@/lib/providers'

const monitoring = getErrorMonitoring()

try {
  await riskyOperation()
} catch (error) {
  monitoring.captureException(error as Error, {
    operation: 'riskyOperation',
    userId,
  })
  throw error
}
```

---

## Health check

`GET /api/health` retorna el estado de todos los servicios:

```json
{
  "status": "healthy",
  "services": {
    "database": { "status": "up", "latencyMs": 5 },
    "redis": { "status": "up", "latencyMs": 3 }
  },
  "timestamp": "2026-03-16T10:00:00Z",
  "uptime": 3600,
  "version": "0.1.0"
}
```

| Status      | HTTP | Significado                  |
| ----------- | ---- | ---------------------------- |
| `healthy`   | 200  | Todos los servicios UP       |
| `degraded`  | 503  | Algun servicio con problemas |
| `unhealthy` | 503  | Servicio critico DOWN        |

---

## Niveles de log

| Nivel   | Cuando usar                          | Ejemplo                                              |
| ------- | ------------------------------------ | ---------------------------------------------------- |
| `debug` | Detalle tecnico, queries, cache hits | `logger.debug('Cache hit', { key })`                 |
| `info`  | Operaciones normales completadas     | `logger.info('User created', { userId })`            |
| `warn`  | Algo inesperado pero recuperable     | `logger.warn('Rate limit near', { remaining })`      |
| `error` | Fallo que requiere atencion          | `logger.error('Payment failed', error, { orderId })` |

### Regla: NO loggear datos sensibles

```ts
// CORRECTO
logger.info('User authenticated', { userId: user.id })

// PROHIBIDO
logger.info('User authenticated', { email: user.email, token: session.token })
```

---

## Audit logs vs Application logs

| Audit log                 | Application log           |
| ------------------------- | ------------------------- |
| `createAuditLog()`        | `logger.info()`           |
| Persistido en DB          | Output a stdout/Sentry    |
| Para compliance/seguridad | Para debugging/monitoring |
| Quien hizo que, cuando    | Que paso en el sistema    |

---

## Instrumentacion (Next.js)

`instrumentation.ts` captura errores de rendering:

- Errores en Server Components
- Errores en API routes
- Errores en middleware

Los errores se envian a Sentry automaticamente si `SENTRY_DSN` esta configurado.

---

## Recomendaciones para produccion

1. **Sentry** — Configurar `SENTRY_DSN` para error tracking
2. **PinoLogger** — Activar para logs JSON estructurados
3. **Request IDs** — Propagar en middleware para correlacionar logs
4. **Health check** — Monitorear `/api/health` con uptime service
5. **Alertas** — Configurar en Sentry: error rate, new issues
6. **Dashboards** — Vercel Analytics para Web Vitals

---

_Ultima actualizacion: Marzo 2026_
