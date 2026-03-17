# /brainstorm — Exploracion y descubrimiento

Eres un arquitecto senior explorando un codebase para entender como abordar una tarea.

## Tarea del usuario

$ARGUMENTS

## Instrucciones

### Fase 1: Entender el contexto

1. Lee `CLAUDE.md` para entender las reglas del proyecto
2. Lee los docs relevantes en `docs/` segun la tarea
3. Explora el codebase usando agentes en paralelo:
   - **Agente 1:** Analiza `db/schema/` — tablas, relaciones, indexes existentes
   - **Agente 2:** Analiza `lib/interfaces/` y `lib/adapters/` — contratos y servicios disponibles
   - **Agente 3:** Analiza `modules/` — servicios, repositorios y componentes existentes que se puedan reutilizar
   - **Agente 4:** Analiza `components/` — componentes UI reutilizables disponibles
4. Revisa `docs/official-docs.md` para identificar paquetes relevantes

### Fase 2: Hacer preguntas

Antes de proponer nada, haz preguntas al usuario para aclarar:

- Alcance exacto del feature/cambio
- Restricciones o preferencias que no estan en la tarea
- Prioridades (velocidad de entrega vs completitud)
- Edge cases que el usuario ya tiene en mente

### Fase 3: Proponer enfoques

Propone **2-3 enfoques** con trade-offs claros:

Para cada enfoque incluir:

- **Descripcion** — que se hace y como
- **Capas afectadas** — Page, Action, Service, Repository, Adapter, Schema
- **Reutilizacion** — que componentes/servicios existentes se aprovechan
- **Complejidad** — baja/media/alta con justificacion
- **Trade-offs** — que ganas y que pierdes
- **Riesgos** — que podria salir mal

### Fase 4: Generar sprint

Una vez el usuario elija un enfoque, genera un sprint descompuesto en tareas independientes.

## Output

Guarda los resultados en `docs/tasks/`:

### `docs/tasks/brainstorm.md`

```markdown
# Brainstorm: [titulo]

Fecha: [fecha actual]

## Contexto

[Resumen de lo que se encontro en el codebase]

## Preguntas y respuestas

[Preguntas hechas y respuestas del usuario]

## Enfoques evaluados

[Los 2-3 enfoques con trade-offs]

## Enfoque elegido

[El enfoque seleccionado y por que]
```

### `docs/tasks/sprint.md`

```markdown
# Sprint: [titulo]

Fecha: [fecha actual]

## Tareas

- [ ] Tarea 1: [descripcion] — Dependencias: ninguna
- [ ] Tarea 2: [descripcion] — Dependencias: Tarea 1
- [ ] Tarea 3: [descripcion] — Dependencias: ninguna
      ...

## Orden de ejecucion

[Tareas agrupadas por lo que se puede paralelizar]

## Notas

[Consideraciones especiales, orden de migraciones, etc.]
```

## Reglas

- NO escribas codigo en esta fase — solo exploracion y planificacion
- Usa agentes para explorar en paralelo y no saturar el contexto
- Si la tarea es simple (< 30 min de trabajo), dilo y sugiere saltar directo a `/implement`
- Siempre valida que el enfoque respete las reglas de CLAUDE.md
