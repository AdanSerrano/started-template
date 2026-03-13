'use client'

import { memo, useCallback, useMemo } from 'react'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from './form-field.types'

export interface FormColorFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  presetColors?: string[] | undefined
  showInput?: boolean | undefined
  format?: 'hex' | 'rgb' | undefined
  triggerClassName?: string | undefined
}

const DEFAULT_PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#6b7280',
  '#000000',
]

interface ColorButtonProps {
  color: string
  isSelected: boolean
  onSelect: (color: string) => void
}

const ColorButton = memo(function ColorButton({
  color,
  isSelected,
  onSelect,
}: ColorButtonProps) {
  const handleClick = useCallback(() => {
    onSelect(color)
  }, [color, onSelect])

  const buttonClasses = useMemo(
    () =>
      cn(
        'h-8 w-8 rounded-md border-2 transition-transform hover:scale-110',
        isSelected
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-transparent',
      ),
    [isSelected],
  )

  return (
    <button
      type="button"
      onClick={handleClick}
      className={buttonClasses}
      style={{ backgroundColor: color }}
    />
  )
})

interface ColorContentProps {
  field: ControllerRenderProps<FieldValues, string>
  presetColors: string[]
  showInput: boolean
  disabled?: boolean | undefined
  hasError: boolean
  triggerClassName?: string | undefined
}

const ColorContent = memo(function ColorContent({
  field,
  presetColors,
  showInput,
  disabled,
  hasError,
  triggerClassName,
}: ColorContentProps) {
  const handleColorChange = useCallback(
    (color: string) => {
      field.onChange(color)
    },
    [field],
  )

  const handleColorInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      field.onChange(e.target.value)
    },
    [field],
  )

  const triggerClasses = useMemo(
    () =>
      cn(
        'w-full justify-start bg-background font-normal',
        !field.value && 'text-muted-foreground',
        hasError && 'border-destructive',
        triggerClassName,
      ),
    [field.value, hasError, triggerClassName],
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            type="button"
            variant="outline"
            disabled={disabled ?? false}
            className={triggerClasses}
          >
            <div
              className="mr-2 h-5 w-5 rounded border"
              style={{ backgroundColor: field.value ?? '#ffffff' }}
            />
            {field.value ?? 'Select color'}
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {presetColors.map((color) => (
              <ColorButton
                key={color}
                color={color}
                isSelected={field.value === color}
                onSelect={handleColorChange}
              />
            ))}
          </div>

          {showInput && (
            <div className="flex gap-2">
              <input
                type="color"
                value={field.value ?? '#000000'}
                onChange={handleColorInputChange}
                className="h-9 w-9 cursor-pointer rounded border p-0"
              />
              <Input
                type="text"
                value={field.value ?? ''}
                onChange={handleColorInputChange}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
})

function FormColorFieldComponent<
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
  presetColors = DEFAULT_PRESET_COLORS,
  showInput = true,
  triggerClassName,
}: FormColorFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn('flex flex-col', className)}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <ColorContent
            field={
              field as unknown as ControllerRenderProps<FieldValues, string>
            }
            presetColors={presetColors}
            showInput={showInput}
            disabled={disabled ?? false}
            hasError={!!fieldState.error}
            triggerClassName={triggerClassName}
          />
          {description && (
            <FormDescription className="text-xs">{description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormColorField = memo(
  FormColorFieldComponent,
) as typeof FormColorFieldComponent
