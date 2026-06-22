#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Catalog generator — Reincorpora piezas opcionales (dialects, adapters, fields)
 * desde `catalog/` al arbol activo del proyecto, bajo demanda.
 *
 * El catalogo mantiene el starter "lo mas completo posible" sin que cada proyecto
 * pague (type-check, knip, bundle) por lo que no usa. Cada pieza vive en
 * `catalog/<type>s/<name>/` con un `catalog.json` que declara sus archivos,
 * dependencias npm y notas de post-instalacion.
 *
 * Usage:
 *   bun run catalog list [type]            # lista lo disponible
 *   bun run add:dialect <name>             # = catalog add dialect <name>
 *   bun run add:adapter <name>
 *   bun run add:field <name>
 *
 * Flags:
 *   --force        sobrescribe archivos existentes
 *   --no-install   no ejecuta `bun add` de las deps declaradas
 */

import { execFileSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
} from 'node:fs'
import { dirname, join } from 'node:path'

const ROOT = process.cwd()
const CATALOG = join(ROOT, 'catalog')
const TYPES = ['dialect', 'adapter', 'field']
const dirOf = (type) => join(CATALOG, `${type}s`)

const args = process.argv.slice(2)
const flags = new Set(args.filter((a) => a.startsWith('--')))
const positional = args.filter((a) => !a.startsWith('--'))

function readManifest(type, name) {
  const file = join(dirOf(type), name, 'catalog.json')
  if (!existsSync(file)) return null
  return JSON.parse(readFileSync(file, 'utf8'))
}

function listType(type) {
  const base = dirOf(type)
  if (!existsSync(base)) return []
  return readdirSync(base, { withFileTypes: true })
    .filter(
      (d) => d.isDirectory() && existsSync(join(base, d.name, 'catalog.json')),
    )
    .map((d) => readManifest(type, d.name))
    .filter(Boolean)
}

function list(only) {
  const types = only ? [only] : TYPES
  for (const type of types) {
    const items = listType(type)
    console.log(
      `\n${type.toUpperCase()}S (${items.length}) — bun run add:${type} <name>`,
    )
    if (!items.length) {
      console.log('  (vacio)')
      continue
    }
    for (const m of items) {
      console.log(`  ${m.name.padEnd(22)} ${m.description ?? ''}`)
    }
  }
  console.log('')
}

function copyEntries(itemDir, entries, label) {
  for (const [from, to] of entries ?? []) {
    const src = join(itemDir, from)
    const dest = join(ROOT, to)
    if (!existsSync(src)) {
      console.error(`  ✗ falta en el catalogo: ${from}`)
      process.exit(1)
    }
    if (existsSync(dest) && !flags.has('--force')) {
      console.error(`  ✗ ya existe (usa --force): ${to}`)
      process.exit(1)
    }
    mkdirSync(dirname(dest), { recursive: true })
    cpSync(src, dest, { recursive: true })
    console.log(`  + ${label}: ${to}`)
  }
}

function add(type, name) {
  if (!TYPES.includes(type)) {
    console.error(`Tipo invalido: ${type}. Validos: ${TYPES.join(', ')}`)
    process.exit(1)
  }
  const manifest = readManifest(type, name)
  if (!manifest) {
    console.error(`No existe el ${type} "${name}" en el catalogo.`)
    console.error(`Disponibles:`)
    list(type)
    process.exit(1)
  }
  const itemDir = join(dirOf(type), name)
  console.log(`\nAñadiendo ${type} "${name}"...`)

  copyEntries(itemDir, manifest.files, 'archivo')
  copyEntries(itemDir, manifest.tests, 'test')

  const deps = manifest.npmDeps ?? []
  if (deps.length && !flags.has('--no-install')) {
    console.log(`  ↓ instalando: ${deps.join(' ')}`)
    execFileSync('bun', ['add', ...deps], { stdio: 'inherit' })
  } else if (deps.length) {
    console.log(`  ⚠ deps a instalar manualmente: bun add ${deps.join(' ')}`)
  }

  if (manifest.notes) {
    console.log(
      `\n  Siguiente paso:\n  ${manifest.notes.replace(/\n/g, '\n  ')}`,
    )
  }
  console.log(`\n✓ ${type} "${name}" añadido.\n`)
}

const [command, ...rest] = positional

if (command === 'list') {
  list(rest[0])
} else if (command === 'add') {
  const [type, name] = rest
  if (!type || !name) {
    console.error('Usage: catalog add <type> <name>')
    process.exit(1)
  }
  add(type, name)
} else {
  console.error('Comandos: list [type] | add <type> <name>')
  console.error('Atajos:   bun run add:dialect|add:adapter|add:field <name>')
  process.exit(1)
}
