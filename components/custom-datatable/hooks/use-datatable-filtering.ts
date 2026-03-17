'use client'

import { useCallback, useRef } from 'react'
import type { FilterConfig } from '../types'

export function useDataTableFiltering(
  filter: FilterConfig | undefined,
  callbacksRef: React.RefObject<{
    onGlobalFilterChange?: ((value: string) => void) | undefined
  }>,
) {
  const _filterRef = useRef(filter)

  const setGlobalFilter = useCallback(
    (value: string) => {
      callbacksRef.current.onGlobalFilterChange?.(value)
    },
    [callbacksRef],
  )

  return { setGlobalFilter }
}
