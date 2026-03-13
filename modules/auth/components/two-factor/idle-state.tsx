'use client'

import { memo } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ShieldCheck, ShieldOff } from 'lucide-react'

interface IdleStateProps {
  isEnabled: boolean
  onToggle: () => void
}

export const TwoFactorIdleState = memo(function TwoFactorIdleState({
  isEnabled,
  onToggle,
}: IdleStateProps) {
  const t = useTranslations('twoFactorSettings')

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isEnabled ? (
            <ShieldCheck className="size-5 text-green-500" />
          ) : (
            <ShieldOff className="text-muted-foreground size-5" />
          )}
          <div>
            <p className="font-medium">{t('title')}</p>
            <p className="text-muted-foreground text-sm">
              {isEnabled ? t('enabledDesc') : t('disabledDesc')}
            </p>
          </div>
        </div>
        <Button variant={isEnabled ? 'outline' : 'default'} onClick={onToggle}>
          {isEnabled ? t('disable') : t('enable')}
        </Button>
      </div>
    </div>
  )
})
