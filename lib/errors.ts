export class AppError extends Error {
  override name = 'AppError'

  constructor(
    message: string,
    public statusCode = 500,
    public code?: string,
    public fieldErrors?: Record<string, string[]>,
  ) {
    super(message)
  }
}

export class NotFoundError extends AppError {
  override name = 'NotFoundError'

  constructor(entity: string, id: string) {
    super(`${entity} con ID ${id} no encontrado`, 404, 'NOT_FOUND')
  }
}

export class ValidationError extends AppError {
  override name = 'ValidationError'

  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message, 422, 'VALIDATION_ERROR', fieldErrors)
  }
}

export class UnauthorizedError extends AppError {
  override name = 'UnauthorizedError'

  constructor(message = 'No autorizado') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  override name = 'ForbiddenError'

  constructor(message = 'Sin permisos') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class AccountLockedError extends AppError {
  override name = 'AccountLockedError'

  constructor(
    message = 'Cuenta bloqueada temporalmente por multiples intentos fallidos',
    public lockedUntil?: Date,
  ) {
    super(message, 423, 'ACCOUNT_LOCKED')
  }
}

export class ConflictError extends AppError {
  override name = 'ConflictError'

  constructor(message = 'El recurso ya existe') {
    super(message, 409, 'CONFLICT')
  }
}

export class TooManyRequestsError extends AppError {
  override name = 'TooManyRequestsError'

  constructor(
    message = 'Demasiadas solicitudes, intenta mas tarde',
    public retryAfterMs?: number,
  ) {
    super(message, 429, 'TOO_MANY_REQUESTS')
  }
}

export class ServiceUnavailableError extends AppError {
  override name = 'ServiceUnavailableError'

  constructor(message = 'Servicio no disponible temporalmente') {
    super(message, 503, 'SERVICE_UNAVAILABLE')
  }
}
