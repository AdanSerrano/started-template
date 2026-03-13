'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface ScrollFadeProps {
  maxHeight: string
  children: ReactNode
  className?: string
}

export function ScrollFade({
  maxHeight,
  children,
  className = '',
}: ScrollFadeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [canScroll, setCanScroll] = useState(false)
  const [atBottom, setAtBottom] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function check() {
      if (!el) return
      const hasOverflow = el.scrollHeight > el.clientHeight + 1
      setCanScroll(hasOverflow)
      setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 4)
    }

    check()
    el.addEventListener('scroll', check, { passive: true })
    const observer = new ResizeObserver(check)
    observer.observe(el)

    return () => {
      el.removeEventListener('scroll', check)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="relative">
      <div
        ref={ref}
        style={{ maxHeight }}
        className={`scrollbar-thin overflow-y-auto pr-3 ${className}`}
      >
        {children}
      </div>
      {canScroll && !atBottom && (
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 flex flex-col items-center">
          <div className="from-background/0 via-background/80 to-background h-10 w-full bg-gradient-to-b" />
          <div className="bg-background flex w-full justify-center pb-1">
            <ChevronDown className="text-muted-foreground size-4 animate-bounce" />
          </div>
        </div>
      )}
    </div>
  )
}
