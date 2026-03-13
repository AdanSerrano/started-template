# Patrones de Diseno — Starter App

> Patrones obligatorios con ejemplos de implementacion.

---

## Matriz de Decision

| Problema                         | Patron                      | Ejemplo                            |
| -------------------------------- | --------------------------- | ---------------------------------- |
| Crear objetos sin exponer logica | **Factory**                 | `getEmailProvider()`               |
| Una sola instancia global        | **Singleton**               | Cliente DB, Resend                 |
| Construir objetos complejos      | **Builder**                 | Emails con muchas opciones         |
| Adaptar interfaz incompatible    | **Adapter**                 | Drizzle->IRepository, R2->IStorage |
| Simplificar API compleja         | **Facade**                  | `userService.processAction()`      |
| Agregar comportamiento           | **Decorator**               | Logging, caching, retry            |
| Algoritmos intercambiables       | **Strategy**                | Notification channels, exports     |
| Notificar cambios                | **Observer**                | Eventos del sistema, webhooks      |
| Objeto con estados               | **State**                   | Entidad con workflow de estados    |
| Validacion en capas              | **Chain of Responsibility** | Validacion multi-paso              |
| Acciones reversibles             | **Command**                 | Operaciones con audit log          |

---

## Patrones Creacionales

### Factory Pattern

> **Estado:** Planned — Este ejemplo (NotificationFactory) aun no esta implementado. El patron Factory SI se usa en `lib/providers.ts`.

```typescript
// lib/factories/notification-factory.ts
export function createNotificationProvider(
  type: 'email' | 'sms' | 'push',
): INotificationProvider {
  switch (type) {
    case 'email':
      return new EmailNotification()
    case 'sms':
      return new SMSNotification()
    case 'push':
      return new PushNotification()
  }
}

// Uso
const provider = createNotificationProvider(user.preferredChannel)
await provider.send({ to: user.id, message })
```

### Singleton Pattern

```typescript
// lib/db.ts
let dbInstance: ReturnType<typeof drizzle> | null = null

export function getDb() {
  if (!dbInstance) {
    const sql = neon(process.env.DATABASE_URL!)
    dbInstance = drizzle(sql, { schema })
  }
  return dbInstance
}

export const db = getDb()
```

### Builder Pattern

> **Estado:** Planned — Este patron (EmailBuilder) aun no esta implementado en el codebase.

```typescript
// lib/builders/email-builder.ts
export class EmailBuilder {
  private params: Partial<SendEmailParams> = {}

  to(recipient: string | string[]): this {
    this.params.to = recipient
    return this
  }

  subject(subject: string): this {
    this.params.subject = subject
    return this
  }

  template(component: React.ReactElement): this {
    this.params.react = component
    return this
  }

  build(): SendEmailParams {
    if (!this.params.to || !this.params.subject) {
      throw new Error('Email requires "to" and "subject"')
    }
    return this.params as SendEmailParams
  }
}

// Uso
const email = new EmailBuilder()
  .to(user.email)
  .subject(`Welcome to the platform`)
  .template(<WelcomeEmail user={user} />)
  .build()
```

---

## Patrones Estructurales

### Facade Pattern

```typescript
// modules/account/services/account-facade.ts
export class AccountFacade {
  async updateProfile(params: UpdateProfileParams): Promise<ProfileResult> {
    // 1. Validar datos
    await validationService.validateProfile(params)

    // 2. Actualizar usuario
    const user = await userRepository.update(params)

    // 3. Enviar notificacion
    await emailService.sendProfileUpdated(user)

    return { user }
  }
}
```

### Decorator Pattern

```typescript
// lib/decorators/with-retry.ts
export function withRetry<T extends object>(
  service: T,
  options: { maxRetries: number; delay: number },
): T {
  return new Proxy(service, {
    get(target, prop) {
      const original = target[prop as keyof T]
      if (typeof original === 'function') {
        return async (...args: unknown[]) => {
          let lastError: Error | null = null
          for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
            try {
              return await (original as Function).apply(target, args)
            } catch (error) {
              lastError = error as Error
              if (attempt < options.maxRetries) {
                await new Promise((r) => setTimeout(r, options.delay * attempt))
              }
            }
          }
          throw lastError
        }
      }
      return original
    },
  })
}

// Uso
const storage = withRetry(new R2StorageService(), { maxRetries: 3, delay: 100 })
```

---

## Patrones Comportamentales

### Strategy Pattern

