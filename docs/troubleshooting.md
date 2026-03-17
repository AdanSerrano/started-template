# Troubleshooting — Guia de resolucion de problemas

## Errores comunes en desarrollo

### `DATABASE_URL` no configurada

**Sintoma:** La app no arranca, error "Missing critical env: DATABASE_URL"

**Solucion:**

1. Copiar `.env.example` a `.env`
2. Configurar `DATABASE_URL` con tu connection string
3. Para desarrollo local con Docker: `docker compose up -d` crea un PostgreSQL en `postgresql://postgres:postgres@localhost:5432/starter`

---

### Error de migraciones: "relation already exists"

**Sintoma:** `bun run db:push` falla con "relation X already exists"

**Solucion:**

1. Si es desarrollo local: `bun run db:reset` (borra y recrea todo)
2. Si es produccion: Usar `bun run db:migrate` en vez de `db:push`
3. Verificar que `db/migrations/` esta sincronizado con el schema

---

### `BETTER_AUTH_SECRET` invalido

**Sintoma:** Errores de autenticacion, cookies no se setean, "Invalid token"

**Solucion:**

1. Generar un secret robusto: `openssl rand -base64 32`
2. Asegurar que el secret es el MISMO en todos los entornos que comparten sesiones
3. Si cambias el secret, todas las sesiones existentes se invalidan

---

### Tailwind CSS 4 — Clases no funcionan

**Sintoma:** Estilos no se aplican, clases como `shadow-sm` o `rounded-sm` no hacen nada

**Solucion:** Tailwind 4 renombro varias clases:
| Antes (TW3) | Ahora (TW4) |
|---|---|
| `shadow-sm` | `shadow-xs` |
| `rounded-sm` | `rounded-xs` |
| `outline-none` | `outline-hidden` |
| `ring` | `ring-3` |
| `flex-grow` | `grow` |

---

### Zod 4 — `message` no funciona en refine

**Sintoma:** Mensajes de validacion custom no aparecen

**Solucion:** Zod 4 usa `error` en vez de `message`:

```ts
// INCORRECTO (Zod 3)
z.string().refine(fn, { message: 'Required' })

// CORRECTO (Zod 4)
z.string().refine(fn, { error: 'Required' })
```

---

### Imports relativos rompen en produccion

**Sintoma:** `Module not found: Can't resolve '../../../lib/utils'`

**Solucion:** Usar SIEMPRE path aliases:

```ts
// INCORRECTO
import { cn } from '../../../lib/utils'

// CORRECTO
import { cn } from '@/lib/utils'
```

---

### Emails no se envian en desarrollo

**Sintoma:** Registro funciona pero no llega email de verificacion

**Solucion:**

1. Verificar `RESEND_API_KEY` en `.env`
2. En desarrollo sin API key, los emails se loggean en consola
3. Verificar dominio verificado en Resend dashboard
4. Usar `bun run email:preview` (puerto 3001) para preview visual

---

### Rate limit bloquea en desarrollo

**Sintoma:** "Too many requests" despues de varios intentos rapidos

**Solucion:**

1. El rate limiter es in-memory, se reinicia al reiniciar el server
2. Reiniciar `bun run dev` para limpiar el store
3. En tests, usar `resetRateLimit(key)` para limpiar

---

## Errores en CI/CD

### Build falla en CI pero funciona local

**Causas comunes:**

1. Env vars faltantes en GitHub Secrets (DATABASE_URL, BETTER_AUTH_SECRET, etc.)
2. Dependencias no instaladas: verificar `bun.lock` esta commiteado
3. Cache corrupta: borrar cache en GitHub Actions settings

---

### E2E tests fallan en CI

**Causas comunes:**

1. Base de datos no accesible desde CI (verificar DATABASE_URL secret)
2. Timeouts: CI es mas lento que local, aumentar timeouts en playwright.config.ts
3. Browser issues: verificar que chromium y firefox se instalan correctamente
4. Puerto ocupado: asegurar que port 3000 esta disponible

**Debug:**

1. Descargar el artifact `playwright-report` del workflow fallido
2. Abrir `index.html` del reporte para ver screenshots y traces

---

### `bun run knip` reporta falsos positivos

**Sintoma:** knip marca como "dead code" archivos que si se usan

**Solucion:**

1. Agregar excepciones en `knip.json`
2. Verificar que los exports son usados (no solo definidos)
3. Verificar barrel exports en `index.ts`

---

### TypeScript: "Cannot find module" en tests

**Sintoma:** Tests fallan con errores de importacion

**Solucion:**

1. Verificar que `tests/tsconfig.json` extiende el root
2. Verificar path aliases en `vitest.config.ts`
3. Ejecutar `bun run type-check` para verificar tipos globalmente

---

## Errores en produccion

### Performance degradada

**Diagnostico:**

1. Verificar `/api/health` — si database latency > 100ms, es cuello de botella de DB
2. Revisar bundle size: `du -sh .next/static/` — deberia ser < 500KB
3. Verificar ISR: paginas publicas deberian tener `revalidate` configurado
4. Usar Vercel Analytics para identificar paginas lentas

---

### Sesiones se pierden

**Causas:**

1. `BETTER_AUTH_SECRET` cambio entre deploys
2. Cookie domain misconfigured (verificar `NEXT_PUBLIC_APP_URL`)
3. HTTPS requerido en produccion para cookies secure
4. Cache de sesion expiro (2 min por defecto en `getServerSession`)

---

### 503 en health check

**Significado:** Base de datos o servicio critico no responde

**Diagnostico:**

1. Verificar connection string de base de datos
2. Verificar que el pool de conexiones no esta agotado
3. Revisar logs de Sentry para errores de conexion
4. En Neon: verificar que el proyecto no esta en sleep mode

---

## Comandos utiles para debug

```bash
# Verificar conexion a DB
bun run db:studio

# Ver logs estructurados en desarrollo
bun run dev 2>&1 | jq '.'

# Verificar variables de entorno
bun run env:check  # (si existe) o revisar lib/env.ts logs

# Limpiar cache de Next.js
rm -rf .next

# Reinstalar dependencias
rm -rf node_modules && bun install

# Verificar health
curl -s http://localhost:3000/api/health | jq '.'
```

---

_Ultima actualizacion: Marzo 2026_
