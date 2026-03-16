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

## Transacciones (`DbOrTx`)

```typescript
import { db, type DbOrTx } from '@/lib/db'

// Repository acepta transaccion opcional
async function create(data: ProductInsert, tx?: DbOrTx) {
  const client = tx ?? db
  const [product] = await client.insert(products).values(data).returning()
  return product
}

// Service usa transaccion cuando necesita atomicidad
async function createWithInventory(data: ProductData) {
  return db.transaction(async (tx) => {
    const product = await productRepo.create(data.product, tx)
    await inventoryRepo.create({ productId: product.id, ...data.stock }, tx)
    return product
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
