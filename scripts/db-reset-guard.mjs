/**
 * Guard para `db:reset` — evita el borrado destructivo (`push --force`) contra
 * una base de datos de producción. Sale con código 1 si detecta un entorno prod.
 */

const nodeEnv = process.env.NODE_ENV
const url = process.env.DATABASE_URL ?? ''

// Heurística: NODE_ENV=production, o una URL que no apunta a localhost/127.0.0.1.
const looksProd =
  nodeEnv === 'production' ||
  (url !== '' && !/@(localhost|127\.0\.0\.1|db|postgres)[:/]/.test(url))

if (looksProd) {
  console.error(
    '\n✗ db:reset está BLOQUEADO: parece un entorno de producción.\n' +
      '  db:reset hace `drizzle-kit push --force` (DESTRUCTIVO).\n' +
      '  En producción usa SOLO migraciones versionadas: bun run db:migrate.\n' +
      '  Si de verdad quieres resetear, hazlo con DATABASE_URL apuntando a local.\n',
  )
  process.exit(1)
}

// eslint-disable-next-line no-console
console.log('✓ Entorno no-producción: db:reset permitido.')
