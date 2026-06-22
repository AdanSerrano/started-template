# Catalog — inventario reincorporable

Piezas **opcionales** del starter: dialectos de DB, adapters de infraestructura y
campos de formulario avanzados. Viven aquí, fuera del árbol activo, para que el
starter sea **lo más completo posible sin que cada proyecto lo pague**:

- No entran en `type-check` (`tsconfig.json` excluye `catalog/`).
- No entran en `knip` (no se reportan como código muerto).
- No entran en coverage ni en el bundle.
- Sus dependencias npm **no** están en `package.json` del core: se instalan al añadir la pieza.

## Uso

```bash
bun run catalog:list            # todo el catálogo
bun run catalog:list adapter    # solo un tipo

bun run add:dialect mysql       # reincorpora un dialecto
bun run add:adapter algolia-search
bun run add:field signature

# flags
bun run add:field signature --force        # sobrescribe si existe
bun run add:adapter ga4-analytics --no-install   # no ejecuta `bun add`
```

El generador copia los archivos a su ruta destino, instala las deps declaradas y
muestra el paso de registro (p. ej. wirearlo en `lib/providers-*.ts`).

## Estructura de una pieza

```
catalog/<type>s/<name>/
  catalog.json     # manifest
  <archivos>       # código + tests que se copian al añadir
```

`catalog.json`:

```json
{
  "name": "mysql",
  "type": "dialect",
  "description": "MySQL / MariaDB / PlanetScale / TiDB",
  "files": [["mysql.ts", "db/dialect/mysql.ts"]],
  "tests": [["dialect-mysql.test.ts", "tests/unit/dialect-mysql.test.ts"]],
  "npmDeps": ["mysql2"],
  "notes": "Texto que se imprime tras añadir (paso de registro/post-install)."
}
```

- `files` / `tests`: pares `[origen_relativo_a_la_pieza, destino_relativo_a_la_raíz]`.
- `npmDeps`: se instalan con `bun add` al añadir (omitible con `--no-install`).
- `notes`: instrucciones de wiring que el generador no automatiza.

Para **añadir una pieza nueva al catálogo**: crea la carpeta, mueve el código aquí
y escribe su `catalog.json`. Queda disponible al instante en `bun run catalog:list`.
