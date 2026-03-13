'use client'

import { useRef, useCallback, useEffect } from 'react'

interface PrefetchCache<T> {
  data: T
  timestamp: number
}

interface UsePrefetchOptions<T, P> {
  /**
   * Function to fetch data for a given set of parameters
   */
  fetchFn: (params: P) => Promise<T>
  /**
   * Cache duration in milliseconds (default: 30000 = 30 seconds)
   */
  cacheDuration?: number | undefined
  /**
   * Whether prefetching is enabled (default: true)
   */
  enabled?: boolean | undefined
}

/**
 * Hook for prefetching adjacent pages data.
 * Improves perceived performance by loading data before user navigates.
 *
 * Usage:
 * ```tsx
 * const { prefetch, getCached, clearCache } = usePrefetch({
 *   fetchFn: async (params) => await fetchData(params),
 *   cacheDuration: 30000, // 30 seconds
 * });
 *
 * // Prefetch on hover
 * <button onMouseEnter={() => prefetch({ page: 2 })}>Page 2</button>
 *
 * // Get cached data if available
 * const cached = getCached({ page: 2 });
 * ```
 */
export function usePrefetch<T, P extends Record<string, unknown>>({
  fetchFn,
  cacheDuration = 30000,
  enabled = true,
}: UsePrefetchOptions<T, P>) {
  const cacheRef = useRef<Map<string, PrefetchCache<T>>>(new Map())
  const pendingRef = useRef<Map<string, Promise<T>>>(new Map())

  // Create a stable cache key from params
  const createCacheKey = useCallback((params: P): string => {
    return JSON.stringify(params, Object.keys(params).sort())
  }, [])

  // Check if cached data is still valid
  const isValidCache = useCallback(
    (cache: PrefetchCache<T>): boolean => {
      return Date.now() - cache.timestamp < cacheDuration
    },
    [cacheDuration],
  )

  // Get cached data if available and valid
  const getCached = useCallback(
    (params: P): T | null => {
      if (!enabled) return null

      const key = createCacheKey(params)
      const cached = cacheRef.current.get(key)

      if (cached && isValidCache(cached)) {
        return cached.data
      }

      return null
    },
    [enabled, createCacheKey, isValidCache],
  )

  // Prefetch data for given params
  const prefetch = useCallback(
    async (params: P): Promise<void> => {
      if (!enabled) return

      const key = createCacheKey(params)

      // Skip if already cached and valid
      const cached = cacheRef.current.get(key)
      if (cached && isValidCache(cached)) {
        return
      }

      // Skip if already fetching
      if (pendingRef.current.has(key)) {
        return
      }

      // Start fetch
      const fetchPromise = fetchFn(params)
      pendingRef.current.set(key, fetchPromise)

      try {
        const data = await fetchPromise
        cacheRef.current.set(key, {
          data,
          timestamp: Date.now(),
        })
      } catch {
        // Silently fail prefetch - it's just optimization
      } finally {
        pendingRef.current.delete(key)
      }
    },
    [enabled, fetchFn, createCacheKey, isValidCache],
  )

  // Prefetch multiple params at once
  const prefetchMany = useCallback(
    async (paramsArray: P[]): Promise<void> => {
      await Promise.all(paramsArray.map((params) => prefetch(params)))
    },
    [prefetch],
  )

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear()
  }, [])

  // Clear expired cache entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      for (const [key, cache] of cacheRef.current.entries()) {
        if (now - cache.timestamp > cacheDuration) {
          cacheRef.current.delete(key)
        }
      }
    }, cacheDuration)

    return () => clearInterval(interval)
  }, [cacheDuration])

  return {
    prefetch,
    prefetchMany,
    getCached,
    clearCache,
  }
}

/**
 * Hook specifically for pagination prefetching.
 * Automatically prefetches adjacent pages based on current page.
 */
export function usePaginationPrefetch<T, P extends { page: number }>({
  fetchFn,
  currentPage,
  totalPages,
  cacheDuration = 30000,
  enabled = true,
  baseParams,
}: {
  fetchFn: (params: P) => Promise<T>
  currentPage: number
  totalPages: number
  cacheDuration?: number | undefined
  enabled?: boolean | undefined
  baseParams: Omit<P, 'page'>
}) {
  const { prefetch, prefetchMany, getCached, clearCache } = usePrefetch<T, P>({
    fetchFn,
    cacheDuration,
    enabled,
  })

  // Prefetch adjacent pages
  const prefetchAdjacent = useCallback(() => {
    if (!enabled) return

    const pagesToPrefetch: P[] = []

    // Previous page
    if (currentPage > 1) {
      pagesToPrefetch.push({ ...baseParams, page: currentPage - 1 } as P)
    }

    // Next page
    if (currentPage < totalPages) {
      pagesToPrefetch.push({ ...baseParams, page: currentPage + 1 } as P)
    }

    prefetchMany(pagesToPrefetch)
  }, [enabled, currentPage, totalPages, baseParams, prefetchMany])

  // Get cached page data
  const getCachedPage = useCallback(
    (page: number): T | null => {
      return getCached({ ...baseParams, page } as P)
    },
    [baseParams, getCached],
  )

  // Prefetch specific page
  const prefetchPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        prefetch({ ...baseParams, page } as P)
      }
    },
    [baseParams, totalPages, prefetch],
  )

  return {
    prefetchAdjacent,
    prefetchPage,
    getCachedPage,
    clearCache,
  }
}
