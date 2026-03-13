'use client'

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ theme: themeProp, ...props }: ToasterProps) => {
  const { theme: resolvedTheme } = useTheme()
  const appliedTheme =
    themeProp ?? (resolvedTheme as ToasterProps['theme']) ?? 'system'

  return (
    <Sonner
      theme={appliedTheme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'var(--success)',
          '--success-text': 'var(--success-foreground)',
          '--success-border': 'var(--success)',
          '--warning-bg': 'var(--warning)',
          '--warning-text': 'var(--warning-foreground)',
          '--warning-border': 'var(--warning)',
          '--error-bg': 'var(--destructive)',
          '--error-text': 'var(--destructive-foreground)',
          '--error-border': 'var(--destructive)',
          '--info-bg': 'var(--info)',
          '--info-text': 'var(--info-foreground)',
          '--info-border': 'var(--info)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
