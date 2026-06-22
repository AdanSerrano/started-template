'use client'

import { X } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
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
import { useTagField } from './use-tag-field'
import type { TagOption } from './form-field.types'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'

interface TagBadgeProps {
  tag: string
  label: string
  color?: string | undefined
  disabled?: boolean | undefined
  tagClassName?: string | undefined
  onRemove: (tag: string) => void
}

const TagBadge = memo(function TagBadge({
  tag,
  label,
  color,
  disabled,
  tagClassName,
  onRemove,
}: TagBadgeProps) {
  const handleRemove = useCallback(() => {
    onRemove(tag)
  }, [tag, onRemove])

  return (
    <Badge
      variant="secondary"
      className={cn('gap-1 pr-1', tagClassName)}
      style={color ? { backgroundColor: color, color: '#fff' } : undefined}
    >
      {label}
      <button
        type="button"
        onClick={handleRemove}
        disabled={disabled ?? false}
        className="ml-1 rounded-full p-0.5 hover:bg-black/20"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
})

interface SuggestionItemProps {
  suggestion: TagOption
  onSelect: (value: string) => void
}

const SuggestionItem = memo(function SuggestionItem({
  suggestion,
  onSelect,
}: SuggestionItemProps) {
  const handleSelect = useCallback(() => {
    onSelect(suggestion.value)
  }, [suggestion.value, onSelect])

  return (
    <CommandItem value={suggestion.value} onSelect={handleSelect}>
      {suggestion.color && (
        <div
          className="mr-2 h-3 w-3 rounded-full"
          style={{ backgroundColor: suggestion.color }}
        />
      )}
      {suggestion.label}
    </CommandItem>
  )
})

export const DEFAULT_TAG_LABELS = {
  add: 'Add tag',
  placeholder: 'Type to add...',
  noSuggestions: 'No suggestions found',
  maxReached: 'Maximum tags reached',
}

export interface TagContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  placeholder?: string | undefined
  disabled?: boolean | undefined
  suggestions: TagOption[]
  maxTags?: number | undefined
  allowCustom: boolean
  validateTag?: ((tag: string) => boolean) | undefined
  transformTag?: ((tag: string) => string) | undefined
  labels: typeof DEFAULT_TAG_LABELS
  tagClassName?: string | undefined
}

export const TagContent = memo(function TagContent({
  field,
  hasError,
  placeholder,
  disabled,
  suggestions,
  maxTags,
  allowCustom,
  validateTag,
  transformTag,
  labels,
  tagClassName,
}: TagContentProps) {
  const {
    inputRef,
    isOpen,
    isMaxReached,
    tags,
    filteredSuggestions,
    setInputValue,
    removeTag,
    handleKeyDown,
    handleFocus,
    handleOpenChange,
    handleSelectSuggestion,
    handleOpenAutoFocus,
    getTagLabel,
    getTagColor,
  } = useTagField({
    field,
    suggestions,
    maxTags,
    allowCustom,
    validateTag,
    transformTag,
  })

  const containerClasses = useMemo(
    () =>
      cn(
        'flex flex-wrap gap-2 p-2 rounded-md border bg-background min-h-[42px]',
        hasError && 'border-destructive',
        disabled && 'opacity-50 cursor-not-allowed',
      ),
    [hasError, disabled],
  )

  return (
    <div className={containerClasses}>
      {tags.map((tag) => (
        <TagBadge
          key={tag}
          tag={tag}
          label={getTagLabel(tag)}
          color={getTagColor(tag)}
          disabled={disabled ?? false}
          tagClassName={tagClassName}
          onRemove={removeTag}
        />
      ))}

      {!isMaxReached && (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <div className="min-w-[120px] flex-1">
              <Input
                ref={inputRef}
                placeholder={
                  isMaxReached
                    ? labels.maxReached
                    : (placeholder ?? labels.placeholder)
                }
                disabled={disabled || isMaxReached}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onChange={(e) => setInputValue(e.target.value)}
                className="h-7 border-0 p-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </PopoverTrigger>
          {(filteredSuggestions.length > 0 || allowCustom) && (
            <PopoverContent
              className="w-[200px] p-0"
              align="start"
              onOpenAutoFocus={handleOpenAutoFocus}
            >
              <Command>
                <CommandList>
                  <CommandEmpty>
                    {allowCustom ? labels.add : labels.noSuggestions}
                  </CommandEmpty>
                  <CommandGroup>
                    {filteredSuggestions.map((suggestion) => (
                      <SuggestionItem
                        key={suggestion.value}
                        suggestion={suggestion}
                        onSelect={handleSelectSuggestion}
                      />
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          )}
        </Popover>
      )}
    </div>
  )
})
