'use client'

import { memo } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps, SelectOption } from './form-field.types'

export interface FormRadioGroupFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  options: SelectOption[]
  orientation?: 'horizontal' | 'vertical' | undefined
  variant?: 'default' | 'cards' | undefined
}

function FormRadioGroupFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  options,
  orientation = 'vertical',
  variant = 'default',
}: FormRadioGroupFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('space-y-3', className)}>
          {label && <FormLabel>{label}</FormLabel>}
          {description && (
            <FormDescription className="text-xs">{description}</FormDescription>
          )}
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value ?? ''}
              disabled={disabled ?? false}
              className={cn(
                orientation === 'horizontal'
                  ? 'flex flex-wrap gap-4'
                  : 'grid gap-3',
              )}
            >
              {options.map((option) =>
                variant === 'cards' ? (
                  <label
                    key={option.value}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors',
                      field.value === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50',
                      option.disabled && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <RadioGroupItem
                      value={option.value}
                      disabled={option.disabled ?? false}
                    />
                    <div className="flex-1 space-y-1">
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                      {option.description && (
                        <p className="text-muted-foreground text-xs">
                          {option.description}
                        </p>
                      )}
                    </div>
                  </label>
                ) : (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3"
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`${name}-${option.value}`}
                      disabled={option.disabled ?? false}
                    />
                    <label
                      htmlFor={`${name}-${option.value}`}
                      className={cn(
                        'cursor-pointer text-sm leading-none font-medium',
                        option.disabled && 'cursor-not-allowed opacity-50',
                      )}
                    >
                      {option.label}
                      {option.description && (
                        <p className="text-muted-foreground mt-1 text-xs font-normal">
                          {option.description}
                        </p>
                      )}
                    </label>
                  </div>
                ),
              )}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormRadioGroupField = memo(
  FormRadioGroupFieldComponent,
) as typeof FormRadioGroupFieldComponent
