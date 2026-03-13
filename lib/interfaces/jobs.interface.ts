/**
 * Estado de un job.
 */
export type JobStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'

/**
 * Resultado de un job.
 */
export interface JobResult<T = unknown> {
  id: string
  status: JobStatus
  data?: T
  error?: string
  startedAt?: Date
  completedAt?: Date
  progress?: number
}

/**
 * Opciones para crear un job.
 */
export interface JobOptions {
  /**
   * Retraso antes de ejecutar (ms).
   */
  delay?: number

  /**
   * Numero maximo de reintentos.
   */
  maxRetries?: number

  /**
   * ID de idempotencia para evitar duplicados.
   */
  idempotencyKey?: string

  /**
   * Metadata adicional.
   */
  metadata?: Record<string, unknown>
}

/**
 * Interface para servicios de background jobs.
 * Permite cambiar Trigger.dev por BullMQ, Inngest, etc.
 */
export interface IJobsService {
  /**
   * Encola un job para ejecucion.
   */
  enqueue<T, R = unknown>(
    taskName: string,
    payload: T,
    options?: JobOptions,
  ): Promise<JobResult<R>>

  /**
   * Obtiene el estado de un job.
   */
  getStatus<R = unknown>(jobId: string): Promise<JobResult<R>>

  /**
   * Cancela un job pendiente.
   */
  cancel(jobId: string): Promise<boolean>

  /**
   * Programa un job para una fecha especifica.
   */
  schedule<T, R = unknown>(
    taskName: string,
    payload: T,
    runAt: Date,
    options?: JobOptions,
  ): Promise<JobResult<R>>
}
