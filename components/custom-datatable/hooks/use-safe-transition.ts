'use client'

import { useTransition, useCallback, useRef } from 'react'

/**
 * Hook que envuelve useTransition para proteger contra dobles ejecuciones
 * causadas por React Strict Mode.
 *
 * React Strict Mode ejecuta la función pasada a startTransition DOS veces
 * para detectar side effects. Este hook asegura que solo la última ejecución
 * actualice el estado.
 *
 * @example
 * ```tsx
 * const { isPending, safeTransition } = useSafeTransition();
 *
 * const fetchData = useCallback(() => {
 *   safeTransition(async (isStale) => {
 *     const result = await fetchAction();
 *     if (isStale()) return; // Ignorar si otra ejecución inició
 *     setState(result);
 *   });
 * }, [safeTransition]);
 * ```
 */
export function useSafeTransition() {
  const [isPending, startTransition] = useTransition()
  const executionIdRef = useRef(0)

  /**
   * Ejecuta una transición de forma segura, protegiendo contra
   * dobles ejecuciones de React Strict Mode.
   *
   * @param fn - Función async que recibe `isStale()` para verificar
   *             si debe abortar antes de actualizar estado
   */
  const safeTransition = useCallback(
    (fn: (isStale: () => boolean) => Promise<void>) => {
      startTransition(async () => {
        // Incrementar DENTRO de startTransition para capturar Strict Mode
        executionIdRef.current += 1
        const myExecutionId = executionIdRef.current

        // Función que el callback puede usar para verificar si debe continuar
        const isStale = () => myExecutionId !== executionIdRef.current

        await fn(isStale)
      })
    },
    [],
  )

  return { isPending, safeTransition }
}
