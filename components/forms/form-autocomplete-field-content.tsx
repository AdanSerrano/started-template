'use client'

import { Loader2, Search } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useAutocomplete } from './use-autocomplete'
import type { SelectOption } from './form-field.types'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text

  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi',
  )
  const parts = text.split(regex)

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="rounded bg-yellow-200 px-0.5 dark:bg-yellow-800">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

interface SuggestionItemProps {
  option: SelectOption
  query: string
  highlightMatch: boolean
  onSelect: (option: SelectOption) => void
}

const SuggestionItem = memo(function SuggestionItem({
  option,
  query,
  highlightMatch,
  onSelect,
}: SuggestionItemProps) {
  const handleSelect = useCallback(() => {
    onSelect(option)
  }, [option, onSelect])

  return (
    <CommandItem
      value={option.value}
      onSelect={handleSelect}
      disabled={option.disabled ?? false}
    >
      <div className="flex flex-col">
        <span>
          {highlightMatch ? highlightText(option.label, query) : option.label}
        </span>
        {option.description && (
          <span className="text-muted-foreground text-xs">
            {option.description}
          </span>
        )}
      </div>
    </CommandItem>
  )
})

export const DEFAULT_AUTOCOMPLETE_LABELS = {
  noResults: 'No results found',
  loading: 'Loading...',
  minChars: 'Type to search...',
}

export interface AutocompleteContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  placeholder: string
  disabled?: boolean | undefined
  suggestions: SelectOption[]
  onSearch?: ((query: string) => void | Promise<void>) | undefined
  isLoading: boolean
  minChars: number
  allowFreeText: boolean
  showIcon: boolean
  labels: typeof DEFAULT_AUTOCOMPLETE_LABELS
  inputClassName?: string | undefined
  highlightMatch: boolean
}

export const AutocompleteContent = memo(function AutocompleteContent({
  field,
  hasError,
  placeholder,
  disabled,
  suggestions,
  onSearch,
  isLoading,
  minChars,
  allowFreeText,
  showIcon,
  labels,
  inputClassName,
  highlightMatch,
}: AutocompleteContentProps) {
  const {
    inputRef,
    inputValue,
    deferredValue,
    filteredSuggestions,
    handleInputChange,
    handleSelect,
    handleFocus,
    handleKeyDown,
    handleOpenChange,
    handleOpenAutoFocus,
  } = useAutocomplete({
    field,
    suggestions,
    onSearch,
    minChars,
    allowFreeText,
  })

  const showDropdown =
    inputValue.length >= minChars &&
    (filteredSuggestions.length > 0 || isLoading)

  const inputClasses = useMemo(
    () =>
      cn(
        'bg-background',
        showIcon && 'pl-10',
        hasError && 'border-destructive',
        inputClassName,
      ),
    [showIcon, hasError, inputClassName],
  )

  return (
    <Popover open={showDropdown} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className="relative">
          {showIcon && (
            <div className="text-foreground/60 pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </div>
          )}
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            disabled={disabled ?? false}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            className={inputClasses}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onOpenAutoFocus={handleOpenAutoFocus}
      >
        <Command>
          <CommandList>
            {isLoading ? (
              <div className="text-muted-foreground py-6 text-center text-sm">
                <Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin" />
                {labels.loading}
              </div>
            ) : filteredSuggestions.length === 0 ? (
              <CommandEmpty>{labels.noResults}</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredSuggestions.map((option) => (
                  <SuggestionItem
                    key={option.value}
                    option={option}
                    query={deferredValue}
                    highlightMatch={highlightMatch}
                    onSelect={handleSelect}
                  />
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
})
