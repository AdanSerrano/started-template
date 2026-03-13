import { tasks, runs } from '@trigger.dev/sdk/v3'
import type {
  IJobsService,
  JobResult,
  JobOptions,
  JobStatus,
} from '@/lib/interfaces'

/**
 * Implementacion de IJobsService usando Trigger.dev v3.
 * Para cambiar a BullMQ, Inngest, etc., crear nuevo adapter.
 */
export class TriggerJobsService implements IJobsService {
  async enqueue<T, R = unknown>(
    taskName: string,
    payload: T,
    options?: JobOptions,
  ): Promise<JobResult<R>> {
    // Build trigger options only with defined values
    const triggerOptions: Record<string, unknown> = {}
    if (options?.delay) triggerOptions.delay = `${options.delay}ms`
    if (options?.idempotencyKey)
      triggerOptions.idempotencyKey = options.idempotencyKey
    if (options?.maxRetries) triggerOptions.maxAttempts = options.maxRetries
    if (options?.metadata) {
      triggerOptions.metadata = options.metadata as Record<
        string,
        string | number | boolean | null
      >
    }

    const handle = await tasks.trigger(taskName, payload, triggerOptions)

    return {
      id: handle.id,
      status: 'pending',
    }
  }

  async getStatus<R = unknown>(jobId: string): Promise<JobResult<R>> {
    const run = await runs.retrieve(jobId)

    const statusMap: Record<string, JobStatus> = {
      PENDING: 'pending',
      QUEUED: 'pending',
      DEQUEUED: 'pending',
      EXECUTING: 'running',
      WAITING: 'pending',
      COMPLETED: 'completed',
      FAILED: 'failed',
      SYSTEM_FAILURE: 'failed',
      CANCELED: 'cancelled',
      CRASHED: 'failed',
      EXPIRED: 'failed',
      DELAYED: 'pending',
      PENDING_VERSION: 'pending',
      TIMED_OUT: 'failed',
    }

    const result: JobResult<R> = {
      id: run.id,
      status: statusMap[run.status] ?? 'pending',
    }

    // Only add optional properties if they have values
    if (run.output !== undefined) {
      result.data = run.output as R
    }
    const failedStatuses = [
      'FAILED',
      'SYSTEM_FAILURE',
      'CRASHED',
      'TIMED_OUT',
      'EXPIRED',
    ]
    if (failedStatuses.includes(run.status)) {
      result.error = 'Job failed'
    }
    if (run.startedAt) {
      result.startedAt = new Date(run.startedAt)
    }
    if (run.finishedAt) {
      result.completedAt = new Date(run.finishedAt)
    }

    return result
  }

  async cancel(jobId: string): Promise<boolean> {
    try {
      await runs.cancel(jobId)
      return true
    } catch {
      return false
    }
  }

  async schedule<T, R = unknown>(
    taskName: string,
    payload: T,
    runAt: Date,
    options?: JobOptions,
  ): Promise<JobResult<R>> {
    const delay = runAt.getTime() - Date.now()

    return this.enqueue<T, R>(taskName, payload, {
      ...options,
      delay: delay > 0 ? delay : 0,
    })
  }
}
