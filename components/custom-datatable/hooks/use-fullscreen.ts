'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { FullscreenConfig } from '../types'

interface UseFullscreenProps {
  enabled: boolean
  config?: FullscreenConfig | undefined
  containerRef: React.RefObject<HTMLDivElement>
}

export function useFullscreen({
  enabled,
  config,
  containerRef,
}: UseFullscreenProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Use refs for callbacks to avoid re-creating event listeners
  const configRef = useRef(config)
  const enabledRef = useRef(enabled)
  const containerRefStable = useRef(containerRef)

  // Update refs in useEffect (required by React compiler)
  useEffect(() => {
    configRef.current = config
    enabledRef.current = enabled
    containerRefStable.current = containerRef
  }, [config, enabled, containerRef])

  // Stable enter fullscreen - uses refs to avoid recreating
  const enterFullscreen = useCallback(async () => {
    if (!enabledRef.current || !configRef.current?.enabled) return

    const container = containerRefStable.current.current
    if (!container) return

    try {
      if (container.requestFullscreen) {
        await container.requestFullscreen()
      } else if (
        (
          container as HTMLDivElement & {
            webkitRequestFullscreen?: () => Promise<void>
          }
        ).webkitRequestFullscreen
      ) {
        await (
          container as HTMLDivElement & {
            webkitRequestFullscreen: () => Promise<void>
          }
        ).webkitRequestFullscreen()
      }
      setIsFullscreen(true)
      configRef.current?.onFullscreenChange?.(true)
    } catch (error) {
      console.error('Error entering fullscreen:', error)
    }
  }, []) // Empty deps - stable reference

  // Stable exit fullscreen - uses refs
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if (
        (document as Document & { webkitExitFullscreen?: () => Promise<void> })
          .webkitExitFullscreen
      ) {
        await (
          document as Document & { webkitExitFullscreen: () => Promise<void> }
        ).webkitExitFullscreen()
      }
      setIsFullscreen(false)
      configRef.current?.onFullscreenChange?.(false)
    } catch (error) {
      console.error('Error exiting fullscreen:', error)
    }
  }, []) // Empty deps - stable reference

  // Stable toggle - reads isFullscreen via ref pattern
  const isFullscreenRef = useRef(isFullscreen)
  useEffect(() => {
    isFullscreenRef.current = isFullscreen
  }, [isFullscreen])

  const toggleFullscreen = useCallback(() => {
    if (isFullscreenRef.current) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }, [enterFullscreen, exitFullscreen]) // Stable deps

  // Listen for fullscreen change events - NO config dependency
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement
      setIsFullscreen(isNowFullscreen)
      // Use ref to get latest callback without re-subscribing
      configRef.current?.onFullscreenChange?.(isNowFullscreen)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange,
      )
    }
  }, []) // Empty deps - listeners are stable

  // Handle Escape key to exit fullscreen - optimized
  useEffect(() => {
    if (!isFullscreen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        exitFullscreen()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen, exitFullscreen])

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  }
}
