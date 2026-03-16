import { z } from 'zod/v4'
import { requireAuth } from '@/lib/auth-server'
import { getRequestMetadata } from '@/lib/audit-helpers'
import { AppError } from '@/lib/errors'
import { getLogger } from '@/lib/providers'

/**
 * Resultado estandar de server actions.
 */
export type ActionResult<T = void> = {
  success: boolean
  data?: T | undefined
  error?: string | undefined
  code?: string | undefined
  fieldErrors?: Record<string, string[]> | undefined
}

interface SafeActionConfig<TSchema extends z.ZodType> {
  schema?: TSchema
  auth?: boolean
}

/**
 * Wrapper para server actions con validacion, auth y error handling.
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
    try {
      const session =
        config.auth !== false ? await requireAuth() : (null as never)

      const metadata = await getRequestMetadata()

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
        }
      }

      getLogger().error('[safeAction] Unhandled error', error as Error)
      return {
        success: false,
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
      }
    }
  }
}
