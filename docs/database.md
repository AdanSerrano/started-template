# Database — Starter App

> Multi-dialect database layer con Drizzle ORM. Soporta PostgreSQL, MySQL, SQLite, Turso y SingleStore.

---

## Stack

| Componente    | Tecnologia                                              |
| ------------- | ------------------------------------------------------- |
| Base de datos | PostgreSQL (default), MySQL, SQLite, Turso, SingleStore |
| ORM           | Drizzle ORM                                             |
| Migraciones   | drizzle-kit                                             |
| Abstraccion   | `db/dialect/` — capa de dialectos normalizados          |
| Tipos         | Inferencia automatica de schema                         |

---

## Conexion (`lib/db.ts`)

```typescript
import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 10, // Conexiones maximas
  idleTimeoutMillis: 30000, // 30s idle antes de cerrar
  connectionTimeoutMillis: 10000,
})

export const db = drizzle(pool, { schema })
```

---

## Agregar una tabla nueva

### 1. Crear schema

```typescript
// db/schema/products.ts
import {
  createTable,
  primaryId,
  varchar,
  index,
  timestamps,
} from '@/db/dialect'

export const products = createTable(
  'products',
  {
    id: primaryId('id'),
    name: varchar('name', { length: 255 }).notNull(),
    ...timestamps(),
  },
  (table) => [index('product_name_idx').on(table.name)],
)
```

> **IMPORTANTE:** Siempre importar de `@/db/dialect`, NUNCA de `drizzle-orm/pg-core` directamente.

### 2. Exportar en `db/schema/index.ts`

```typescript
export * from './products'
```

### 3. Generar y aplicar migracion

```bash
bun run db:generate   # Genera SQL de migracion
bun run db:migrate    # Aplica migracion a la DB
# O para desarrollo rapido:
bun run db:push       # Push directo sin archivo de migracion
```

### 4. Verificar migracion generada

> **SIEMPRE revisa el SQL generado.** Drizzle puede generar DROP + ADD en vez de RENAME.

---

## Transacciones (`DbOrTx`) — OBLIGATORIO en operaciones multi-paso

### Regla: Si una operacion toca mas de una fila o tabla, DEBE usar `db.transaction()`

Sin transaccion, si el paso 2 falla, el paso 1 ya se ejecuto y la DB queda inconsistente.

### Patron 1: Service orquesta la transaccion

```typescript
// services/account-service.ts — CORRECTO
import { db } from '@/lib/db'

export async function createAddress(data: AddressInsert) {
  if (data.isDefault) {
    // Dos operaciones → transaccion obligatoria
    return db.transaction(async (tx) => {
      const address = await addressRepository.create(data, tx)
      if (address) {
        await addressRepository.setDefault(address.id, data.userId, tx)
      }
      return address
    })
  }
  // Una sola operacion → no necesita transaccion
  return addressRepository.create(data)
}
```

### Patron 2: Repository envuelve operaciones internas

```typescript
// repositories/address-repository.ts — CORRECTO
async setDefault(id: string, userId: string, tx?: DbOrTx) {
  const run = async (client: DbOrTx) => {
    await client.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId))
    const [address] = await client.update(addresses).set({ isDefault: true }).where(...)
    return address ?? null
  }

  // Si ya viene dentro de una transaccion, reusar; si no, crear una nueva
  if (tx) return run(tx)
  return db.transaction(async (newTx) => run(newTx))
}
```

### Patron 3: Repository acepta `tx?` en mutaciones

```typescript
// OBLIGATORIO: toda mutacion en repository acepta tx opcional
export interface IProductRepository {
  create(data: ProductInsert, tx?: DbOrTx): Promise<Product>
  update(
    id: string,
    data: Partial<Product>,
    tx?: DbOrTx,
  ): Promise<Product | null>
  remove(id: string, tx?: DbOrTx): Promise<boolean>
  // Reads NO necesitan tx
  findById(id: string): Promise<Product | null>
}
```

