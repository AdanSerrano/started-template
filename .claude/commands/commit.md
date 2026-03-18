# /commit — Commit inteligente con Conventional Commits

Eres un asistente de git que crea commits siguiendo estrictamente la especificación Conventional Commits.

## Argumentos opcionales

$ARGUMENTS

## Instrucciones

Sigue estos pasos en orden:

### 1. Analizar estado del repositorio

Ejecuta en paralelo:

- `git status` para ver archivos modificados, nuevos y eliminados
- `git diff` para ver cambios unstaged
- `git diff --cached` para ver cambios ya staged
- `git log --oneline -10` para ver el estilo y scope de commits recientes

### 2. Analizar los cambios

- Revisa cada archivo modificado/nuevo para entender QUE cambió y POR QUE
- Agrupa los cambios por tema/propósito
- Si hay archivos sensibles (.env, credentials, secrets), NO los incluyas y advierte al usuario
- Determina el tipo y scope del commit basándote en los cambios

### 3. Staging inteligente

- Haz `git add` de todos los archivos relevantes al cambio
- Si los argumentos del usuario especifican archivos concretos, solo agrega esos
- NUNCA incluir archivos sensibles (.env, credentials.json, etc.)

### 4. Crear el commit con Conventional Commits

#### Formato OBLIGATORIO

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Tipos permitidos

| Tipo       | Cuándo usar                                          |
| ---------- | ---------------------------------------------------- |
| `feat`     | Nueva funcionalidad para el usuario                  |
| `fix`      | Corrección de bug                                    |
| `docs`     | Solo cambios en documentación                        |
| `style`    | Formato, semicolons, whitespace (no cambia lógica)   |
| `refactor` | Cambio de código que no arregla bug ni añade feature |
| `perf`     | Mejora de rendimiento                                |
| `test`     | Añadir o corregir tests                              |
| `build`    | Cambios en build system o dependencias externas      |
| `ci`       | Cambios en CI/CD (GitHub Actions, configs)           |
| `chore`    | Mantenimiento, tareas que no modifican src ni tests  |
| `revert`   | Revierte un commit anterior                          |

#### Scope (opcional pero recomendado)

El scope indica el módulo/área afectada. Ejemplos: `auth`, `account`, `db`, `ui`, `api`, `i18n`, `config`, `deps`.
Determínalo según los archivos modificados.

#### Reglas del mensaje

- **description**: imperativo, minúsculas, sin punto final, max 72 caracteres
- **body** (opcional): explica el POR QUE del cambio, no el COMO. Separado por línea en blanco
- **footer** (opcional): `BREAKING CHANGE: descripción` si hay breaking changes
- Escribe en inglés (es el estándar de conventional commits)
- **NUNCA** agregar Co-Authored-By, firma, marca de agua ni atribución a Claude o AI

#### Ejemplos

```bash
# Simple
git commit -m "feat(auth): add magic link login"

# Con scope
git commit -m "fix(db): resolve soft-delete filter in user queries"

# Con body
git commit -m "$(cat <<'EOF'
refactor(account): extract address validation to shared utility

Moves address validation logic from AccountService to a reusable
utility function to avoid duplication across modules.
EOF
)"

# Breaking change
git commit -m "$(cat <<'EOF'
feat(api)!: change pagination response format

BREAKING CHANGE: pagination now returns { data, meta } instead of
{ items, total, page }
EOF
)"
```

#### Pasa el mensaje SIEMPRE via HEREDOC:

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <description>
EOF
)"
```

### 5. Confirmar

- Ejecuta `git status` para verificar que el commit se creó correctamente
- Muestra un resumen breve: archivos incluidos y mensaje del commit

## Reglas estrictas

- **NUNCA** agregar `Co-Authored-By` ni ninguna marca de agua o atribución
- **NUNCA** usar `--no-verify` (los hooks de pre-commit deben ejecutarse)
- Si el pre-commit hook falla, arregla el problema y crea un commit NUEVO (no --amend)
- Si no hay cambios para commitear, informa al usuario y no hagas nada
- Si los argumentos incluyen un mensaje específico del usuario, úsalo adaptado al formato conventional commits
- Si los cambios abarcan múltiples áreas sin relación, sugiere hacer commits separados
