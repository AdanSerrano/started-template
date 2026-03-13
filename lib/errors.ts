export class AppError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public fieldErrors?: Record<string, string[]>,
  ) {
    super(message)
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super(`${entity} con ID ${id} no encontrado`, 404)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message, 422, fieldErrors)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Sin permisos') {
    super(message, 403)
  }
}

export class AccountLockedError extends AppError {
  constructor(
    message = 'Cuenta bloqueada temporalmente por multiples intentos fallidos',
    public lockedUntil?: Date,
  ) {
    super(message, 423)
  }
}
