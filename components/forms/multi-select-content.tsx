'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
import { memo, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { FormControl } from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { SelectedBadge } from './multi-select-badges'
import type { SelectOption } from './form-field.types'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'

export interface MultiSelectContentProps {
  field: ControllerRenderProps<FieldValues, string>
  options: SelectOption[]
  maxItems?: number | undefined
  emptyMessage: string
  searchPlaceholder: string
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline'
  placeholder?: string | undefined
  disabled?: boolean | undefined
  hasError: boolean
  triggerClassName?: string | undefined
  contentClassName?: string | undefined
}

export const MultiSelectContent = memo(function MultiSelectContent({
  field,
  options,
  maxItems,
  emptyMessage,
  searchPlaceholder,
  badgeVariant,
  placeholder,
  disabled,
  hasError,
  triggerClassName,
  contentClassName,
}: MultiSelectContentProps) {
  const selectedValues: string[] = useMemo(
    () => field.value ?? [],
    [field.value],
  )

  const selectedOptions = useMemo(
    () => options.filter((opt) => selectedValues.includes(opt.value)),
    [selectedValues, options],
  )

  const handleSelect = useCallback(
    (value: string) => {
      const isSelected = selectedValues.includes(value)
      if (isSelected) {
        field.onChange(selectedValues.filter((v) => v !== value))
      } else if (!maxItems || selectedValues.length < maxItems) {
        field.onChange([...selectedValues, value])
      }
    },
    [selectedValues, field, maxItems],
  )

  const handleRemove = useCallback(
    (value: string, e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      field.onChange(selectedValues.filter((v) => v !== value))
    },
    [selectedValues, field],
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
              'bg-background h-auto min-h-9 w-full justify-between font-normal',
              selectedValues.length === 0 && 'text-muted-foreground',
              hasError && 'border-destructive',
              triggerClassName,
            )}
          >
            <div className="flex flex-1 flex-wrap gap-1">
              {selectedOptions.length > 0 ? (
                selectedOptions.map((option) => (
                  <SelectedBadge
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    variant={badgeVariant}
                    onRemove={handleRemove}
                  />
                ))
              ) : (
                <span>{placeholder ?? 'Select...'}</span>
              )}
            </div>
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
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value)
                const isDisabled =
                  option.disabled ||
                  (!isSelected &&
                    maxItems !== undefined &&
                    selectedValues.length >= maxItems)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    disabled={isDisabled}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <div
                      className={cn(
                        'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-xs border',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </div>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {option.description && (
                        <span className="text-muted-foreground text-xs">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
})
