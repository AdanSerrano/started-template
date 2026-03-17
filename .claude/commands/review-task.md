# /review-task — Auditoria y revision de codigo

Eres un revisor senior auditando codigo contra la especificacion y las reglas del proyecto. Primero haces revision mecanica, luego validacion experta con agentes.

## Tarea del usuario

$ARGUMENTS

## Instrucciones

### Fase 1: Cargar contexto

1. Lee `docs/tasks/spec.md` — referencia funcional
2. Lee `docs/tasks/plan.md` — referencia tecnica
3. Lee `docs/tasks/status.md` — que fases se implementaron
4. Lee `CLAUDE.md` — reglas del proyecto

### Fase 2: Identificar cambios

Usa git para ver todos los archivos modificados/creados:

```bash
git diff main --name-only
git diff main --stat
```

Si no hay branch separado, usa el ultimo tag o los ultimos N commits relevantes.

### Fase 3: Revision mecanica

Revisa cada archivo cambiado contra este checklist:

#### Arquitectura

- [ ] Paginas solo componen, sin logica ni queries
- [ ] Actions: Zod + requireAuth() + rate limit + delegacion a service
- [ ] Services: toda la logica de negocio, sin APIs de Next.js
- [ ] Repositories: interfaces + tx? en mutaciones
- [ ] Adapters: no se importan libs externas fuera de lib/adapters/

#### Calidad

- [ ] Archivos < 250 lineas
- [ ] Imports con @/ (no relativos)
- [ ] Server Components por default ('use client' solo cuando necesario)
- [ ] No useEffect innecesarios
- [ ] Forms con React Hook Form + Zod + useTransition
- [ ] Loading skeletons con Skeleton de shadcn/ui
- [ ] Zustand con selectores atomicos

#### Seguridad

- [ ] No hay SQL injection (parametros, no concatenacion)
- [ ] No hay XSS (sanitizacion donde aplica)
- [ ] Rate limiting en endpoints publicos
- [ ] Validacion Zod en toda entrada de usuario
- [ ] No hay secrets hardcodeados

#### Tests

- [ ] Cada service/util nuevo tiene test unitario
- [ ] Cada action nueva tiene test de integracion
- [ ] Factories actualizadas para nuevas entidades
- [ ] Tests pasan: `bun run test`
- [ ] Coverage >= 50% en archivos nuevos

#### Completitud vs spec

- [ ] Todos los flujos del spec estan implementados
- [ ] Edge cases cubiertos
- [ ] Reglas de negocio implementadas correctamente
- [ ] Permisos/roles respetados
- [ ] Validaciones implementadas segun spec

### Fase 4: Revision experta con agentes

Lanza agentes en paralelo para revision profunda:

- **Agente 1 (Seguridad):** Revisa OWASP Top 10 en el codigo cambiado. Busca injection, XSS, broken auth, CSRF, exposed secrets.
- **Agente 2 (Performance):** Revisa N+1 queries, falta de Promise.all, componentes que deberian ser server, falta de ISR, imports pesados.
- **Agente 3 (Spec compliance):** Compara linea por linea el spec con la implementacion. ¿Falta algo? ¿Hay algo extra que no se pidio?
- **Agente 4 (Tests):** Analiza cobertura de tests. ¿Que edge cases faltan? ¿Que branches no estan testeados?

### Fase 5: Generar audit

## Output

Guarda en `docs/tasks/audit.md`:

```markdown
# Audit: [titulo]

Fecha: [fecha actual]
Spec: docs/tasks/spec.md
Plan: docs/tasks/plan.md

## Resumen

[1-2 oraciones del estado general]

## Resultado: APROBADO | APROBADO CON OBSERVACIONES | REQUIERE CAMBIOS

## Issues encontrados

### Criticos (bloquean merge)

1. **[archivo:linea]** — [descripcion del problema]
   **Fix sugerido:** [como arreglarlo]

### Importantes (deberian arreglarse)

1. **[archivo:linea]** — [descripcion]
   **Fix sugerido:** [como arreglarlo]

### Menores (nice to have)

1. **[archivo:linea]** — [descripcion]

## Checklist de revision

- [x/fail] Arquitectura 5 capas
- [x/fail] Calidad de codigo
- [x/fail] Seguridad
- [x/fail] Tests
- [x/fail] Completitud vs spec
- [x/fail] Documentacion actualizada
- [x/fail] i18n (es/en/ca)

## Cobertura de spec

| Flujo     | Estado                     | Notas |
| --------- | -------------------------- | ----- |
| [flujo 1] | implementado/parcial/falta | ...   |

## Metricas

- Archivos modificados: N
- Lineas agregadas: N
- Tests nuevos: N
- Coverage promedio: N%
```

## Reglas

- Se objetivo — no apruebes por cortesia
- Cada issue critico DEBE tener un fix sugerido concreto
- Si el spec no se cumplio, es critico
- Si faltan tests, es critico
- No revises codigo que no cambio (no refactorices el mundo)
- Si encuentras issues criticos, ofrece al usuario corregirlos inmediatamente
