/**
 * Resultado de verificar rate limit.
 */
export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number // timestamp en ms
  limit: number
}

/**
 * Configuracion de rate limit.
 */
export interface RateLimitConfig {
  /**
   * Maximo de requests permitidos.
   */
  limit: number

  /**
   * Ventana de tiempo en segundos.
   */
  windowSeconds: number
}

/**
 * Interface para servicios de rate limiting.
 * Permite intercambiar la implementacion de rate limiting.
 */
export interface IRateLimitService {
  /**
   * Verifica si un identificador ha excedido el rate limit.
   * @param identifier ID unico (ej: IP, userId, deviceId)
   * @param config Configuracion de rate limit (opcional, usa defaults)
   */
  check(identifier: string, config?: RateLimitConfig): Promise<RateLimitResult>

  /**
   * Resetea el contador para un identificador.
   */
  reset(identifier: string): Promise<void>

  /**
   * Obtiene el estado actual sin consumir un request.
   */
  getStatus(identifier: string): Promise<RateLimitResult>
}
