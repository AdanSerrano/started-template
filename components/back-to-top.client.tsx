'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function BackToTop() {
  const t = useTranslations('common')
  const [visible, setVisible] = useState(false)
  const ticking = useRef(false)

  useEffect(() => {
    function handleScroll() {
      // Throttle con requestAnimationFrame — evita 60+ re-renders por segundo
      if (ticking.current) return
      ticking.current = true

      requestAnimationFrame(() => {
        setVisible(window.scrollY > 500)
        ticking.current = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'bg-background/80 fixed right-6 bottom-6 z-50 size-10 rounded-full shadow-lg backdrop-blur-xs transition-[opacity,transform] duration-300',
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0',
      )}
      aria-label={t('backToTop')}
    >
      <ArrowUp className="size-4" />
    </Button>
  )
}
