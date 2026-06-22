import { useCallback, useRef, useMemo, useDeferredValue, useState } from 'react'
import type { SelectOption } from './form-field.types'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'

interface UseAutocompleteOptions {
  field: ControllerRenderProps<FieldValues, string>
  suggestions: SelectOption[]
  onSearch?: ((query: string) => void | Promise<void>) | undefined
  minChars: number
  allowFreeText: boolean
}

export function useAutocomplete({
  field,
  suggestions,
  onSearch,
  minChars,
  allowFreeText,
}: UseAutocompleteOptions) {
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
    (filteredSuggestions.length > 0 || false)

  return {
    inputRef,
    inputValue,
    deferredValue,
    filteredSuggestions,
    showDropdown,
    handleInputChange,
    handleSelect,
    handleFocus,
    handleKeyDown,
    handleOpenChange,
    handleOpenAutoFocus,
  }
}
