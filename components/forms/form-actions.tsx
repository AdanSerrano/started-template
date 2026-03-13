'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'

interface FormActionsProps {
  cancelHref: string
  cancelLabel?: string
  submitLabel: string
  loadingLabel: string
  isPending: boolean
  disabled?: boolean
}

export function FormActions({
  cancelHref,
  cancelLabel = 'Cancelar',
  submitLabel,
  loadingLabel,
  isPending,
  disabled,
}: FormActionsProps) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <Button type="button" variant="outline" asChild>
        <Link href={cancelHref}>{cancelLabel}</Link>
      </Button>
      <Button type="submit" disabled={isPending || disabled}>
        {isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
        {isPending ? loadingLabel : submitLabel}
      </Button>
    </div>
  )
}
