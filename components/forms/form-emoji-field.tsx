'use client'

import { memo, useCallback, useMemo, useState } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Smile,
  Search,
  Clock,
  Star,
  Coffee,
  Heart,
  Leaf,
  Flag,
  Hash,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from './form-field.types'

interface EmojiCategory {
  id: string
  name: string
  icon: React.ElementType
  emojis: string[]
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'recent',
    name: 'Recent',
    icon: Clock,
    emojis: [],
  },
  {
    id: 'smileys',
    name: 'Smileys',
    icon: Smile,
    emojis: [
      '😀',
      '😃',
      '😄',
      '😁',
      '😅',
      '😂',
      '🤣',
      '😊',
      '😇',
      '🙂',
      '😉',
      '😌',
      '😍',
      '🥰',
      '😘',
      '😋',
      '😛',
      '😜',
      '🤪',
      '😝',
      '🤑',
      '🤗',
      '🤭',
      '🤫',
      '🤔',
      '🤐',
      '🤨',
      '😐',
      '😑',
      '😶',
      '😏',
      '😒',
      '🙄',
      '😬',
      '😮‍💨',
      '🤥',
      '😌',
      '😔',
      '😪',
      '🤤',
      '😴',
      '😷',
      '🤒',
      '🤕',
      '🤢',
      '🤮',
      '🥴',
      '😵',
      '🤯',
      '🤠',
      '🥳',
      '🥸',
      '😎',
      '🤓',
      '🧐',
    ],
  },
  {
    id: 'love',
    name: 'Love',
    icon: Heart,
    emojis: [
      '❤️',
      '🧡',
      '💛',
      '💚',
      '💙',
      '💜',
      '🖤',
      '🤍',
      '🤎',
      '💔',
      '❣️',
      '💕',
      '💞',
      '💓',
      '💗',
      '💖',
      '💘',
      '💝',
      '💟',
      '♥️',
      '😍',
      '🥰',
      '😘',
      '😻',
      '💑',
      '👩‍❤️‍👨',
      '👨‍❤️‍👨',
      '👩‍❤️‍👩',
      '💏',
      '💋',
      '🌹',
      '🌷',
      '🌸',
    ],
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: Leaf,
    emojis: [
      '🌸',
      '💮',
      '🏵️',
      '🌹',
      '🥀',
      '🌺',
      '🌻',
      '🌼',
      '🌷',
      '🌱',
      '🪴',
      '🌲',
      '🌳',
      '🌴',
      '🌵',
      '🌾',
      '🌿',
      '☘️',
      '🍀',
      '🍁',
      '🍂',
      '🍃',
      '🐶',
      '🐱',
      '🐭',
      '🐹',
      '🐰',
      '🦊',
      '🐻',
      '🐼',
      '🐨',
      '🐯',
      '🦁',
      '🐮',
      '🐷',
      '🐸',
      '🐵',
      '🐔',
      '🐧',
      '🐦',
      '🐤',
      '🦆',
      '🦅',
      '🦉',
      '🦇',
    ],
  },
  {
    id: 'food',
    name: 'Food',
    icon: Coffee,
    emojis: [
      '🍎',
      '🍐',
      '🍊',
      '🍋',
      '🍌',
      '🍉',
      '🍇',
      '🍓',
      '🫐',
      '🍈',
      '🍒',
      '🍑',
      '🥭',
      '🍍',
      '🥥',
      '🥝',
      '🍅',
      '🍆',
      '🥑',
      '🥦',
      '🥬',
      '🥒',
      '🌶️',
      '🫑',
      '🌽',
      '🥕',
      '🫒',
      '🧄',
      '🧅',
      '🥔',
      '🍠',
      '🥐',
      '🥖',
      '🍞',
      '🥨',
      '🥯',
      '🧀',
      '🥚',
      '🍳',
      '🧈',
      '🥞',
      '🧇',
      '🥓',
      '🥩',
      '🍗',
      '🍖',
      '🌭',
      '🍔',
      '🍟',
      '🍕',
      '🫓',
      '🥪',
      '🥙',
      '🧆',
      '🌮',
      '🌯',
      '🫔',
      '🥗',
    ],
  },
  {
    id: 'activities',
    name: 'Activities',
    icon: Star,
    emojis: [
      '⚽',
      '🏀',
      '🏈',
      '⚾',
      '🥎',
      '🎾',
      '🏐',
      '🏉',
      '🥏',
      '🎱',
      '🪀',
      '🏓',
      '🏸',
      '🏒',
      '🏑',
      '🥍',
      '🏏',
      '🪃',
      '🥅',
      '⛳',
      '🪁',
      '🏹',
      '🎣',
      '🤿',
      '🥊',
      '🥋',
      '🎽',
      '🛹',
      '🛼',
      '🛷',
      '⛸️',
      '🥌',
      '🎿',
      '⛷️',
      '🏂',
      '🪂',
      '🏋️',
      '🤼',
      '🤸',
      '⛹️',
      '🤺',
      '🤾',
      '🏌️',
      '🏇',
      '🧘',
      '🏄',
      '🏊',
      '🤽',
      '🚣',
      '🧗',
      '🚴',
      '🚵',
      '🎪',
      '🎭',
      '🎨',
      '🎬',
      '🎤',
      '🎧',
      '🎼',
    ],
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: Flag,
    emojis: [
      '🚗',
      '🚕',
      '🚙',
      '🚌',
      '🚎',
      '🏎️',
      '🚓',
      '🚑',
      '🚒',
      '🚐',
      '🛻',
      '🚚',
      '🚛',
      '🚜',
      '🏍️',
      '🛵',
      '🚲',
      '🛴',
      '🛹',
      '🛼',
      '🚁',
      '✈️',
      '🛩️',
      '🛫',
      '🛬',
      '🪂',
      '💺',
      '🚀',
      '🛸',
      '🚂',
      '🚃',
      '🚄',
      '🚅',
      '🚆',
      '🚇',
      '🚈',
      '🚉',
      '🚊',
      '🚝',
      '🚞',
      '🚋',
      '🚃',
      '⛵',
      '🛥️',
      '🚤',
      '🛳️',
      '⛴️',
      '🚢',
      '⚓',
      '🪝',
      '⛽',
      '🚧',
    ],
  },
  {
    id: 'symbols',
    name: 'Symbols',
    icon: Hash,
    emojis: [
      '❤️',
      '🧡',
      '💛',
      '💚',
      '💙',
      '💜',
      '🖤',
      '🤍',
      '🤎',
      '💔',
      '❤️‍🔥',
      '❤️‍🩹',
      '❣️',
      '💕',
      '💞',
      '💓',
      '💗',
      '💖',
      '💘',
      '💝',
      '💟',
      '☮️',
      '✝️',
      '☪️',
      '🕉️',
      '☸️',
      '✡️',
      '🔯',
      '🕎',
      '☯️',
      '☦️',
      '🛐',
      '⛎',
      '♈',
      '♉',
      '♊',
      '♋',
      '♌',
      '♍',
      '♎',
      '♏',
      '♐',
      '♑',
      '♒',
      '♓',
      '🆔',
      '⚛️',
      '🉑',
      '☢️',
      '☣️',
      '📴',
      '📳',
      '🈶',
      '🈚',
    ],
  },
]