```typescript
// lib/strategies/export-strategy.interface.ts
export interface IExportStrategy {
  export(data: Record<string, unknown>[]): Promise<Buffer>
}

export class CSVExportStrategy implements IExportStrategy {
  async export(data: Record<string, unknown>[]) {
    // CSV export logic
    return Buffer.from(csvContent)
  }
}

export class ExcelExportStrategy implements IExportStrategy {
  async export(data: Record<string, unknown>[]) {
    // Excel export logic
    return Buffer.from(excelContent)
  }
}

// Uso
const strategy =
  format === 'excel' ? new ExcelExportStrategy() : new CSVExportStrategy()
const buffer = await strategy.export(data)
```

### State Pattern

```typescript
// lib/states/entity-state.interface.ts
export interface IEntityState {
  activate(entity: Entity): Promise<Entity>
  deactivate(entity: Entity): Promise<Entity>
  archive(entity: Entity): Promise<Entity>
  getAvailableActions(): EntityAction[]
}

export class DraftState implements IEntityState {
  async activate(entity: Entity): Promise<Entity> {
    return { ...entity, status: 'active' }
  }

  getAvailableActions() {
    return ['activate', 'archive']
  }
  // ...
}

export class EntityStateMachine {
  private states: Record<EntityStatus, IEntityState> = {
    draft: new DraftState(),
    active: new ActiveState(),
    archived: new ArchivedState(),
  }

  async transition(entity: Entity, action: EntityAction): Promise<Entity> {
    const state = this.states[entity.status]
    return state[action](entity)
  }
}
```

### Chain of Responsibility

```typescript
// lib/handlers/base-handler.ts
export abstract class BaseValidationHandler implements IValidationHandler {
  protected next: IValidationHandler | null = null

  setNext(handler: IValidationHandler): IValidationHandler {
    this.next = handler
    return handler
  }

  async handle(request: ValidationRequest): Promise<ValidationResult> {
    const result = await this.validate(request)
    if (!result.valid) return result
    if (this.next) return this.next.handle(request)
    return result
  }

  protected abstract validate(
    request: ValidationRequest,
  ): Promise<ValidationResult>
}

// Encadenar validadores
function createValidationChain(): IValidationHandler {
  const auth = new AuthHandler()
  const permissions = new PermissionsHandler()
  const data = new DataHandler()

  auth.setNext(permissions).setNext(data)
  return auth
}
```

### Observer Pattern

> **Estado:** Planned — Este patron (EventBus) aun no esta implementado en el codebase.

```typescript
// lib/events/event-emitter.ts
class EventEmitter {
  private handlers: Map<string, Set<EventHandler>> = new Map()

  on<T>(event: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)
    return () => this.handlers.get(event)?.delete(handler)
  }

  async emit<T>(event: string, payload: T): Promise<void> {
    const handlers = this.handlers.get(event)
    if (!handlers) return
    await Promise.all(Array.from(handlers).map((h) => h(payload)))
  }
}

export const eventBus = new EventEmitter()

// Uso
await eventBus.emit('user.created', { user })
```

---

## Patrones React/Frontend

### Compound Components

```tsx
// Componentes relacionados que comparten estado
<Tabs defaultValue="general">
  <TabsList>
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="general">
    <GeneralSettings />
  </TabsContent>
  <TabsContent value="settings">
    <AppSettings />
  </TabsContent>
</Tabs>
```

### Custom Hooks

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

---

## Anti-Patrones a Evitar

| Anti-patron            | Problema                   | Solucion                |
| ---------------------- | -------------------------- | ----------------------- |
| God Object             | Clase que hace todo        | Responsabilidad unica   |
| Spaghetti Code         | Logica enredada            | Aplicar patrones        |
| Copy-Paste             | Codigo duplicado           | Extraer funciones/hooks |
| Magic Numbers          | Valores hardcodeados       | Constantes con nombres  |
| Premature Optimization | Optimizar sin medir        | Medir primero           |
| Over-Engineering       | Abstracciones innecesarias | YAGNI                   |
| Tight Coupling         | Dependencias concretas     | Dependency Injection    |

---

## Regla de Seleccion

```
1. Problema de CREACION?        -> Factory, Builder, Singleton
2. Problema de ESTRUCTURA?      -> Adapter, Facade, Decorator
3. Problema de COMPORTAMIENTO?  -> Strategy, State, Chain, Observer
4. Problema de UI/React?        -> Compound Components, Custom Hooks
5. No estas seguro?             -> Empieza simple, refactoriza despues
```

---

_Starter App (c) 2026_
