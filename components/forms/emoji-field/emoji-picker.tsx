'use client'

import { Smile, Search } from 'lucide-react'
import { memo, useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { EmojiCategory } from './emoji-data'

interface EmojiButtonProps {
  emoji: string
  onSelect: (emoji: string) => void
}

const EmojiButton = memo(function EmojiButton({
  emoji,
  onSelect,
}: EmojiButtonProps) {
  const handleClick = useCallback(() => {
    onSelect(emoji)
  }, [emoji, onSelect])

  return (
    <button
      type="button"
      className="hover:bg-accent flex h-8 w-8 items-center justify-center rounded text-xl transition-colors"
      onClick={handleClick}
    >
      {emoji}
    </button>
  )
})

const EmojiGrid = memo(function EmojiGrid({
  emojis,
  onSelect,
}: {
  emojis: string[]
  onSelect: (emoji: string) => void
}) {
  return (
    <div className="grid grid-cols-8 gap-1 p-2">
      {emojis.map((emoji, index) => (
        <EmojiButton
          key={`${emoji}-${index}`}
          emoji={emoji}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
})

interface SelectedEmojiButtonProps {
  emoji: string
  onRemove: (emoji: string) => void
}

const SelectedEmojiButton = memo(function SelectedEmojiButton({
  emoji,
  onRemove,
}: SelectedEmojiButtonProps) {
  const handleClick = useCallback(() => {
    onRemove(emoji)
  }, [emoji, onRemove])

  return (
    <button
      type="button"
      className="hover:bg-destructive/10 hover:border-destructive flex h-8 w-8 items-center justify-center rounded border text-lg transition-colors"
      onClick={handleClick}
      title="Remove"
    >
      {emoji}
    </button>
  )
})

export interface EmojiContentProps {
  field: {
    value: string | string[] | undefined
    onChange: (value: string | string[]) => void
  }
  hasError: boolean
  disabled?: boolean | undefined
  placeholder: string
  multiple: boolean
  maxEmojis: number
  showSearch: boolean
  showPreview: boolean
  categoriesWithRecent: EmojiCategory[]
  recentEmojis: string[]
  addToRecent: (emoji: string) => void
  searchEmojis: (query: string) => string[]
}

export const EmojiContent = memo(function EmojiContent({
  field,
  hasError,
  disabled,
  placeholder,
  multiple,
  maxEmojis,
  showSearch,
  showPreview,
  categoriesWithRecent,
  recentEmojis,
  addToRecent,
  searchEmojis,
}: EmojiContentProps) {
  const [searchValue, setSearchValue] = useState('')

  const selectedEmojis: string[] = useMemo(() => {
    if (multiple) {
      return Array.isArray(field.value) ? field.value : []
    }
    return field.value ? [field.value as string] : []
  }, [multiple, field.value])

  const handleSelect = useCallback(
    (emoji: string) => {
      addToRecent(emoji)

      if (multiple) {
        const isSelected = selectedEmojis.includes(emoji)
        if (isSelected) {
          field.onChange(selectedEmojis.filter((e) => e !== emoji))
        } else if (selectedEmojis.length < maxEmojis) {
          field.onChange([...selectedEmojis, emoji])
        }
      } else {
        field.onChange(emoji)
      }
    },
    [addToRecent, multiple, selectedEmojis, maxEmojis, field],
  )

  const handleRemove = useCallback(
    (emoji: string) => {
      if (multiple) {
        field.onChange(selectedEmojis.filter((e) => e !== emoji))
      } else {
        field.onChange('')
      }
    },
    [multiple, selectedEmojis, field],
  )

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value)
    },
    [],
  )

  const triggerClasses = useMemo(
    () =>
      cn('w-full justify-start font-normal', hasError && 'border-destructive'),
    [hasError],
  )

  const searchResults = useMemo(
    () => (searchValue ? searchEmojis(searchValue) : []),
    [searchValue, searchEmojis],
  )

  const defaultTab = useMemo(
    () => (recentEmojis.length > 0 ? 'recent' : 'smileys'),
    [recentEmojis.length],
  )

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled ?? false}
            className={triggerClasses}
          >
            <Smile className="text-foreground/60 mr-2 h-4 w-4" />
            {selectedEmojis.length > 0 ? (
              <span className="text-lg">{selectedEmojis.join(' ')}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          {showSearch && (
            <div className="border-b p-2">
              <div className="relative">
                <Search className="text-foreground/60 pointer-events-none absolute top-1/2 left-2 z-10 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search emojis..."
                  className="h-8 pl-8"
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          )}

          {searchValue ? (
            <ScrollArea className="h-[250px]">
              <EmojiGrid emojis={searchResults} onSelect={handleSelect} />
            </ScrollArea>
          ) : (
            <Tabs defaultValue={defaultTab}>
              <TabsList className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
                {categoriesWithRecent.map((cat) => {
                  if (cat.id === 'recent' && cat.emojis.length === 0)
                    return null
                  const Icon = cat.icon
                  return (
                    <TabsTrigger
                      key={cat.id}
                      value={cat.id}
                      className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-3 py-2 data-[state=active]:bg-transparent"
                    >
                      <Icon className="h-4 w-4" />
                    </TabsTrigger>
                  )
                })}
              </TabsList>
              {categoriesWithRecent.map((cat) => {
                if (cat.id === 'recent' && cat.emojis.length === 0) return null
                return (
                  <TabsContent key={cat.id} value={cat.id} className="mt-0">
                    <ScrollArea className="h-[200px]">
                      <EmojiGrid emojis={cat.emojis} onSelect={handleSelect} />
                    </ScrollArea>
                  </TabsContent>
                )
              })}
            </Tabs>
          )}
        </PopoverContent>
      </Popover>

      {showPreview && selectedEmojis.length > 0 && multiple && (
        <div className="flex flex-wrap gap-1">
          {selectedEmojis.map((emoji, index) => (
            <SelectedEmojiButton
              key={`${emoji}-${index}`}
              emoji={emoji}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  )
})
