'use client'

import { memo, useCallback, useMemo, useState } from 'react'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { Star, Heart, ThumbsUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { BaseFormFieldProps } from './form-field.types'
import { FormFieldTooltip } from './form-field-tooltip'

export interface FormRatingFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  max?: number | undefined
  icon?: 'star' | 'heart' | 'thumbsUp' | LucideIcon | undefined
  size?: 'sm' | 'md' | 'lg' | undefined
  allowHalf?: boolean | undefined
  allowClear?: boolean | undefined
  showValue?: boolean | undefined
  labels?: string[] | undefined
  activeColor?: string | undefined
  inactiveColor?: string | undefined
}

const ICONS: Record<string, LucideIcon> = {
  star: Star,
  heart: Heart,
  thumbsUp: ThumbsUp,
}

const SIZES = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

const GAP_SIZES = {
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1.5',
}

interface RatingItemProps {
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

const RatingItem = memo(function RatingItem({
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

interface RatingContentProps {
  field: ControllerRenderProps<FieldValues, string>
  max: number
  Icon: LucideIcon
  size: 'sm' | 'md' | 'lg'
  allowHalf: boolean
  allowClear: boolean
  showValue: boolean
  labels?: string[] | undefined
  activeColor: string
  inactiveColor: string
  disabled?: boolean | undefined
}

const RatingContent = memo(function RatingContent({
  field,
  max,
  Icon,
  size,
  allowHalf,
  allowClear,
  showValue,
  labels,
  activeColor,
  inactiveColor,
  disabled,
}: RatingContentProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const value: number = field.value ?? 0

  const sizeClass = SIZES[size]
  const gapClass = GAP_SIZES[size]

  const ratingItems = useMemo(() => {
    return Array.from({ length: max }, (_, i) => i + 1)
  }, [max])

  const handleClick = useCallback(
    (rating: number, isHalf: boolean = false) => {
      const newValue = isHalf ? rating - 0.5 : rating
      if (allowClear && value === newValue) {
        field.onChange(0)
      } else {
        field.onChange(newValue)
      }
    },
    [field, value, allowClear],
  )

  const handleMouseEnter = useCallback((rating: number) => {
    setHoverValue(rating)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoverValue(null)
  }, [])

  const currentLabel = useMemo(() => {
    if (labels && labels[Math.ceil(value) - 1]) {
      return labels[Math.ceil(value) - 1]
    }
    return null
  }, [labels, value])

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn('flex items-center', gapClass)}
        onMouseLeave={handleMouseLeave}
      >
        {ratingItems.map((rating) => (
          <RatingItem
            key={rating}
            rating={rating}
            isFilled={rating <= value}
            isHalfFilled={allowHalf && rating - 0.5 === value}
            value={value}
            allowHalf={allowHalf}
            disabled={disabled ?? false}
            Icon={Icon}
            sizeClass={sizeClass}
            activeColor={activeColor}
            inactiveColor={inactiveColor}
            onMouseEnter={handleMouseEnter}
            onClick={handleClick}
            isHovered={hoverValue !== null && rating <= hoverValue}
          />
        ))}
      </div>
      {showValue && (
        <span className="min-w-[2rem] text-sm font-medium">
          {value > 0 ? value : '-'}
        </span>
      )}
      {currentLabel && (
        <span className="text-muted-foreground text-sm">{currentLabel}</span>
      )}
    </div>
  )
})

function FormRatingFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  required,
  tooltip,
  max = 5,
  icon = 'star',
  size = 'md',
  allowHalf = false,
  allowClear = true,
  showValue = false,
  labels,
  activeColor = 'text-yellow-500',
  inactiveColor = 'text-muted-foreground/30',
}: FormRatingFieldProps<TFieldValues, TName>) {
  const Icon = typeof icon === 'string' ? (ICONS[icon] ?? Star) : icon

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <div className="flex items-center gap-1.5">
              <FormLabel>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              {tooltip && <FormFieldTooltip tooltip={tooltip} />}
            </div>
          )}
          <FormControl>
            <RatingContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              max={max}
              Icon={Icon}
              size={size}
              allowHalf={allowHalf}
              allowClear={allowClear}
              showValue={showValue}
              labels={labels}
              activeColor={activeColor}
              inactiveColor={inactiveColor}
              disabled={disabled ?? false}
            />
          </FormControl>
          {description && (
            <FormDescription className="text-xs">{description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormRatingField = memo(
  FormRatingFieldComponent,
) as typeof FormRatingFieldComponent
