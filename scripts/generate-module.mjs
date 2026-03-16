#!/usr/bin/env node

/**
 * Module generator — Crea la estructura completa de un modulo.
 *
 * Usage: bun run generate:module <module-name>
 * Example: bun run generate:module products
 */

import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const moduleName = process.argv[2]

if (!moduleName) {
  console.error('Usage: bun run generate:module <module-name>')
  console.error('Example: bun run generate:module products')
  process.exit(1)
}

// Naming conventions
const kebab = moduleName.toLowerCase().replace(/[^a-z0-9]/g, '-')
const pascal = kebab.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase())
const camel = pascal.charAt(0).toLowerCase() + pascal.slice(1)

const moduleDir = join(process.cwd(), 'modules', kebab)

if (existsSync(moduleDir)) {
  console.error(`Module "${kebab}" already exists at modules/${kebab}`)
  process.exit(1)
}

// Create directories
const dirs = ['actions', 'services', 'repositories', 'components']
dirs.forEach((dir) => mkdirSync(join(moduleDir, dir), { recursive: true }))

// --- types.ts ---
writeFileSync(
  join(moduleDir, 'types.ts'),
  `// Types for ${pascal} module

export interface ${pascal} {
  id: string
  // Add your fields here
  createdAt: Date
  updatedAt: Date
}

export interface ${pascal}Insert {
  // Add insert fields here (without id, timestamps)
}
`,
)

// --- validations.ts ---
writeFileSync(
  join(moduleDir, 'validations.ts'),
  `import { z } from 'zod/v4'

type T = (key: string) => string

export function create${pascal}Schema(t: T) {
  return z.object({
    id: z.string().optional(),
    // Add your validation fields here
    // name: z.string().min(1, t('nameRequired')).max(255),
  })
}

export type ${pascal}Input = z.infer<ReturnType<typeof create${pascal}Schema>>
`,
)

// --- repositories ---
writeFileSync(
  join(moduleDir, 'repositories', `${kebab}-repository.ts`),
  `import { db, type DbOrTx } from '@/lib/db'
// import { ${camel}s } from '@/db/schema'
// import { eq } from 'drizzle-orm'
import type { ${pascal}, ${pascal}Insert } from '../types'

// -- Interface -----------------------------------------------------------

export interface I${pascal}Repository {
  findById(id: string): Promise<${pascal} | null>
  findAll(): Promise<${pascal}[]>
  create(data: ${pascal}Insert, tx?: DbOrTx): Promise<${pascal}>
  update(id: string, data: Partial<${pascal}Insert>, tx?: DbOrTx): Promise<${pascal} | null>
  remove(id: string, tx?: DbOrTx): Promise<boolean>
}

// -- Implementation ------------------------------------------------------

export const ${camel}Repository: I${pascal}Repository = {
  async findById(id: string) {
    void id // TODO: implement
    void db
    return null
  },

  async findAll() {
    return []
  },

  async create(data: ${pascal}Insert, tx?: DbOrTx) {
    const client = tx ?? db
    void client
    void data
    throw new Error('Not implemented')
  },

  async update(id: string, data: Partial<${pascal}Insert>, tx?: DbOrTx) {
    const client = tx ?? db
    void client
    void id
    void data
    return null
  },

  async remove(id: string, tx?: DbOrTx) {
    const client = tx ?? db
    void client
    void id
    return false
  },
}
`,
)

// --- services ---
writeFileSync(
  join(moduleDir, 'services', `${kebab}-service.ts`),
  `import { ${camel}Repository } from '../repositories/${kebab}-repository'
import type { ${pascal}Insert } from '../types'

export async function get${pascal}(id: string) {
  return ${camel}Repository.findById(id)
}

export async function getAll${pascal}s() {
  return ${camel}Repository.findAll()
}

export async function create${pascal}(data: ${pascal}Insert) {
  return ${camel}Repository.create(data)
}

export async function update${pascal}(id: string, data: Partial<${pascal}Insert>) {
  return ${camel}Repository.update(id, data)
}

export async function delete${pascal}(id: string) {
  return ${camel}Repository.remove(id)
}
`,
)

// --- actions ---
writeFileSync(
  join(moduleDir, 'actions', `${kebab}-actions.ts`),
  `'use server'

import { requireAuth } from '@/lib/auth-server'
import { createAuditLog } from '@/lib/audit'
import { getRequestMetadata } from '@/lib/audit-helpers'
import * as ${camel}Service from '../services/${kebab}-service'
import { create${pascal}Schema } from '../validations'
import { z } from 'zod/v4'

const passthrough = (key: string) => key
const schema = create${pascal}Schema(passthrough)

type ActionResult = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function getAll${pascal}sAction() {
  await requireAuth()
  return ${camel}Service.getAll${pascal}s()
}

export async function create${pascal}Action(data: unknown): Promise<ActionResult> {
  const session = await requireAuth()
  const metadata = await getRequestMetadata()

  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Datos invalidos',
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    }
  }

  const created = await ${camel}Service.create${pascal}(parsed.data as never)

  await createAuditLog({
    action: '${kebab}.created',
    entityType: '${kebab}',
    entityId: (created as { id: string }).id,
    userId: session.user.id,
    metadata,
  })

  return { success: true }
}

export async function delete${pascal}Action(id: string): Promise<ActionResult> {
  const session = await requireAuth()
  const metadata = await getRequestMetadata()

  await ${camel}Service.delete${pascal}(id)

  await createAuditLog({
    action: '${kebab}.deleted',
    entityType: '${kebab}',
    entityId: id,
    userId: session.user.id,
    severity: 'high',
    metadata,
  })

  return { success: true }
}
`,
)

// --- components/.gitkeep ---
writeFileSync(join(moduleDir, 'components', '.gitkeep'), '')

// Summary
console.log(`Module "${kebab}" created successfully!`)
console.log('')
console.log('Created files:')
console.log(`  modules/${kebab}/`)
console.log(`  ├── actions/${kebab}-actions.ts`)
console.log(`  ├── services/${kebab}-service.ts`)
console.log(`  ├── repositories/${kebab}-repository.ts`)
console.log(`  ├── components/`)
console.log(`  ├── types.ts`)
console.log(`  └── validations.ts`)
console.log('')
console.log('Next steps:')
console.log(`  1. Create DB schema in db/schema/${kebab}s.ts`)
console.log(`  2. Update db/schema/index.ts with the new export`)
console.log(`  3. Run "bun run db:generate" to create migration`)
console.log(`  4. Implement repository queries`)
console.log(`  5. Add routes in app/[locale]/`)
