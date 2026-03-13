'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import { Link } from '@/i18n/navigation'

interface FormSuccessScreenProps {
  message: string
  backHref: string
  backLabel: string
}

export function FormSuccessScreen({
  message,
  backHref,
  backLabel,
}: FormSuccessScreenProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-12">
      <CheckCircle className="size-12 text-green-500" />
      <p className="text-lg font-medium">{message}</p>
      <Button asChild variant="outline">
        <Link href={backHref}>{backLabel}</Link>
      </Button>
    </div>
  )
}
