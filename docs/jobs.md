# Background Jobs — Trigger.dev

> Guia para implementar tareas asincronas y programadas usando Trigger.dev v4.
> Siempre usar via el adapter `IJobsService` — nunca importar Trigger.dev directamente.

---

## Arquitectura

```
Action/Service → IJobsService (interface) → TriggerJobsAdapter (adapter) → Trigger.dev
```

El proyecto usa el patron de adapters para background jobs. Esto permite cambiar Trigger.dev por BullMQ, Inngest, o cualquier otro provider sin tocar la logica de negocio.

---

## Interface — `lib/interfaces/jobs.interface.ts`

```ts
interface IJobsService {
  enqueue<T, R>(
    taskName: string,
    payload: T,
    options?: JobOptions,
  ): Promise<JobResult<R>>
  getStatus<R>(jobId: string): Promise<JobResult<R>>
  cancel(jobId: string): Promise<boolean>
  schedule<T, R>(
    taskName: string,
    payload: T,
    runAt: Date,
    options?: JobOptions,
  ): Promise<JobResult<R>>
}

// Opciones
interface JobOptions {
  delay?: number // Retraso antes de ejecutar (ms)
  maxRetries?: number // Reintentos maximos
  idempotencyKey?: string // Evitar duplicados
  metadata?: Record<string, unknown>
}

// Estados
type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
```

---

## Uso desde Services

```ts
import { getJobsService } from '@/lib/providers'

// Encolar job inmediato
const job = await getJobsService().enqueue('send-welcome-email', {
  userId: user.id,
  locale: 'es',
})

// Programar job para una fecha
await getJobsService().schedule('send-reminder', { userId }, reminderDate, {
  idempotencyKey: `reminder:${userId}:${reminderDate.toISOString()}`,
})

// Encolar con retraso
await getJobsService().enqueue(
  'process-export',
  { exportId },
  {
    delay: 5000, // 5 segundos
    maxRetries: 3,
  },
)

// Consultar estado
const status = await getJobsService().getStatus(job.id)
if (status.status === 'failed') {
  logger.error('Job failed', { jobId: job.id, error: status.error })
}
```

---

## Cuando usar background jobs

| Escenario                        | Usar job? | Razon                                |
| -------------------------------- | --------- | ------------------------------------ |
| Enviar email de bienvenida       | Si        | No bloquear la respuesta al usuario  |
| Exportar datos a CSV/XLSX        | Si        | Proceso pesado que puede tardar      |
| Procesar imagen/thumbnail        | Si        | CPU-intensive                        |
| Limpiar datos expirados          | Si        | Tarea programada (cron)              |
| Actualizar perfil                | No        | Rapido, feedback inmediato necesario |
| Validar formulario               | No        | Debe ser sincrono                    |
| Sincronizar con servicio externo | Si        | Puede fallar, necesita retry         |

---

## Patrones

### Idempotencia

Siempre usar `idempotencyKey` para evitar duplicados cuando el mismo job puede encolarse multiples veces:

```ts
await getJobsService().enqueue('send-notification', payload, {
  idempotencyKey: `notification:${userId}:${eventId}`,
})
```

### Retry con backoff

```ts
await getJobsService().enqueue('sync-external', payload, {
  maxRetries: 3, // El adapter implementa backoff exponencial
})
```

### Error handling

Los jobs que fallan despues de todos los reintentos deben:

1. Loggear el error con contexto completo
2. Notificar al equipo (si es critico)
3. NO lanzar excepciones no capturadas

---

## Reglas

- **NUNCA importar Trigger.dev directamente** — usar `getJobsService()` via provider
- **Idempotencia siempre** — los jobs pueden ejecutarse mas de una vez
- **Payload serializable** — solo datos JSON (no funciones, no clases)
- **Logging** — loggear inicio, fin y errores de cada job
- **Timeout** — definir timeout razonable para evitar jobs eternos

---

## Documentacion oficial

- Trigger.dev v4: https://trigger.dev/docs
