# Catalog — piezas opcionales on-demand

El starter aspira a ser **lo más completo posible** sin que cada proyecto derivado
pague (type-check, knip, bundle, `node_modules`) por lo que no usa. La solución es
un **catálogo**: las piezas opcionales viven en `catalog/`, fuera del árbol activo,
y se reincorporan con un comando cuando un proyecto las necesita.

## Qué hay en el catálogo

| Tipo         | Carpeta             | Comando                      | Contenido                                             |
| ------------ | ------------------- | ---------------------------- | ----------------------------------------------------- |
| **Dialects** | `catalog/dialects/` | `bun run add:dialect <name>` | mysql, sqlite, turso, singlestore (pg es core)        |
| **Adapters** | `catalog/adapters/` | `bun run add:adapter <name>` | export/import, analytics, search, webhooks, etc. (13) |
| **Fields**   | `catalog/fields/`   | `bun run add:field <name>`   | campos de formulario especializados (36)              |

```bash
bun run catalog:list            # lista todo el catálogo
bun run catalog:list adapter    # solo un tipo
```

## Cómo funciona el aislamiento

- `tsconfig.json` excluye `catalog/` → no entra en `type-check`.
- `knip.json` ignora `catalog/**` → no se reporta como código muerto.
- `vitest.config.ts` excluye `catalog` → sus tests no corren ni cuentan en coverage.
- Las **dependencias npm** que solo usaban piezas de catálogo se sacaron de
  `package.json`. Cada pieza declara las suyas en su `catalog.json` y el generador
  las instala al añadirla.

Resultado: el core arranca ligero (pasa knip/type-check/Lighthouse sin arrastrar lo
que no usa) pero **nada se ha perdido** — todo es reincorporable en una línea.

## Añadir una pieza a tu proyecto

```bash
bun run add:adapter xlsx-export
#  + lib/adapters/xlsx-export.ts
#  ↓ bun add exceljs
#  Siguiente paso: re-exporta { XLSXExportService } en lib/adapters/index.ts
#                  y wirea su provider en lib/providers-extended.ts
```

Flags:

- `--force` — sobrescribe si el archivo destino ya existe.
- `--no-install` — copia los archivos pero no ejecuta `bun add`.

El generador copia los archivos a su ruta destino e instala las deps. El **wiring**
(re-export en el barrel + provider) no se automatiza: se imprime como paso final,
porque editar esos archivos a ciegas es frágil. Para fields no hay wiring: se
importan directamente con `@/components/forms/form-<name>-field`.

### Dialects — paso extra

Un dialecto no es solo copiar el helper: cambiar de motor implica editar
`db/dialect/index.ts` (`export * from './<name>'`) y el driver en `lib/db.ts`.
El generador trae el archivo; la migración completa está en `docs/database.md`.

## Qué está en el core (siempre disponible)

- **Interfaces:** todas (`lib/interfaces/`). El contrato siempre existe; el catálogo
  solo aporta implementaciones.
- **Adapters:** auth, email, storage, jobs, http (fetch), cache (memoria),
  rate-limit (memoria), logger (pino), gdpr.
- **Dialect:** pg.
- **Form fields:** text, textarea, password, number, url, select, multi-select,
  checkbox, switch, radio, date, file, avatar + primitivos (section, actions,
  submit, skeleton, alert, validation-summary, step-indicator, i18n-tabs).

## Crear una pieza nueva de catálogo

1. Crea `catalog/<type>s/<name>/`.
2. Mueve ahí el código (y tests).
3. Escribe `catalog.json` (esquema en `catalog/README.md`).

Queda disponible al instante en `bun run catalog:list`. Así el catálogo crece sin
tocar el peso del core: el starter puede ser **lo más completo posible** indefinidamente.
