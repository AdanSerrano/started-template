'use client'

import { memo, useMemo, Fragment } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps, SelectOptions } from './form-field.types'
import { isGroupedOptions } from './form-field.types'

export interface FormSelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  options: SelectOptions
  emptyLabel?: string | undefined
  triggerClassName?: string | undefined
  contentClassName?: string | undefined
}

function FormSelectFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled,
  className,
  required,
  options,
  emptyLabel,
  triggerClassName,
  contentClassName,
}: FormSelectFieldProps<TFieldValues, TName>) {
  const isGrouped = useMemo(() => isGroupedOptions(options), [options])

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <Select
            onValueChange={field.onChange}
            value={field.value ?? ''}
            disabled={disabled ?? false}
          >
            <FormControl>
              <SelectTrigger
                className={cn(
                  'bg-background w-full',
                  fieldState.error && 'border-destructive',
                  triggerClassName,
                )}
              >
                <SelectValue placeholder={placeholder ?? emptyLabel} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className={contentClassName}>
              {isGrouped
                ? (
                    options as {
                      label: string
                      options: {
                        value: string
                        label: string
                        disabled?: boolean
                      }[]
                    }[]
                  ).map((group, groupIndex) => (
                    <Fragment key={group.label}>
                      {groupIndex > 0 && <SelectSeparator />}
                      <SelectGroup>
                        <SelectLabel>{group.label}</SelectLabel>
                        {group.options.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled ?? false}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </Fragment>
                  ))
                : (
                    options as {
                      value: string
                      label: string
                      disabled?: boolean
                    }[]
                  ).map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled ?? false}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
          {description && (
            <FormDescription className="text-xs">{description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormSelectField = memo(
  FormSelectFieldComponent,
) as typeof FormSelectFieldComponent
