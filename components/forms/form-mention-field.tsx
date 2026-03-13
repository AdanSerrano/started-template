'use client'

import { memo, useCallback, useRef, useMemo, useState } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AtSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from './form-field.types'

export interface MentionUser {
  id: string
  name: string
  username: string
  avatar?: string | undefined
}

export interface FormMentionFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  users: MentionUser[]
  trigger?: string | undefined
  minHeight?: number | undefined
  maxHeight?: number | undefined
  maxLength?: number | undefined
  showCharCount?: boolean | undefined
}

function getMentionState(
  text: string,
  cursorPosition: number,
  trigger: string,
): { isActive: boolean; query: string; startIndex: number } {
  const beforeCursor = text.slice(0, cursorPosition)
  const lastTriggerIndex = beforeCursor.lastIndexOf(trigger)

  if (lastTriggerIndex === -1) {
    return { isActive: false, query: '', startIndex: -1 }
  }

  const textAfterTrigger = beforeCursor.slice(lastTriggerIndex + trigger.length)

  if (textAfterTrigger.includes(' ') || textAfterTrigger.includes('\n')) {
    return { isActive: false, query: '', startIndex: -1 }
  }

  const charBeforeTrigger =
    lastTriggerIndex > 0 ? beforeCursor[lastTriggerIndex - 1] : ' '
  if (
    charBeforeTrigger !== ' ' &&
    charBeforeTrigger !== '\n' &&
    lastTriggerIndex !== 0
  ) {
    return { isActive: false, query: '', startIndex: -1 }
  }

  return {
    isActive: true,
    query: textAfterTrigger.toLowerCase(),
    startIndex: lastTriggerIndex,
  }
}

interface MentionItemProps {
  user: MentionUser
  isSelected: boolean
  onSelect: (user: MentionUser) => void
}

const MentionItem = memo(function MentionItem({
  user,
  isSelected,
  onSelect,
}: MentionItemProps) {
  const handleClick = useCallback(() => {
    onSelect(user)
  }, [user, onSelect])

  const itemClasses = useMemo(
    () =>
      cn(
        'flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent',
        isSelected && 'bg-accent',
      ),
    [isSelected],
  )

  const initials = useMemo(
    () =>
      user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    [user.name],
  )

  return (
    <div className={itemClasses} onClick={handleClick}>
      <Avatar className="h-6 w-6">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="text-muted-foreground truncate text-xs">
          @{user.username}
        </p>
      </div>
    </div>
  )
})

interface MentionContentProps {
  field: {
    value: string | undefined
    onChange: (value: string) => void
    ref: (el: HTMLTextAreaElement | null) => void
  }
  hasError: boolean
  disabled?: boolean | undefined
  placeholder?: string | undefined
  trigger: string
  minHeight: number
  maxHeight: number
  maxLength?: number | undefined
  filterUsers: (query: string) => MentionUser[]
}

const MentionContent = memo(function MentionContent({
  field,
  hasError,
  disabled,
  placeholder,
  trigger,
  minHeight,
  maxHeight,
  maxLength,
  filterUsers,
}: MentionContentProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedIndexRef = useRef(0)
  const mentionStateRef = useRef({ isActive: false, query: '', startIndex: -1 })
  const [mentionActive, setMentionActive] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')

  const insertMention = useCallback(
    (user: MentionUser) => {
      const textarea = textareaRef.current
      if (!textarea) return

      const { startIndex } = mentionStateRef.current
      const currentValue = field.value || ''
      const beforeMention = currentValue.slice(0, startIndex)
      const afterMention = currentValue.slice(textarea.selectionStart)
      const newValue = `${beforeMention}${trigger}${user.username} ${afterMention}`

      field.onChange(newValue)
      mentionStateRef.current.isActive = false
      setMentionActive(false)

      const newCursorPosition =
        startIndex + trigger.length + user.username.length + 1
      requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(newCursorPosition, newCursorPosition)
      })
    },
    [field, trigger],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      const cursorPosition = e.target.selectionStart
      const newState = getMentionState(value, cursorPosition, trigger)
      mentionStateRef.current = newState
      selectedIndexRef.current = 0
      setSelectedIndex(0)
      setMentionActive(newState.isActive)
      setMentionQuery(newState.query)
      field.onChange(value)
    },
    [field, trigger],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!mentionStateRef.current.isActive) return

      const filteredUsers = filterUsers(mentionStateRef.current.query)
      if (filteredUsers.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const next = Math.min(
          selectedIndexRef.current + 1,
          filteredUsers.length - 1,
        )
        selectedIndexRef.current = next
        setSelectedIndex(next)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const prev = Math.max(selectedIndexRef.current - 1, 0)
        selectedIndexRef.current = prev
        setSelectedIndex(prev)
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        const user = filteredUsers[selectedIndexRef.current]
        if (user) {
          insertMention(user)
        }
      } else if (e.key === 'Escape') {
        mentionStateRef.current.isActive = false
        setMentionActive(false)
      }
    },
    [filterUsers, insertMention],
  )

  const handleTextareaRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      field.ref(el)
      textareaRef.current = el
    },
    [field],
  )

  const textareaClasses = useMemo(
    () => cn('pl-10 resize-none', hasError && 'border-destructive'),
    [hasError],
  )

  const textareaStyle = useMemo(
    () => ({ minHeight, maxHeight }),
    [minHeight, maxHeight],
  )

  const filteredUsers = mentionActive ? filterUsers(mentionQuery) : []

  const isPopoverOpen = mentionActive && filteredUsers.length > 0

  return (
    <Popover open={isPopoverOpen}>
      <PopoverAnchor asChild>
        <div className="relative">
          <AtSign className="text-foreground/60 pointer-events-none absolute top-3 left-3 z-10 h-4 w-4" />
          <Textarea
            ref={handleTextareaRef}
            value={field.value ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled ?? false}
            maxLength={maxLength}
            className={textareaClasses}
            style={textareaStyle}
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        className="w-64 p-0"
        align="start"
        side="bottom"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <ScrollArea className="max-h-[200px]">
          {filteredUsers.map((user, index) => (
            <MentionItem
              key={user.id}
              user={user}
              isSelected={index === selectedIndex}
              onSelect={insertMention}
            />
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
})

function FormMentionFieldComponent<
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
  users,
  trigger = '@',
  minHeight = 100,
  maxHeight = 200,
  maxLength,
  showCharCount = false,
}: FormMentionFieldProps<TFieldValues, TName>) {
  const filterUsers = useCallback(
    (query: string): MentionUser[] => {
      if (!query) return users.slice(0, 10)
      return users
        .filter(
          (user) =>
            user.name.toLowerCase().includes(query) ||
            user.username.toLowerCase().includes(query),
        )
        .slice(0, 10)
    },
    [users],
  )

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
            <MentionContent
              field={field}
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              placeholder={placeholder}
              trigger={trigger}
              minHeight={minHeight}
              maxHeight={maxHeight}
              maxLength={maxLength}
              filterUsers={filterUsers}
            />
          </FormControl>
          <div className="flex items-center justify-between">
            {description && <FormDescription>{description}</FormDescription>}
            {showCharCount && maxLength && (
              <span className="text-muted-foreground text-xs">
                {field.value?.length ?? 0}/{maxLength}
              </span>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormMentionField = memo(
  FormMentionFieldComponent,
) as typeof FormMentionFieldComponent
