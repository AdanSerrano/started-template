'use client'

import { AtSign } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useMentionField } from './use-mention-field'
import type { BaseFormFieldProps } from './form-field.types'
import type { FieldPath, FieldValues } from 'react-hook-form'

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

const MentionItem = memo(function MentionItem({
  user,
  isSelected,
  onSelect,
}: {
  user: MentionUser
  isSelected: boolean
  onSelect: (user: MentionUser) => void
}) {
  const handleClick = useCallback(() => onSelect(user), [user, onSelect])
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
  const {
    selectedIndex,
    insertMention,
    handleChange,
    handleKeyDown,
    handleTextareaRef,
    filteredUsers,
    isPopoverOpen,
  } = useMentionField({ field, trigger, filterUsers })
  const textareaClasses = useMemo(
    () => cn('pl-10 resize-none', hasError && 'border-destructive'),
    [hasError],
  )
  const textareaStyle = useMemo(
    () => ({ minHeight, maxHeight }),
    [minHeight, maxHeight],
  )

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
