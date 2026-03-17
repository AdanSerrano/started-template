# Deployment — Guia de despliegue

## Opciones de despliegue

### 1. Vercel (Recomendado)

Zero-config. Conectar el repo y configurar env vars.

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel
```

**Env vars requeridas en Vercel:**

- `DATABASE_URL` — Connection string de Neon
- `BETTER_AUTH_SECRET` — Secret de 32+ caracteres
- `NEXT_PUBLIC_APP_URL` — URL del dominio (https://tu-app.vercel.app)
- `RESEND_API_KEY` — API key de Resend

### 2. Docker

```bash
# Build y deploy con docker-compose
docker compose -f docker-compose.prod.yml up -d --build

# Ver logs
docker compose -f docker-compose.prod.yml logs -f app
```

**Requisitos:**

- Docker y Docker Compose instalados
- Archivo `.env` con todas las variables configuradas
- `POSTGRES_PASSWORD` definido (requerido por docker-compose.prod.yml)

### 3. Node.js Standalone

```bash
# Build
DOCKER_BUILD=1 bun run build

# La salida esta en .next/standalone/
node .next/standalone/server.js
```

---

## Variables de entorno

### Criticas (la app no arranca sin ellas)

| Variable             | Descripcion                     | Ejemplo                          |
| -------------------- | ------------------------------- | -------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string    | `postgresql://user:pass@host/db` |
| `BETTER_AUTH_SECRET` | Secret para auth (min 32 chars) | `openssl rand -base64 32`        |

### Recomendadas (warn en dev, error en prod)

| Variable              | Descripcion                   | Ejemplo             |
| --------------------- | ----------------------------- | ------------------- |
| `NEXT_PUBLIC_APP_URL` | URL publica de la app         | `https://miapp.com` |
| `RESEND_API_KEY`      | API key de Resend para emails | `re_xxxx`           |

### Opcionales

| Variable                   | Descripcion                     |
| -------------------------- | ------------------------------- |
| `GOOGLE_CLIENT_ID`         | OAuth Google                    |
| `GOOGLE_CLIENT_SECRET`     | OAuth Google                    |
| `SENTRY_DSN`               | Error monitoring                |
| `UPSTASH_REDIS_REST_URL`   | Rate limiting distribuido       |
| `UPSTASH_REDIS_REST_TOKEN` | Token de Upstash Redis          |
| `CORS_ALLOWED_ORIGINS`     | Origenes CORS (comma-separated) |

---

## Migraciones de base de datos

```bash
# Generar migracion
bun run db:generate

# Aplicar migracion (desarrollo)
bun run db:push

# Aplicar migracion (produccion)
bun run db:migrate

# Seed datos iniciales
bun run db:seed
```

### Estrategia de migracion en produccion

1. **Siempre hacer backup antes** de migrar
2. Usar `db:migrate` (no `db:push`) en produccion
3. Las migraciones son forward-only (no auto-rollback)
4. Para rollback: crear nueva migracion que revierta los cambios

---

## Pre-deployment checklist

- [ ] Todas las env vars configuradas
- [ ] `DATABASE_URL` apunta a la DB correcta
- [ ] `BETTER_AUTH_SECRET` es unico por entorno
- [ ] Migraciones aplicadas (`bun run db:migrate`)
- [ ] Build exitoso (`bun run build`)
- [ ] Tests pasan (`bun run test`)
- [ ] Type check limpio (`bun run type-check`)

## Post-deployment verificacion

- [ ] `/api/health` retorna `{ status: "healthy" }`
- [ ] Login/register funcionan
- [ ] Emails se envian correctamente
- [ ] i18n funciona (probar /es, /en, /ca)

---

## Rollback

### Vercel

- Ir a Deployments > seleccionar deploy anterior > Promote to Production

### Docker

```bash
# Volver a imagen anterior
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --pull never
```

### Base de datos

- Las migraciones NO tienen auto-rollback
- Crear nueva migracion que revierta los cambios
- O restaurar backup de la DB

---

## Monitoring post-deploy

- `/api/health` — Estado de servicios (DB, Redis)
- Sentry — Errores en tiempo real (si `SENTRY_DSN` configurado)
- Vercel Analytics — Web Vitals y rendimiento
- Logs estructurados — JSON en produccion

## Troubleshooting de deployment

### Vercel

| Problema                          | Solucion                                                                                     |
| --------------------------------- | -------------------------------------------------------------------------------------------- |
| Build falla con "env var missing" | Verificar que TODAS las env vars criticas estan en Vercel > Settings > Environment Variables |
| Build falla con "type error"      | Ejecutar `bun run type-check` local antes de push                                            |
| Funciones serverless timeout      | Verificar que queries DB tienen timeout. Considerar connection pooling (Neon)                |
| Cold starts lentos                | Reducir bundle size. Usar `serverExternalPackages` en next.config.ts para libs pesadas       |
| Preview deployments no funcionan  | Verificar que env vars estan marcadas para "Preview" environment                             |

### Docker

| Problema                   | Solucion                                                                         |
| -------------------------- | -------------------------------------------------------------------------------- |
| Container no arranca       | Verificar `.env` con todas las vars. `docker logs <container>` para errores      |
| Base de datos no accesible | Verificar network: el servicio DB debe estar en la misma docker network          |
| Build lento                | Usar multi-stage build (ya configurado en Dockerfile). Verificar `.dockerignore` |
| Out of memory en build     | Aumentar memoria del builder: `docker build --memory=4g`                         |

### Rollback de emergencia

**Procedimiento completo:**

1. **Identificar** — Verificar `/api/health` y Sentry para confirmar el problema
2. **Comunicar** — Notificar al equipo del rollback
3. **Ejecutar rollback:**
   - Vercel: Dashboard > Deployments > seleccionar deploy anterior > "Promote to Production"
   - Docker: `docker compose -f docker-compose.prod.yml down && git checkout <tag-anterior> && docker compose -f docker-compose.prod.yml up -d --build`
4. **Verificar** — Confirmar que `/api/health` retorna `healthy`
5. **Investigar** — Revisar logs y Sentry para root cause
6. **Fix forward** — Crear nuevo deploy con la correccion, no quedarse en el rollback

### Estrategia de zero-downtime deployment

1. **Blue-green** (recomendado con Vercel): El nuevo deploy se promueve solo cuando el health check pasa
2. **Migraciones backward-compatible**: Agregar columnas como nullable, nunca eliminar columnas en el mismo deploy
3. **Feature flags**: Usar `EnvFeatureFlagService` para activar features gradualmente

---

_Ultima actualizacion: Marzo 2026_
