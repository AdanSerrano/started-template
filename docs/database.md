# Database — Starter App

> PostgreSQL (Neon) + Drizzle ORM. Guia de schemas, migraciones y transacciones.

---

## Stack

| Componente    | Tecnologia                      |
| ------------- | ------------------------------- |
| Base de datos | PostgreSQL (Neon Serverless)    |
| ORM           | Drizzle ORM                     |
| Migraciones   | drizzle-kit                     |
| Pool          | `@neondatabase/serverless` + ws |
| Tipos         | Inferencia automatica de schema |

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
import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core'

export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('product_name_idx').on(table.name)],
)
```

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

_Starter App (c) 2026_
