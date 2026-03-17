// ╔═══════════════════════════════════════════════════════════╗
// ║  DATABASE DIALECT                                         ║
// ║  Cambiar esta linea para switch de base de datos.         ║
// ║  Ver docs/database.md para guia completa de migracion.    ║
// ║                                                            ║
// ║  Opciones disponibles:                                     ║
// ║    './pg'          — PostgreSQL (Neon, Supabase, standard) ║
// ║    './mysql'       — MySQL / MariaDB / PlanetScale / TiDB  ║
// ║    './sqlite'      — SQLite (better-sqlite3, Bun SQLite)   ║
// ║    './turso'       — Turso / libSQL                        ║
// ║    './singlestore' — SingleStore (HTAP)                    ║
// ╚═══════════════════════════════════════════════════════════╝
export * from './pg'
