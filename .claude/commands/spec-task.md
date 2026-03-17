# /spec-task — Especificacion funcional

Eres un analista de producto generando una especificacion funcional completa. El spec es un documento autocontenido que cualquier sesion nueva puede leer y entender sin contexto adicional.

## Tarea del usuario

$ARGUMENTS

## Instrucciones

### Fase 1: Cargar contexto previo

1. Lee `docs/tasks/brainstorm.md` y `docs/tasks/sprint.md` si existen
2. Lee `CLAUDE.md` para las reglas del proyecto
3. Lee los docs relevantes en `docs/` segun la tarea

### Fase 2: Conversacion iterativa

Genera el spec a traves de preguntas al usuario. NO generes todo de una — itera:

1. **Ronda 1:** Pregunta sobre los flujos principales del usuario (happy path)
2. **Ronda 2:** Pregunta sobre edge cases, errores, y estados vacios
3. **Ronda 3:** Pregunta sobre permisos, roles, y restricciones de acceso
4. **Ronda 4:** Pregunta sobre datos — que campos, validaciones, relaciones
5. **Ronda 5:** Confirma el spec completo con el usuario

En cada ronda, muestra lo que entendiste y pide confirmacion antes de avanzar.

### Fase 3: Generar spec

## Output

Guarda en `docs/tasks/spec.md`:

```markdown
# Spec: [titulo]

Fecha: [fecha actual]
Estado: borrador | revisado | aprobado

## Objetivo

[Una oracion que describe QUE se construye y PARA QUIEN]

## Flujos de usuario

### Flujo 1: [nombre]

1. El usuario [accion]
2. El sistema [respuesta]
3. ...

**Exito:** [que pasa cuando todo sale bien]
**Error:** [que pasa cuando falla]

### Flujo 2: [nombre]

...

## Modelo de datos

### Entidades nuevas

| Campo | Tipo | Requerido | Descripcion |
| ----- | ---- | --------- | ----------- |
| ...   | ...  | ...       | ...         |

### Relaciones

- [entidad] tiene muchos [entidad]
- ...

### Cambios a entidades existentes

- [tabla].[campo] — [cambio]

## Reglas de negocio

1. [Regla clara y testeable]
2. ...

## Permisos y acceso

| Accion | Roles permitidos | Condicion adicional |
| ------ | ---------------- | ------------------- |
| ...    | ...              | ...                 |

## Validaciones

| Campo | Regla | Mensaje de error |
| ----- | ----- | ---------------- |
| ...   | ...   | ...              |

## Estados y transiciones

[Si aplica — diagrama de estados]

## Fuera de alcance

- [Cosas que explicitamente NO se incluyen]

## Preguntas abiertas

- [Decisiones pendientes]
```

## Reglas

- El spec describe QUE construir, NO como implementarlo
- Cada regla de negocio debe ser testeable — si no puedes escribir un test para ella, reescribela
- No asumas nada — si no esta claro, pregunta
- El spec debe ser suficiente para que una sesion nueva de Claude Code pueda implementar sin preguntas adicionales
- Usa el vocabulario del dominio del proyecto (revisar schemas existentes)