### Cuando usar transaccion

| Escenario                           | Transaccion? | Ejemplo                            |
| ----------------------------------- | ------------ | ---------------------------------- |
| Insert/update una sola fila         | NO           | `create(data)`                     |
| Read sin mutacion                   | NO           | `findById(id)`                     |
| Dos updates que deben ser atomicos  | **SI**       | `unsetDefault` + `setDefault`      |
| Insert + insert relacionado         | **SI**       | `createOrder` + `createOrderItems` |
| Update condicional (check + update) | **SI**       | `checkStock` + `decrementStock`    |
| Delete cascada manual               | **SI**       | `deleteUser` + `deleteAddresses`   |

### Anti-patron: operaciones separadas sin transaccion

```typescript
// PROHIBIDO — race condition si otra request modifica entre ambas
if (data.isDefault) {
  await addressRepository.setDefault(id, userId) // paso 1 ✗
}
return addressRepository.update(id, userId, data) // paso 2 ✗

// CORRECTO — atomico
if (data.isDefault) {
  return db.transaction(async (tx) => {
    await addressRepository.setDefault(id, userId, tx) // paso 1 ✓
    return addressRepository.update(id, userId, data, tx) // paso 2 ✓
  })
}
```

---

## Prepared Statements

> Compilar SQL una vez, reutilizar N veces. Usar en queries frecuentes.

```typescript
const findByIdPrepared = db
  .select()
  .from(products)
  .where(eq(products.id, sql.placeholder('id')))
  .prepare('product_find_by_id')

// Se ejecuta sin recompilar SQL
const product = await findByIdPrepared.execute({ id })
```

**NO usar prepare en:** queries dinamicos, mutaciones con `tx?`.

---

## Indexes — OBLIGATORIO en FK y queries frecuentes

Drizzle NO crea indexes automaticos en foreign keys.

```typescript
// SIEMPRE agregar index en FK y columnas frecuentemente filtradas
;(table) => [
  index('product_category_idx').on(table.categoryId), // FK
  index('product_status_idx').on(table.status), // Filtro frecuente
  index('product_created_idx').on(table.createdAt), // Ordenamiento
]
```

---

## Seeds (`db/seed.ts`)

```bash
bun run db:seed
```

Tips:

- Usar `onConflictDoNothing()` para seeds idempotentes
- Mantener datos minimos — solo lo necesario para desarrollo
- Agrupar seeds con comentarios

---

## Scripts disponibles

| Script        | Accion                                    |
| ------------- | ----------------------------------------- |
| `db:generate` | Genera migracion SQL desde cambios schema |
| `db:push`     | Push directo a DB (sin archivo migracion) |
| `db:migrate`  | Aplica migraciones pendientes             |
| `db:studio`   | Abre Drizzle Studio (GUI de DB)           |
| `db:seed`     | Ejecuta seed script                       |

---

## Cambiar dialecto de base de datos

El proyecto soporta **5 dialectos** via la capa de abstraccion `db/dialect/`. Los schemas se escriben UNA vez y funcionan en cualquier dialecto.

### Dialectos disponibles

| Dialecto        | Archivo                     | drizzle-kit dialect | Proveedores compatibles                   |
| --------------- | --------------------------- | ------------------- | ----------------------------------------- |
| **PostgreSQL**  | `db/dialect/pg.ts`          | `postgresql`        | Neon, Supabase, CockroachDB, standard PG  |
| **MySQL**       | `db/dialect/mysql.ts`       | `mysql`             | MySQL 5.7+, MariaDB 10.5+                 |
| **SQLite**      | `db/dialect/sqlite.ts`      | `sqlite`            | better-sqlite3, Bun SQLite, Cloudflare D1 |
| **Turso**       | `db/dialect/turso.ts`       | `turso`             | Turso (cloud), libSQL local, sqld         |
| **SingleStore** | `db/dialect/singlestore.ts` | `singlestore`       | SingleStore (HTAP)                        |