export interface FormEmojiFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  multiple?: boolean | undefined
  maxEmojis?: number | undefined
  showSearch?: boolean | undefined
  showPreview?: boolean | undefined
  recentEmojis?: string[] | undefined
  onRecentChange?: ((emojis: string[]) => void) | undefined
}

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

interface EmojiContentProps {
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

const EmojiContent = memo(function EmojiContent({
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

function FormEmojiFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = 'Select emoji...',
  disabled,
  className,
  required,
  multiple = false,
  maxEmojis = 10,
  showSearch = true,
  showPreview = true,
  recentEmojis = [],
  onRecentChange,
}: FormEmojiFieldProps<TFieldValues, TName>) {
  const categoriesWithRecent = useMemo(() => {
    const cats = [...EMOJI_CATEGORIES]
    cats[0] = { ...cats[0]!, emojis: recentEmojis }
    return cats
  }, [recentEmojis])

  const addToRecent = useCallback(
    (emoji: string) => {
      if (!onRecentChange) return
      const newRecent = [
        emoji,
        ...recentEmojis.filter((e) => e !== emoji),
      ].slice(0, 20)
      onRecentChange(newRecent)
    },
    [recentEmojis, onRecentChange],
  )

  const searchEmojis = useCallback((query: string): string[] => {
    if (!query) return []
    const q = query.toLowerCase()
    const results: string[] = []

    EMOJI_CATEGORIES.forEach((cat) => {
      if (cat.name.toLowerCase().includes(q)) {
        results.push(...cat.emojis.slice(0, 10))
      }
    })

    return results.slice(0, 50)
  }, [])

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
          <FormControl>
            <EmojiContent
              field={field}
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              placeholder={placeholder}
              multiple={multiple}
              maxEmojis={maxEmojis}
              showSearch={showSearch}
              showPreview={showPreview}
              categoriesWithRecent={categoriesWithRecent}
              recentEmojis={recentEmojis}
              addToRecent={addToRecent}
              searchEmojis={searchEmojis}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormEmojiField = memo(
  FormEmojiFieldComponent,
) as typeof FormEmojiFieldComponent
