import { z } from 'zod/v4'
import { getRequestMetadata } from '@/lib/audit-helpers'
import { requireAuth } from '@/lib/auth-server'
import { AppError, TooManyRequestsError } from '@/lib/errors'
import { getLogger } from '@/lib/providers'
import { generateRequestId, withRequestContext } from '@/lib/request-context'

/**
 * Resultado estandar de server actions.
 */
export type ActionResult<T = void> = {
  success: boolean
  data?: T | undefined
  error?: string | undefined
  code?: string | undefined
  fieldErrors?: Record<string, string[]> | undefined
  retryAfterMs?: number | undefined
}

interface SafeActionConfig<TSchema extends z.ZodType> {
  schema?: TSchema
  auth?: boolean
}

/**
 * Wrapper para server actions con validacion, auth y error handling.
 *
 * Cada invocacion corre dentro de un request context (AsyncLocalStorage) con
 * el x-request-id propagado por el middleware, para que el logging y los audit
 * logs compartan el mismo id de traza.
 *
 * @example
 * ```ts
 * export const myAction = createSafeAction(
 *   { schema: mySchema, auth: true },
 *   async ({ data, session, metadata }) => {
 *     await myService.doSomething(data)
 *     await createAuditLog({ action: 'entity.created', ..., metadata })
 *   },
 * )
 * ```
 */
export function createSafeAction<TSchema extends z.ZodType, TResult = void>(
  config: SafeActionConfig<TSchema>,
  handler: (params: {
    data: z.infer<TSchema>
    session: NonNullable<Awaited<ReturnType<typeof requireAuth>>>
    metadata: { ip: string; userAgent: string }
  }) => Promise<TResult>,
) {
  return async (input: unknown): Promise<ActionResult<TResult>> => {
    const metadata = await getRequestMetadata()
    const requestId = metadata.requestId ?? generateRequestId()

    return withRequestContext({ requestId }, async () => {
      try {
        const session =
          config.auth !== false ? await requireAuth() : (null as never)

        let data = input
        if (config.schema) {
          const parsed = config.schema.safeParse(input)
          if (!parsed.success) {
            return {
              success: false,
              error: 'Datos invalidos',
              code: 'VALIDATION_ERROR',
              fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<
                string,
                string[]
              >,
            }
          }
          data = parsed.data
        }

        const result = await handler({
          data: data as z.infer<TSchema>,
          session,
          metadata,
        })
        return { success: true, data: result }
      } catch (error) {
        // Re-throw Next.js internal errors (redirect, notFound)
        if (error instanceof Error && 'digest' in error) {
          throw error
        }

        if (error instanceof AppError) {
          return {
            success: false,
            error: error.message,
            code: error.code,
            fieldErrors: error.fieldErrors,
            ...(error instanceof TooManyRequestsError && error.retryAfterMs
              ? { retryAfterMs: error.retryAfterMs }
              : {}),
          }
        }

        getLogger().error('[safeAction] Unhandled error', error as Error)
        return {
          success: false,
          error: 'Error interno del servidor',
          code: 'INTERNAL_ERROR',
        }
      }
    })
  }
}

/**
 * Wrapper para server actions que reciben FormData (file uploads).
 * Provee auth, metadata, request context y error handling igual que
 * createSafeAction, pero sin validacion Zod (FormData no es serializable).
 *
 * @example
 * ```ts
 * export const uploadAction = createSafeFormAction(
 *   async ({ formData, session, metadata }) => {
 *     const file = formData.get('file') as File
 *     // ... process file
 *     return { url: publicUrl }
 *   },
 * )
 * ```
 */
export function createSafeFormAction<TResult = void>(
  handler: (params: {
    formData: FormData
    session: NonNullable<Awaited<ReturnType<typeof requireAuth>>>
    metadata: { ip: string; userAgent: string }
  }) => Promise<TResult>,
) {
  return async (formData: FormData): Promise<ActionResult<TResult>> => {
    const metadata = await getRequestMetadata()
    const requestId = metadata.requestId ?? generateRequestId()

    return withRequestContext({ requestId }, async () => {
      try {
        const session = await requireAuth()

        const result = await handler({ formData, session, metadata })
        return { success: true, data: result }
      } catch (error) {
        if (error instanceof Error && 'digest' in error) {
          throw error
        }

        if (error instanceof AppError) {
          return {
            success: false,
            error: error.message,
            code: error.code,
            fieldErrors: error.fieldErrors,
            ...(error instanceof TooManyRequestsError && error.retryAfterMs
              ? { retryAfterMs: error.retryAfterMs }
              : {}),
          }
        }

        getLogger().error('[safeFormAction] Unhandled error', error as Error)
        return {
          success: false,
          error: 'Error interno del servidor',
          code: 'INTERNAL_ERROR',
        }
      }
    })
  }
}
