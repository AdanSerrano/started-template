# Caching — Estrategia y Patrones

> Guia para implementar cache en el proyecto usando la interface `ICache`.
> Siempre usar via provider — nunca importar Redis, Upstash, o Map directamente.

---

## Arquitectura

```
Service → ICache (interface) → MemoryCacheAdapter | RedisCacheAdapter → Storage
```

El proyecto incluye dos implementaciones:

- **`memory-cache.ts`** — Cache en memoria (Map). Para desarrollo y single-instance.
- **Upstash Redis** — Para produccion multi-instance (configurar via adapter).

---

## Interface — `lib/interfaces/cache.interface.ts`

```ts
interface ICache {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>
  delete(key: string): Promise<void>
  exists(key: string): Promise<boolean>
  incr(key: string): Promise<number>
  decr(key: string): Promise<number>
  hget<T>(key: string, field: string): Promise<T | null>
  hset<T>(key: string, field: string, value: T): Promise<void>
  hgetall<T>(key: string): Promise<Record<string, T> | null>
  expire(key: string, ttlSeconds: number): Promise<void>
}
```

---

## Uso desde Services

```ts
import { getCache } from '@/lib/providers'

const cache = getCache()

// Basico: get/set con TTL
const user = await cache.get<User>(`user:${userId}`)
if (!user) {
  const freshUser = await userRepo.findById(userId)
  await cache.set(`user:${userId}`, freshUser, 300) // 5 minutos
  return freshUser
}
return user

// Contadores
await cache.incr(`views:${articleId}`)

// Hash (para objetos parciales)
await cache.hset(`session:${sessionId}`, 'lastSeen', new Date().toISOString())
const lastSeen = await cache.hget<string>(`session:${sessionId}`, 'lastSeen')

// Invalidar
await cache.delete(`user:${userId}`)
```

---

## Convencion de naming para keys

```
{entidad}:{id}                    → user:abc123
{entidad}:{id}:{campo}            → user:abc123:addresses
{modulo}:{entidad}:{accion}:{id}  → auth:session:validate:xyz
{tipo}:{recurso}:{scope}          → cache:catalog:public
```

**Reglas:**

- Siempre usar `:` como separador
- Prefijo con la entidad o modulo
- IDs completos (no truncar)
- Minusculas siempre

---

## TTL recomendados

| Tipo de dato                | TTL         | Razon                                   |
| --------------------------- | ----------- | --------------------------------------- |
| Session/auth token          | 300s (5m)   | Cookie cache de Better Auth             |
| Perfil de usuario           | 300s (5m)   | Cambia poco, lectura frecuente          |
| Catalogo/listados           | 3600s (1h)  | ISR se encarga del HTML, cache del dato |
| Configuracion/feature flags | 60s (1m)    | Debe actualizarse relativamente rapido  |
| Contadores/analytics        | 86400s (1d) | Agregados diarios                       |
| Datos que nunca cambian     | Sin TTL     | Invalidar manualmente cuando cambie     |

---

## Invalidacion

### Patron: invalidar al mutar

```ts
// En el service, despues de mutar
async updateProfile(userId: string, data: ProfileData) {
  const result = await profileRepo.update(userId, data)
  await getCache().delete(`user:${userId}`)  // Invalidar cache
  return result
}
```

### Patron: cache-aside (lazy loading)

```ts
async getProfile(userId: string) {
  const cached = await getCache().get<Profile>(`user:${userId}`)
  if (cached) return cached

  const profile = await profileRepo.findById(userId)
  if (profile) {
    await getCache().set(`user:${userId}`, profile, 300)
  }
  return profile
}
```

---

## Cuando usar cache vs ISR

| Dato                    | Usar        | Razon                             |
| ----------------------- | ----------- | --------------------------------- |
| HTML de pagina publica  | ISR         | Next.js lo maneja automaticamente |
| Datos de API interna    | ICache      | Control fino de invalidacion      |
| Session de usuario      | ICache      | Acceso rapido en cada request     |
| Resultado de query cara | ICache      | Evitar query repetida en minutos  |
| Assets estaticos        | CDN headers | No necesita cache en app          |

---

## Reglas

- **NUNCA importar Redis/Upstash directamente** — usar `getCache()` via provider
- **Siempre definir TTL** — cache sin TTL es memory leak potencial
- **Invalidar al mutar** — si cambias un dato, borra su cache
- **No cachear datos sensibles sin encriptar** — passwords, tokens, PII
- **Serializable** — solo guardar datos JSON (no instancias de clase)
- **No usar cache para estado de aplicacion** — usar Zustand o React state

---

## Documentacion oficial

- Upstash Redis: https://upstash.com/docs/redis/overall/getstarted
- Upstash Ratelimit: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
