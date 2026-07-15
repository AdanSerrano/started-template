/**
 * Harness de base de datos para tests de integración.
 *
 * Levanta un Postgres real en memoria (pglite, WASM) y aplica las migraciones
 * versionadas de db/migrations. Permite testear repositorios y flujos de datos
 * contra un motor real — no mocks del query builder.
 *
 * Uso (entorno node, no jsdom):
 *   // @vitest-environment node
 *   const { db } = await createTestDb()
 */

import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import * as schema from '@/db/schema'

export type TestDb = Awaited<ReturnType<typeof createTestDb>>['db']

export async function createTestDb() {
  const client = new PGlite()
  const db = drizzle(client, { schema })
  await migrate(db, { migrationsFolder: './db/migrations' })
  return { db, client }
}
