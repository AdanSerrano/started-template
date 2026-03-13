'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import type { VirtualizationConfig } from '../types'

interface UseVirtualizationProps {
  enabled: boolean
  config?: VirtualizationConfig | undefined
  totalRows: number
  containerRef: React.RefObject<HTMLDivElement>
}

interface VirtualItem {
  index: number
  start: number
  size: number
}

export function useVirtualization({
  enabled,
  config,
  totalRows,
  containerRef,
}: UseVirtualizationProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  const rowHeight = config?.rowHeight ?? 48
  const overscan = config?.overscan ?? 5

  // Calculate total height
  const totalHeight = totalRows * rowHeight

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (!enabled || !config?.enabled) {
      return { start: 0, end: totalRows }
    }

    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
    const visibleCount = Math.ceil(containerHeight / rowHeight)
    const endIndex = Math.min(
      totalRows,
      startIndex + visibleCount + overscan * 2,
    )

    return { start: startIndex, end: endIndex }
  }, [
    enabled,
    config?.enabled,
    scrollTop,
    rowHeight,
    containerHeight,
    totalRows,
    overscan,
  ])

  // Generate virtual items
  const virtualItems = useMemo((): VirtualItem[] => {
    if (!enabled || !config?.enabled) {
      return Array.from({ length: totalRows }, (_, index) => ({
        index,
        start: index * rowHeight,
        size: rowHeight,
      }))
    }

    const items: VirtualItem[] = []
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      items.push({
        index: i,
        start: i * rowHeight,
        size: rowHeight,
      })
    }
    return items
  }, [enabled, config?.enabled, totalRows, rowHeight, visibleRange])

  // Handle scroll
  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLDivElement
    setScrollTop(target.scrollTop)
  }, [])

  // Scroll to index
  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      if (!containerRef.current) return
      const top = index * rowHeight
      containerRef.current.scrollTo({ top, behavior })
    },
    [containerRef, rowHeight],
  )

  // Setup scroll listener and resize observer
  useEffect(() => {
    if (!enabled || !config?.enabled) return

    const container = containerRef.current
    if (!container) return

    // Set initial height
    setContainerHeight(container.clientHeight)

    // Listen to scroll
    container.addEventListener('scroll', handleScroll, { passive: true })

    // Listen to resize
    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height)
      }
    })
    resizeObserverRef.current.observe(container)

    return () => {
      container.removeEventListener('scroll', handleScroll)
      resizeObserverRef.current?.disconnect()
    }
  }, [enabled, config?.enabled, handleScroll, containerRef])

  // Offset for positioning visible items
  const offsetTop = visibleRange.start * rowHeight

  return {
    virtualItems,
    totalHeight,
    offsetTop,
    visibleRange,
    scrollToIndex,
    isVirtualized: enabled && config?.enabled,
  }
}
