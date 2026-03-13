'use client'

import { useSyncExternalStore } from 'react'
import { useInView } from '@/hooks/use-in-view'
import { cn } from '@/lib/utils'

function subscribeReducedMotion(callback: () => void) {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getReducedMotionServerSnapshot() {
  return false
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  )
}

type AnimationVariant =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'fade'
  | 'scale'
  | 'slide-up'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  variant?: AnimationVariant
  delay?: number
  threshold?: number
  as?: React.ElementType
}

const variantStyles: Record<
  AnimationVariant,
  { hidden: string; visible: string }
> = {
  'fade-up': {
    hidden: 'opacity-0 translate-y-8',
    visible: 'opacity-100 translate-y-0',
  },
  'fade-down': {
    hidden: 'opacity-0 -translate-y-8',
    visible: 'opacity-100 translate-y-0',
  },
  'fade-left': {
    hidden: 'opacity-0 translate-x-8',
    visible: 'opacity-100 translate-x-0',
  },
  'fade-right': {
    hidden: 'opacity-0 -translate-x-8',
    visible: 'opacity-100 translate-x-0',
  },
  fade: {
    hidden: 'opacity-0',
    visible: 'opacity-100',
  },
  scale: {
    hidden: 'opacity-0 scale-95',
    visible: 'opacity-100 scale-100',
  },
  'slide-up': {
    hidden: 'opacity-0 translate-y-12',
    visible: 'opacity-100 translate-y-0',
  },
}

export function AnimatedSection({
  children,
  className,
  variant = 'fade-up',
  delay = 0,
  threshold = 0.1,
  as: Component = 'div',
}: AnimatedSectionProps) {
  const { ref, hasBeenInView } = useInView<HTMLDivElement>({ threshold })
  const prefersReducedMotion = usePrefersReducedMotion()
  const styles = variantStyles[variant]

  const shouldAnimate = !prefersReducedMotion
  const isVisible = shouldAnimate ? hasBeenInView : true

  return (
    <Component
      ref={ref}
      className={cn(
        shouldAnimate &&
          'transition-[opacity,transform] duration-700 ease-out will-change-[opacity,transform]',
        isVisible ? styles.visible : styles.hidden,
        className,
      )}
      style={shouldAnimate ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Component>
  )
}

interface StaggerChildrenProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  variant?: AnimationVariant
  threshold?: number
  as?: React.ElementType
}

export function StaggerChildren({
  children,
  className,
  staggerDelay = 100,
  variant = 'fade-up',
  threshold = 0.1,
  as: Component = 'div',
}: StaggerChildrenProps) {
  const { ref, hasBeenInView } = useInView<HTMLDivElement>({ threshold })
  const prefersReducedMotion = usePrefersReducedMotion()
  const styles = variantStyles[variant]
  const childArray = Array.isArray(children) ? children : [children]

  const shouldAnimate = !prefersReducedMotion
  const isVisible = shouldAnimate ? hasBeenInView : true

  return (
    <Component ref={ref} className={className}>
      {childArray.map((child, i) => (
        <div
          key={i}
          className={cn(
            'flex h-full flex-col *:h-full *:flex-1',
            shouldAnimate &&
              'transition-[opacity,transform] duration-700 ease-out will-change-[opacity,transform]',
            isVisible ? styles.visible : styles.hidden,
          )}
          style={
            shouldAnimate
              ? { transitionDelay: `${i * staggerDelay}ms` }
              : undefined
          }
        >
          {child}
        </div>
      ))}
    </Component>
  )
}
