import { useCallback, useRef, useMemo, useState } from 'react'
import type { TagOption } from './form-field.types'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'

interface UseTagFieldOptions {
  field: ControllerRenderProps<FieldValues, string>
  suggestions: TagOption[]
  maxTags?: number | undefined
  allowCustom: boolean
  validateTag?: ((tag: string) => boolean) | undefined
  transformTag?: ((tag: string) => string) | undefined
}

export function useTagField({
  field,
  suggestions,
  maxTags,
  allowCustom,
  validateTag,
  transformTag,
}: UseTagFieldOptions) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const tags: string[] = useMemo(() => field.value ?? [], [field.value])

  const isMaxReached = maxTags !== undefined && tags.length >= maxTags

  const filteredSuggestions = useMemo(() => {
    const input = inputValue.toLowerCase()
    return suggestions.filter(
      (s) =>
        !tags.includes(s.value) &&
        (input === '' || s.label.toLowerCase().includes(input)),
    )
  }, [suggestions, tags, inputValue])

  const addTag = useCallback(
    (value: string) => {
      if (isMaxReached) return

      let processedValue = value.trim()
      if (!processedValue) return

      if (transformTag) {
        processedValue = transformTag(processedValue)
      }

      if (validateTag && !validateTag(processedValue)) return
      if (tags.includes(processedValue)) return

      field.onChange([...tags, processedValue])
      if (inputRef.current) {
        inputRef.current.value = ''
      }
      setInputValue('')
    },
    [tags, field, isMaxReached, transformTag, validateTag],
  )

  const removeTag = useCallback(
    (tagToRemove: string) => {
      field.onChange(tags.filter((t) => t !== tagToRemove))
    },
    [tags, field],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        const value = inputRef.current?.value
        if (value && allowCustom) {
          addTag(value)
          setIsOpen(false)
          setInputValue('')
        }
      } else if (
        e.key === 'Backspace' &&
        !inputRef.current?.value &&
        tags.length > 0
      ) {
        removeTag(tags[tags.length - 1]!)
      }
    },
    [addTag, removeTag, tags, allowCustom],
  )

  const handleFocus = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
  }, [])

  const handleSelectSuggestion = useCallback(
    (value: string) => {
      addTag(value)
      setIsOpen(false)
      setInputValue('')
    },
    [addTag],
  )

  const handleOpenAutoFocus = useCallback((e: Event) => {
    e.preventDefault()
  }, [])

  const getTagLabel = useCallback(
    (tag: string) => {
      return suggestions.find((s) => s.value === tag)?.label ?? tag
    },
    [suggestions],
  )

  const getTagColor = useCallback(
    (tag: string) => {
      return suggestions.find((s) => s.value === tag)?.color
    },
    [suggestions],
  )

  return {
    inputRef,
    isOpen,
    inputValue,
    setInputValue,
    tags,
    isMaxReached,
    filteredSuggestions,
    removeTag,
    handleKeyDown,
    handleFocus,
    handleOpenChange,
    handleSelectSuggestion,
    handleOpenAutoFocus,
    getTagLabel,
    getTagColor,
  }
}
