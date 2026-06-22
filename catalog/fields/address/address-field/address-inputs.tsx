'use client'

import { memo, useCallback, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { AddressInputProps, AddressSelectProps } from './types'

export const AddressInput = memo(function AddressInput({
  icon: Icon,
  label,
  value,
  placeholder,
  onChange,
  disabled,
  className,
  error,
}: AddressInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value)
    },
    [onChange],
  )

  const inputClasses = useMemo(
    () => cn('bg-background', error && 'border-destructive'),
    [error],
  )

  return (
    <div className={cn('space-y-1', className)}>
      <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
        <Icon className="h-3 w-3" />
        {label}
      </label>
      <Input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled ?? false}
        className={inputClasses}
      />
    </div>
  )
})

export const AddressSelect = memo(function AddressSelect({
  icon: Icon,
  label,
  value,
  placeholder,
  options,
  onChange,
  disabled,
  className,
  error,
}: AddressSelectProps) {
  const triggerClasses = useMemo(
    () => cn('bg-background', error && 'border-destructive'),
    [error],
  )

  return (
    <div className={cn('space-y-1', className)}>
      <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
        <Icon className="h-3 w-3" />
        {label}
      </label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled ?? false}
      >
        <SelectTrigger className={triggerClasses}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
})
