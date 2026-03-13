# Starter Template

Plantilla full-stack para proyectos web modernos con Next.js 16, React 19, TypeScript, Tailwind CSS 4 y mas.

## Stack

- **Framework:** Next.js 16 + React 19 + TypeScript
- **Estilos:** Tailwind CSS 4 + shadcn/ui
- **Base de datos:** PostgreSQL (Neon) + Drizzle ORM
- **Autenticacion:** Better Auth (OAuth, magic links, 2FA)
- **Email:** Resend + React Email
- **Storage:** Cloudflare R2
- **i18n:** next-intl (ES/EN/CA)
- **CI/CD:** GitHub Actions + Bun

## Quick Start

```bash
# Instalar dependencias
bun install

# Copiar variables de entorno
cp .env.example .env

# Generar esquemas de base de datos
bun run db:generate

# Aplicar migraciones
bun run db:push

# Iniciar servidor de desarrollo
bun run dev
```

## Estructura

```
├── app/[locale]/       # Paginas (thin, con loading.tsx)
├── modules/            # Modulos de dominio (auth, account)
├── components/         # UI (shadcn/ui) + forms (40+ campos)
├── lib/                # Interfaces, adapters, providers
├── db/schema/          # Schemas Drizzle
├── messages/           # Traducciones (es/en/ca)
└── emails/             # Plantillas React Email
```

## Arquitectura

```
Page → Action → Service → Repository → Database
```

- **Adapters pattern:** libs externas solo en `lib/adapters/`
- **Providers factory:** instancias singleton via `lib/providers.ts`
- **Server Components** por defecto
- **React Hook Form + Zod** para formularios

## Scripts

| Script                | Descripcion            |
| --------------------- | ---------------------- |
| `bun run dev`         | Servidor de desarrollo |
| `bun run build`       | Build de produccion    |
| `bun run lint`        | Linter                 |
| `bun run format`      | Formatear codigo       |
| `bun run db:generate` | Generar migraciones    |
| `bun run db:push`     | Aplicar migraciones    |
| `bun run db:studio`   | Drizzle Studio         |
| `bun run type-check`  | Verificar tipos        |

## Documentacion

Ver `docs/` para documentacion detallada de arquitectura, patrones y convenciones.
