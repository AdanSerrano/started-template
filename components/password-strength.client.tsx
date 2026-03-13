'use client'

import { useMemo } from 'react'
import {
  useWatch,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

function calculateStrength(password: string): number {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

function getStrengthConfig(score: number) {
  if (score <= 2)
    return { labelKey: 'weak' as const, color: 'bg-destructive', bars: 1 }
  if (score <= 3)
    return { labelKey: 'medium' as const, color: 'bg-warning', bars: 2 }
  if (score <= 4)
    return { labelKey: 'strong' as const, color: 'bg-success', bars: 3 }
  return { labelKey: 'veryStrong' as const, color: 'bg-success', bars: 4 }
}

export function PasswordStrengthField<T extends FieldValues>({
  control,
}: {
  control: Control<T>
}) {
  const password = useWatch({ control, name: 'password' as Path<T> }) ?? ''
  return <PasswordStrength password={password} />
}

export function PasswordStrength({ password }: { password: string }) {
  const t = useTranslations('passwordStrength')

  const strength = useMemo(() => {
    const score = calculateStrength(password)
    return getStrengthConfig(score)
  }, [password])

  if (!password) return null

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i < strength.bars ? strength.color : 'bg-muted',
            )}
          />
        ))}
      </div>
      <p
        className={cn(
          'text-xs',
          strength.bars <= 1 && 'text-destructive',
          strength.bars === 2 && 'text-warning',
          strength.bars >= 3 && 'text-success',
        )}
      >
        {t(strength.labelKey)}
      </p>
    </div>
  )
}
