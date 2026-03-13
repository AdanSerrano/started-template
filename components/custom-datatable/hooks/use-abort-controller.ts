'use client'

import { useRef, useCallback } from 'react'

/**
 * Hook to manage AbortController for canceling pending requests.
 * When a new request starts, the previous one is automatically cancelled.
 * This prevents race conditions and improves responsiveness.
 */
export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef(0)

  /**
   * Get a new AbortController signal, cancelling any pending request.
   * Returns the signal and a unique request ID for tracking.
   */
  const getSignal = useCallback(() => {
    // Cancel previous request if exists
    if (controllerRef.current) {
      controllerRef.current.abort()
    }

    // Create new controller
    controllerRef.current = new AbortController()
    requestIdRef.current += 1

    return {
      signal: controllerRef.current.signal,
      requestId: requestIdRef.current,
    }
  }, [])

  /**
   * Check if the given request ID is still the current one.
   * Useful for ignoring stale responses.
   */
  const isCurrentRequest = useCallback((requestId: number) => {
    return requestId === requestIdRef.current
  }, [])

  /**
   * Manually cancel the current request.
   */
  const cancel = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort()
      controllerRef.current = null
    }
  }, [])

  return {
    getSignal,
    isCurrentRequest,
    cancel,
  }
}
