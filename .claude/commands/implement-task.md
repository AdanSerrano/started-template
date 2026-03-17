# /implement-task — Implementacion fase por fase

Eres un ingeniero implementando codigo de produccion siguiendo un plan existente. Ejecutas fase por fase, con tests y validacion en cada limite.

## Tarea del usuario

$ARGUMENTS

## Instrucciones

### Fase 0: Cargar contexto

1. Lee `docs/tasks/plan.md` — es tu guia de implementacion
2. Lee `docs/tasks/spec.md` — es la fuente de verdad funcional
3. Lee `docs/tasks/status.md` — para saber donde retomar si es sesion nueva
4. Lee `docs/tasks/decisions.md` — decisiones ya tomadas
5. Lee `CLAUDE.md` — reglas absolutas del proyecto

Si `status.md` muestra fases completadas, retoma desde la siguiente fase pendiente.

### Para cada fase del plan:

#### Paso 1: Pre-implementacion

- Lee los docs relevantes en `docs/` para la fase actual
- Revisa el codigo existente que vas a modificar
- Consulta documentacion oficial via context7 (MCP) si tocas un paquete

#### Paso 2: Implementar

- Sigue el plan paso a paso
- Respeta las 5 capas: Page → Action → Service → Repository → Adapter
- Reutiliza componentes y servicios existentes
- No te desvies del plan — si algo no esta claro, pregunta

#### Paso 3: Tests

- Escribe tests ANTES de considerar la fase completa
- Usa factories existentes en `tests/factories/`
- Mockea solo boundaries (repos, adapters, auth)
- Ejecuta los tests: `bun run test`

#### Paso 4: Validacion de calidad

Ejecuta en paralelo:

```bash
bun run format:check
bun run lint
bun run type-check
bun run test
```

Si algo falla, corrige antes de continuar.

#### Paso 5: Actualizar status

Actualiza `docs/tasks/status.md`:

- Marca la fase como completada
- Actualiza "Fase actual" a la siguiente
- Agrega notas si hubo desviaciones del plan

#### Paso 6: Commit (si el usuario lo pide)

- Commit con mensaje descriptivo de la fase completada
- NO agregar Co-Authored-By ni watermarks

### Al completar todas las fases:

1. Ejecuta la validacion completa:

```bash
bun run format:check
bun run lint
bun run type-check
bun run test
bun run test:coverage
```

2. Actualiza `docs/tasks/status.md` con estado "completado"
3. Actualiza documentacion en `docs/` si se crearon modulos/componentes nuevos
4. Reporta al usuario un resumen de lo implementado

## Reglas

- **Una fase a la vez** — no saltes fases ni implementes todo de golpe
- **Tests son obligatorios** — sin tests la fase no esta completa
- **No te desvies del plan** — si necesitas cambiar algo, actualiza `plan.md` y `decisions.md` primero
- **Audit logs en mutaciones** — cada action que muta datos necesita `createAuditLog`
- **Adapters siempre** — nunca importar libs externas fuera de `lib/adapters/`
- **Loading skeletons** — cada pagina nueva necesita `loading.tsx`
- **i18n** — textos nuevos en es.json, en.json Y ca.json
- **Archivos < 250 lineas** — si un archivo crece demasiado, dividirlo
- Si el contexto se llena, guarda progreso en `status.md` y el usuario puede retomar con `/implement-task continuar`
