'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingIndicatorProps {
  isPending: boolean | undefined
  isLoading: boolean | undefined
}

export function TableLoadingIndicator({
  isPending,
  isLoading,
}: LoadingIndicatorProps) {
  return (
    <div
      className={cn(
        'absolute top-2 right-2 z-10 transition-all duration-200 ease-out',
        isPending && !isLoading
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none -translate-y-2 opacity-0',
      )}
      role="status"
      aria-live="polite"
    >
      <div className="bg-primary/10 border-primary/20 flex items-center gap-1.5 rounded-full border px-2.5 py-1 shadow-xs backdrop-blur-xs">
        <Loader2
          className="text-primary h-3 w-3 animate-spin"
          aria-hidden="true"
        />
        <span className="text-primary text-xs font-medium">
          {isLoading ? undefined : 'Actualizando'}
        </span>
      </div>
    </div>
  )
}
