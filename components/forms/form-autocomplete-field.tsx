'use client'

import {
  memo,
  useCallback,
  useRef,
  useMemo,
  useDeferredValue,
  useState,
} from 'react'
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
import { Input } from '@/components/ui/input'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Loader2, Search } from 'lucide-react'
import type { BaseFormFieldProps, SelectOption } from './form-field.types'
import { FormFieldTooltip } from './form-field-tooltip'

export interface FormAutoCompleteFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  suggestions?: SelectOption[] | undefined
  onSearch?: ((query: string) => void | Promise<void>) | undefined
  isLoading?: boolean | undefined
  minChars?: number | undefined
  debounceMs?: number | undefined
  allowFreeText?: boolean | undefined
  showIcon?: boolean | undefined
  labels?: {
    noResults?: string | undefined
    loading?: string | undefined
    minChars?: string | undefined
  }
  inputClassName?: string | undefined
  highlightMatch?: boolean | undefined
}

const DEFAULT_LABELS = {
  noResults: 'No results found',
  loading: 'Loading...',
  minChars: 'Type to search...',
}

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

interface AutocompleteContentProps {
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
  labels: typeof DEFAULT_LABELS
  inputClassName?: string | undefined
  highlightMatch: boolean
}

const AutocompleteContent = memo(function AutocompleteContent({
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
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const inputValue = field.value ?? ''
  const deferredValue = useDeferredValue(inputValue)

  const filteredSuggestions = useMemo(() => {
    if (deferredValue.length < minChars) return []
    const query = deferredValue.toLowerCase()
    return suggestions.filter(
      (s) =>
        s.label.toLowerCase().includes(query) ||
        s.value.toLowerCase().includes(query),
    )
  }, [suggestions, deferredValue, minChars])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      field.onChange(value)

      if (onSearch && value.length >= minChars) {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current)
        }
        searchTimeoutRef.current = setTimeout(() => {
          onSearch(value)
        }, 300)
      }

      if (value.length >= minChars) {
        setIsOpen(true)
      }
    },
    [field, onSearch, minChars],
  )

  const handleSelect = useCallback(
    (option: SelectOption) => {
      field.onChange(option.value)
      setIsOpen(false)
      inputRef.current?.blur()
    },
    [field],
  )

  const handleFocus = useCallback(() => {
    if (inputValue.length >= minChars) {
      setIsOpen(true)
    }
  }, [inputValue, minChars])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      } else if (
        e.key === 'Enter' &&
        !allowFreeText &&
        filteredSuggestions.length > 0
      ) {
        e.preventDefault()
        handleSelect(filteredSuggestions[0]!)
      }
    },
    [allowFreeText, filteredSuggestions, handleSelect],
  )

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
  }, [])

  const handleOpenAutoFocus = useCallback((e: Event) => {
    e.preventDefault()
  }, [])

  const showDropdown =
    isOpen &&
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

function FormAutoCompleteFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = 'Type to search...',
  disabled,
  className,
  required,
  tooltip,
  suggestions = [],
  onSearch,
  isLoading = false,
  minChars = 1,
  allowFreeText = true,
  showIcon = true,
  labels,
  inputClassName,
  highlightMatch = true,
}: FormAutoCompleteFieldProps<TFieldValues, TName>) {
  const mergedLabels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labels }) as typeof DEFAULT_LABELS,
    [labels],
  )

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
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
            <AutocompleteContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              placeholder={placeholder}
              disabled={disabled ?? false}
              suggestions={suggestions}
              onSearch={onSearch}
              isLoading={isLoading}
              minChars={minChars}
              allowFreeText={allowFreeText}
              showIcon={showIcon}
              labels={mergedLabels}
              inputClassName={inputClassName}
              highlightMatch={highlightMatch}
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

export const FormAutoCompleteField = memo(
  FormAutoCompleteFieldComponent,
) as typeof FormAutoCompleteFieldComponent