### Comparativa de features por dialecto

| Feature                  | PostgreSQL                   | MySQL/SingleStore                     | SQLite/Turso                     |
| ------------------------ | ---------------------------- | ------------------------------------- | -------------------------------- |
| UUID nativo              | `uuid` + `gen_random_uuid()` | `varchar(36)` + `crypto.randomUUID()` | `text` + `crypto.randomUUID()`   |
| JSON                     | `jsonb` (binary, indexable)  | `json` (nativo)                       | `text({ mode: 'json' })`         |
| Enums                    | `pgEnum` (tipo DB)           | `mysqlEnum` (inline)                  | `text.$type<>()` (solo TS)       |
| Timestamps               | `timestamp with timezone`    | `timestamp` (UTC interno)             | `integer({ mode: 'timestamp' })` |
| `.returning()`           | Si                           | **No**                                | Si                               |
| `.onConflictDoNothing()` | Si                           | **No**                                | Si                               |
| Full-text search         | `to_tsvector` + `@@`         | `MATCH...AGAINST`                     | No nativo                        |
| Transacciones            | Si                           | Si                                    | Si                               |

### Helpers normalizados (`@/db/dialect`)

Cada dialecto exporta la misma API:

| Helper           | PG                                    | MySQL/SingleStore                               | SQLite/Turso                               |
| ---------------- | ------------------------------------- | ----------------------------------------------- | ------------------------------------------ |
| `createTable()`  | `pgTable`                             | `mysqlTable` / `singlestoreTable`               | `sqliteTable`                              |
| `createEnum()`   | `pgEnum`                              | `mysqlEnum` / `singlestoreEnum`                 | `text.$type<T>()`                          |
| `primaryId()`    | `uuid().defaultRandom().primaryKey()` | `varchar(36).$default(randomUUID).primaryKey()` | `text().$default(randomUUID).primaryKey()` |
| `uuidCol()`      | `uuid()`                              | `varchar(36)`                                   | `text()`                                   |
| `jsonCol()`      | `jsonb()`                             | `json()`                                        | `text({ mode: 'json' })`                   |
| `timestampCol()` | `timestamp({ withTimezone: true })`   | `timestamp()`                                   | `integer({ mode: 'timestamp' })`           |
| `timestamps()`   | `{ createdAt, updatedAt }` con TZ     | `{ createdAt, updatedAt }`                      | `{ createdAt, updatedAt }` integer         |
| `DIALECT`        | `'postgresql'`                        | `'mysql'` / `'singlestore'`                     | `'sqlite'` / `'turso'`                     |

### Pasos para cambiar de dialecto

**Paso 1 — Cambiar el export en `db/dialect/index.ts`:**

```ts
// Cambiar esta linea:
export * from './pg'
// Por el dialecto deseado:
export * from './mysql' // MySQL / MariaDB
export * from './sqlite' // SQLite (better-sqlite3, Bun)
export * from './turso' // Turso / libSQL
export * from './singlestore' // SingleStore
```

**Paso 2 — Actualizar `lib/db.ts`:**

Descomentar la seccion del nuevo dialecto y comentar la actual. Cada dialecto tiene una seccion pre-configurada con su driver y pool.

**Paso 3 — Instalar dependencias:**

```bash
# PostgreSQL (Neon — ya instalado por default):
# @neondatabase/serverless + ws

# PostgreSQL (standard):
bun add pg && bun add -d @types/pg

# MySQL / MariaDB / SingleStore:
bun add mysql2

# PlanetScale:
bun add @planetscale/database

# SQLite (better-sqlite3):
bun add better-sqlite3 && bun add -d @types/better-sqlite3

# SQLite (Bun built-in):
# Sin dependencias — requiere runtime Bun

# Turso / libSQL:
bun add @libsql/client

# Cloudflare D1:
# Sin dependencias — usa binding D1 del worker
```

