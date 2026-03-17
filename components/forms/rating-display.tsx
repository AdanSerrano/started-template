'use client'

import { Star, Heart, ThumbsUp } from 'lucide-react'
import { memo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export const RATING_ICONS: Record<string, LucideIcon> = {
  star: Star,
  heart: Heart,
  thumbsUp: ThumbsUp,
}

export const RATING_SIZES = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export const RATING_GAP_SIZES = {
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1.5',
}

export interface RatingItemProps {
  rating: number
  isFilled: boolean
  isHalfFilled: boolean
  value: number
  allowHalf: boolean
  disabled?: boolean | undefined
  Icon: LucideIcon
  sizeClass: string
  activeColor: string
  inactiveColor: string
  onMouseEnter: (rating: number) => void
  onClick: (rating: number, isHalf: boolean) => void
  isHovered: boolean
}

export const RatingItem = memo(function RatingItem({
  rating,
  isFilled,
  isHalfFilled,
  value,
  allowHalf,
  disabled,
  Icon,
  sizeClass,
  activeColor,
  inactiveColor,
  onMouseEnter,
  onClick,
  isHovered,
}: RatingItemProps) {
  const handleMouseEnter = useCallback(() => {
    if (!disabled) {
      onMouseEnter(rating)
    }
  }, [disabled, onMouseEnter, rating])

  const handleClick = useCallback(() => {
    if (!disabled) {
      onClick(rating, false)
    }
  }, [disabled, onClick, rating])

  const handleHalfClick = useCallback(() => {
    if (!disabled) {
      onClick(rating, true)
    }
  }, [disabled, onClick, rating])

  return (
    <div
      className={cn(
        'relative cursor-pointer transition-transform',
        disabled && 'cursor-not-allowed opacity-50',
        !disabled && 'hover:scale-110',
      )}
      onMouseEnter={handleMouseEnter}
    >
      {allowHalf && (
        <div
          className="absolute inset-0 z-10 w-1/2 overflow-hidden"
          onClick={handleHalfClick}
        >
          <Icon
            className={cn(
              sizeClass,
              'fill-current transition-colors',
              isHalfFilled || (value >= rating - 0.5 && value < rating)
                ? activeColor
                : isHovered
                  ? `${activeColor} opacity-50`
                  : inactiveColor,
            )}
          />
        </div>
      )}
      <Icon
        className={cn(
          sizeClass,
          'transition-colors',
          isFilled || isHovered ? `${activeColor} fill-current` : inactiveColor,
        )}
        onClick={handleClick}
      />
    </div>
  )
})
