'use client'

import { useEffect, useRef, useState, RefObject } from 'react'

interface UseInViewOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

interface UseInViewReturn<T extends HTMLElement> {
  ref: RefObject<T | null>
  isInView: boolean
  hasBeenInView: boolean
}

export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {},
): UseInViewReturn<T> {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options
  const ref = useRef<T | null>(null)
  const [isInView, setIsInView] = useState(false)
  const [hasBeenInView, setHasBeenInView] = useState(false)
  // Ref para rastrear sin causar re-render del effect
  const hasBeenInViewRef = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry?.isIntersecting ?? false
        setIsInView(inView)

        if (inView && !hasBeenInViewRef.current) {
          hasBeenInViewRef.current = true
          setHasBeenInView(true)
        }

        if (triggerOnce && inView) {
          observer.unobserve(element)
        }
      },
      {
        threshold,
        rootMargin,
      },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce]) // Removido hasBeenInView de deps

  return { ref, isInView, hasBeenInView }
}
