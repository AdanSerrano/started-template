# /plan-task — Plan de implementacion

Eres un ingeniero senior creando un plan de implementacion detallado, fase por fase, con estrategia de testing.

## Tarea del usuario

$ARGUMENTS

## Instrucciones

### Fase 1: Cargar contexto

1. Lee `docs/tasks/spec.md` — es la fuente de verdad de QUE construir
2. Lee `docs/tasks/brainstorm.md` si existe — para contexto adicional
3. Lee `CLAUDE.md` para las reglas arquitectonicas

### Fase 2: Investigar con agentes en paralelo

Lanza agentes especializados para investigar:

- **Agente 1 (Codebase):** Buscar patrones similares ya implementados en `modules/`. ¿Como se resolvio algo parecido? Copiar el patron, no reinventar.
- **Agente 2 (Schema):** Analizar `db/schema/` — ¿que tablas existen? ¿que relaciones? ¿necesitamos migracion?
- **Agente 3 (Docs oficiales):** Consultar `docs/official-docs.md` y usar context7 (MCP) para buscar documentacion actualizada de los paquetes que se van a tocar. Verificar APIs, breaking changes, patrones recomendados.
- **Agente 4 (Tests):** Revisar `tests/` — ¿que patrones de testing se usan? ¿que factories existen? ¿que mocks estan configurados?

### Fase 3: Disenar el plan

Divide la implementacion en **fases incrementales**. Cada fase debe:

- Ser deployable por si sola (no rompe nada si se deploya parcialmente)
- Tener tests que la validen
- Ser lo suficientemente pequena para una sesion de Claude Code

### Fase 4: Documentar decisiones

Para cada decision arquitectonica, documenta:

- ¿Que opciones habia?
- ¿Cual se eligio y por que?
- ¿Que se sacrifico?

## Output

### `docs/tasks/plan.md`

```markdown
# Plan: [titulo]

Fecha: [fecha actual]
Spec: docs/tasks/spec.md

## Resumen

[1-2 oraciones del enfoque general]

## Fases de implementacion

### Fase 1: [nombre] — [estimacion: chica/mediana/grande]

**Objetivo:** [que se logra al completar esta fase]

**Archivos a crear/modificar:**

- `db/schema/[tabla].ts` — Nuevo schema
- `modules/[modulo]/repositories/[repo].ts` — Nuevo repository
- `modules/[modulo]/services/[service].ts` — Nuevo service
- ...

**Pasos:**

1. [Paso detallado con archivo y que hacer]
2. ...

**Tests:**

- [ ] `tests/unit/[service].test.ts` — [que testear]
- [ ] `tests/unit/[repo].test.ts` — [que testear]

**Validacion:** [como verificar que la fase esta completa]

### Fase 2: [nombre]

...

## Migraciones de DB

[Si aplica — orden de migraciones, datos a seedear]

## Archivos nuevos vs modificados

| Archivo | Accion          | Responsabilidad |
| ------- | --------------- | --------------- |
| ...     | crear/modificar | ...             |

## Dependencias entre fases

Fase 1 → Fase 2 → Fase 3
Fase 1 → Fase 4 (paralela a Fase 2)

## Riesgos y mitigacion

| Riesgo | Probabilidad | Mitigacion |
| ------ | ------------ | ---------- |
| ...    | ...          | ...        |
```

### `docs/tasks/decisions.md`

```markdown
# Decisiones: [titulo]

Fecha: [fecha actual]

## Decision 1: [titulo]

**Contexto:** [por que se necesita decidir]
**Opciones:**

1. [opcion A] — Pro: ... / Con: ...
2. [opcion B] — Pro: ... / Con: ...
   **Elegida:** [opcion] — **Razon:** [por que]

## Decision 2: [titulo]

...
```

### `docs/tasks/status.md`

```markdown
# Status: [titulo]

Ultima actualizacion: [fecha]

## Progreso

- [ ] Fase 1: [nombre] — pendiente
- [ ] Fase 2: [nombre] — pendiente
- ...

## Fase actual: ninguna

## Bloqueadores: ninguno
```

## Reglas

- Cada fase debe respetar las 5 capas de arquitectura (CLAUDE.md seccion 7)
- Los tests son parte del plan, no un agregado al final
- Usar adapters/providers para servicios externos — NUNCA importar libs directamente
- Si algo del spec no esta claro, pregunta antes de planificar
- El plan debe ser ejecutable por `/implement-task` sin ambiguedades
- Prioriza reutilizar codigo existente — buscar en modules/, components/, lib/
