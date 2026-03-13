'use client'

import { memo, useMemo, useCallback } from 'react'
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import type { BaseFormFieldProps, SelectOption } from './form-field.types'

export interface FormComboboxFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  options: SelectOption[]
  emptyMessage?: string | undefined
  searchPlaceholder?: string | undefined
  triggerClassName?: string | undefined
  contentClassName?: string | undefined
}

interface ComboboxContentProps {
  field: ControllerRenderProps<FieldValues, string>
  options: SelectOption[]
  emptyMessage: string
  searchPlaceholder: string
  placeholder?: string | undefined
  disabled?: boolean | undefined
  hasError: boolean
  triggerClassName?: string | undefined
  contentClassName?: string | undefined
}

const ComboboxContent = memo(function ComboboxContent({
  field,
  options,
  emptyMessage,
  searchPlaceholder,
  placeholder,
  disabled,
  hasError,
  triggerClassName,
  contentClassName,
}: ComboboxContentProps) {
  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === field.value),
    [field.value, options],
  )

  const handleSelect = useCallback(
    (value: string) => {
      field.onChange(value === field.value ? '' : value)
    },
    [field],
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            disabled={disabled ?? false}
            className={cn(
              'bg-background w-full justify-between font-normal',
              !field.value && 'text-muted-foreground',
              hasError && 'border-destructive',
              triggerClassName,
            )}
          >
            {selectedOption?.label ?? placeholder ?? 'Select...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'w-[--radix-popover-trigger-width] p-0',
          contentClassName,
        )}
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled ?? false}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      field.value === option.value
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.description && (
                      <span className="text-muted-foreground text-xs">
                        {option.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
})

function FormComboboxFieldComponent<
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
  emptyMessage = 'No results found.',
  searchPlaceholder = 'Search...',
  triggerClassName,
  contentClassName,
}: FormComboboxFieldProps<TFieldValues, TName>) {
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
          <ComboboxContent
            field={
              field as unknown as ControllerRenderProps<FieldValues, string>
            }
            options={options}
            emptyMessage={emptyMessage}
            searchPlaceholder={searchPlaceholder}
            placeholder={placeholder}
            disabled={disabled ?? false}
            hasError={!!fieldState.error}
            triggerClassName={triggerClassName}
            contentClassName={contentClassName}
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

export const FormComboboxField = memo(
  FormComboboxFieldComponent,
) as typeof FormComboboxFieldComponent