**Paso 4 — Actualizar `.env`:**

```bash
# PostgreSQL (default):
DB_DIALECT=postgresql
DATABASE_URL=postgresql://user:password@host:5432/dbname

# MySQL / MariaDB:
DB_DIALECT=mysql
DATABASE_URL=mysql://user:password@localhost:3306/dbname

# SQLite:
DB_DIALECT=sqlite
DATABASE_URL=./data/app.db

# Turso:
DB_DIALECT=turso
DATABASE_URL=libsql://my-db-user.turso.io
DATABASE_AUTH_TOKEN=your-auth-token

# SingleStore:
DB_DIALECT=singlestore
DATABASE_URL=mysql://user:password@host:3306/dbname
```

**Paso 5 — Regenerar migraciones:**

```bash
rm -rf db/migrations/  # Las migraciones son dialect-specific
bun run db:generate
bun run db:push
bun run db:seed
```

### Adaptaciones manuales por dialecto

#### MySQL / SingleStore — `.returning()` no disponible

Reemplazar con select-after-mutate en repositories:

```ts
// PG/SQLite/Turso — funciona directo:
const [row] = await client.insert(table).values(data).returning()

// MySQL/SingleStore — alternativa:
await client.insert(table).values(data)
const [row] = await client.select().from(table).where(eq(table.id, data.id))
```

#### MySQL / SingleStore — `.onConflictDoNothing()` no disponible

```ts
// PG/SQLite/Turso:
await client
  .insert(table)
  .values(data)
  .onConflictDoNothing({ target: table.id })

// MySQL/SingleStore:
await client
  .insert(table)
  .values(data)
  .onDuplicateKeyUpdate({ set: { id: sql`id` } })
```

#### Full-text search

`lib/adapters/pg-search.ts` usa `to_tsvector` (PG-specific). Para otros dialectos, crear un adapter implementando `ISearchService`:

- MySQL: `MATCH...AGAINST` con indices FULLTEXT
- SQLite: extension FTS5
- Turso: FTS5 (compatible con SQLite)
- SingleStore: `MATCH...AGAINST`

### Archivos con logica dialect-specific

| Archivo                         | Que cambiar                          |
| ------------------------------- | ------------------------------------ |
| `db/dialect/index.ts`           | Cambiar 1 linea de export            |
| `lib/db.ts`                     | Descomentar seccion del dialecto     |
| `.env`                          | `DB_DIALECT` + `DATABASE_URL`        |
| `lib/adapters/pg-search.ts`     | Crear adapter para el nuevo dialecto |
| `db/seed.ts`                    | MySQL: cambiar `onConflictDoNothing` |
| Repositories con `.returning()` | MySQL: cambiar a select-after-mutate |

### Drivers disponibles en `lib/db.ts`

| Conexion                | Driver Drizzle                       | Paquete npm                |
| ----------------------- | ------------------------------------ | -------------------------- |
| PostgreSQL (Neon)       | `drizzle-orm/neon-serverless`        | `@neondatabase/serverless` |
| PostgreSQL (standard)   | `drizzle-orm/node-postgres`          | `pg`                       |
| MySQL / MariaDB         | `drizzle-orm/mysql2`                 | `mysql2`                   |
| PlanetScale             | `drizzle-orm/planetscale-serverless` | `@planetscale/database`    |
| SQLite (better-sqlite3) | `drizzle-orm/better-sqlite3`         | `better-sqlite3`           |
| SQLite (Bun)            | `drizzle-orm/bun-sqlite`             | built-in                   |
| Turso / libSQL          | `drizzle-orm/libsql`                 | `@libsql/client`           |
| Cloudflare D1           | `drizzle-orm/d1`                     | built-in (Workers)         |
| SingleStore             | `drizzle-orm/singlestore`            | `mysql2`                   |

---

_Starter App (c) 2026_
