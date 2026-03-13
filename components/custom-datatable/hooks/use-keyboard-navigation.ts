'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import type { KeyboardNavigationConfig } from '../types'

interface UseKeyboardNavigationProps<TData> {
  enabled: boolean
  config?: KeyboardNavigationConfig | undefined
  data: TData[]
  getRowId: (row: TData) => string
  onSelectRow?: ((rowId: string) => void) | undefined
  onExpandRow?: ((rowId: string) => void) | undefined
  containerRef: React.RefObject<HTMLDivElement>
}

export function useKeyboardNavigation<TData>({
  enabled,
  config,
  data,
  getRowId,
  onSelectRow,
  onExpandRow,
  containerRef,
}: UseKeyboardNavigationProps<TData>) {
  const focusedRowIndex = useRef<number>(-1)
  const [focusedRowIndexState, setFocusedRowIndexState] = useState<number>(-1)
  const focusRow = useCallback(
    (index: number) => {
      if (!containerRef.current || index < 0 || index >= data.length) return

      const row = containerRef.current.querySelector(
        `[data-row-index="${index}"]`,
      ) as HTMLElement

      if (row) {
        row.focus()
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        focusedRowIndex.current = index
        setFocusedRowIndexState(index)
      }
    },
    [containerRef, data.length],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || !config?.enabled) return

      const target = event.target as HTMLElement
      const isInTable = containerRef.current?.contains(target)
      if (!isInTable) return

      // Ignore if user is typing in an input
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      const currentIndex = focusedRowIndex.current

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          if (currentIndex < data.length - 1) {
            focusRow(currentIndex + 1)
          }
          break

        case 'ArrowUp':
          event.preventDefault()
          if (currentIndex > 0) {
            focusRow(currentIndex - 1)
          }
          break

        case 'Home':
          if (event.ctrlKey) {
            event.preventDefault()
            focusRow(0)
          }
          break

        case 'End':
          if (event.ctrlKey) {
            event.preventDefault()
            focusRow(data.length - 1)
          }
          break

        case 'PageDown':
          event.preventDefault()
          focusRow(Math.min(currentIndex + 10, data.length - 1))
          break

        case 'PageUp':
          event.preventDefault()
          focusRow(Math.max(currentIndex - 10, 0))
          break

        case 'Enter':
          if (currentIndex >= 0 && currentIndex < data.length) {
            event.preventDefault()
            config.onEnter?.(data[currentIndex]!, currentIndex)
          }
          break

        case 'Escape':
          event.preventDefault()
          config.onEscape?.()
          break

        case 'Delete':
        case 'Backspace':
          if (
            currentIndex >= 0 &&
            currentIndex < data.length &&
            config.onDelete
          ) {
            event.preventDefault()
            config.onDelete(data[currentIndex]!, currentIndex)
          }
          break

        case ' ':
          if (currentIndex >= 0 && currentIndex < data.length) {
            event.preventDefault()
            const rowId = getRowId(data[currentIndex]!)
            onSelectRow?.(rowId)
          }
          break

        case 'e':
        case 'E':
          if (currentIndex >= 0 && currentIndex < data.length) {
            event.preventDefault()
            const rowId = getRowId(data[currentIndex]!)
            onExpandRow?.(rowId)
          }
          break
      }
    },
    [
      enabled,
      config,
      data,
      getRowId,
      onSelectRow,
      onExpandRow,
      focusRow,
      containerRef,
    ],
  )

  // Add event listener
  useEffect(() => {
    if (!enabled || !config?.enabled) return

    const container = containerRef.current
    if (!container) return

    container.addEventListener('keydown', handleKeyDown as EventListener)
    return () => {
      container.removeEventListener('keydown', handleKeyDown as EventListener)
    }
  }, [enabled, config?.enabled, handleKeyDown, containerRef])

  // Track focused row from click
  useEffect(() => {
    if (!enabled || !config?.enabled) return

    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement
      const rowIndex = target
        .closest('[data-row-index]')
        ?.getAttribute('data-row-index')
      if (rowIndex !== null && rowIndex !== undefined) {
        const parsed = parseInt(rowIndex, 10)
        focusedRowIndex.current = parsed
        setFocusedRowIndexState(parsed)
      }
    }

    const container = containerRef.current
    if (!container) return

    container.addEventListener('focusin', handleFocus)
    return () => {
      container.removeEventListener('focusin', handleFocus)
    }
  }, [enabled, config?.enabled, containerRef])

  return {
    focusedRowIndex: focusedRowIndexState,
    focusRow,
  }
}
