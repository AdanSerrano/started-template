'use client'

import { memo, type ReactNode } from 'react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TooltipConfig } from './form-field.types'

export interface FormFieldTooltipProps {
  tooltip: TooltipConfig | string
  className?: string | undefined
}

function FormFieldTooltipComponent({
  tooltip,
  className,
}: FormFieldTooltipProps) {
  const config: TooltipConfig =
    typeof tooltip === 'string' ? { content: tooltip } : tooltip

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className={cn(
            'text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition-colors',
            className,
          )}
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side={config.side ?? 'top'}
        align={config.align ?? 'center'}
        className="w-64 text-sm"
      >
        {config.content}
      </HoverCardContent>
    </HoverCard>
  )
}

export const FormFieldTooltip = memo(FormFieldTooltipComponent)
FormFieldTooltip.displayName = 'FormFieldTooltip'

export interface FormLabelWithTooltipProps {
  label: ReactNode
  required?: boolean | undefined
  tooltip?: TooltipConfig | string | undefined
  labelExtra?: ReactNode | undefined
}

function FormLabelWithTooltipComponent({
  label,
  required,
  tooltip,
  labelExtra,
}: FormLabelWithTooltipProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </span>
        {tooltip && <FormFieldTooltip tooltip={tooltip} />}
      </div>
      {labelExtra}
    </div>
  )
}

export const FormLabelWithTooltip = memo(FormLabelWithTooltipComponent)
FormLabelWithTooltip.displayName = 'FormLabelWithTooltip'
