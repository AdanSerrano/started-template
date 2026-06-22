'use client'

import { memo, useCallback } from 'react'
import { Button } from '@/components/ui/button'

export interface HourButtonProps {
  hour: number
  isSelected: boolean
  computedHour: number
  currentMinutes: number
  onSelect: (h: number, m: number) => void
}

export const HourButton = memo(function HourButton({
  hour,
  isSelected,
  computedHour,
  currentMinutes,
  onSelect,
}: HourButtonProps) {
  const handleClick = useCallback(() => {
    onSelect(computedHour, currentMinutes)
  }, [computedHour, currentMinutes, onSelect])

  return (
    <Button
      type="button"
      variant={isSelected ? 'default' : 'ghost'}
      size="sm"
      className="mb-1 w-full"
      onClick={handleClick}
    >
      {hour.toString().padStart(2, '0')}
    </Button>
  )
})

export interface MinuteButtonProps {
  minute: number
  isSelected: boolean
  isDisabled: boolean
  currentHours: number
  onSelect: (h: number, m: number) => void
}

export const MinuteButton = memo(function MinuteButton({
  minute,
  isSelected,
  isDisabled,
  currentHours,
  onSelect,
}: MinuteButtonProps) {
  const handleClick = useCallback(() => {
    onSelect(currentHours, minute)
  }, [currentHours, minute, onSelect])

  return (
    <Button
      type="button"
      variant={isSelected ? 'default' : 'ghost'}
      size="sm"
      className="mb-1 w-full"
      disabled={isDisabled}
      onClick={handleClick}
    >
      {minute.toString().padStart(2, '0')}
    </Button>
  )
})

export interface PeriodButtonProps {
  period: 'AM' | 'PM'
  isSelected: boolean
  onSelect: (period: 'AM' | 'PM') => void
}

export const PeriodButton = memo(function PeriodButton({
  period,
  isSelected,
  onSelect,
}: PeriodButtonProps) {
  const handleClick = useCallback(() => {
    onSelect(period)
  }, [period, onSelect])

  return (
    <Button
      type="button"
      variant={isSelected ? 'default' : 'ghost'}
      size="sm"
      onClick={handleClick}
    >
      {period}
    </Button>
  )
})
