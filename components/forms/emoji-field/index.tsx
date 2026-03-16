'use client'

import { memo, useCallback, useMemo } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import type { BaseFormFieldProps } from '../form-field.types'
import { EMOJI_CATEGORIES } from './emoji-data'
import { EmojiContent } from './emoji-picker'

export type { EmojiCategory } from './emoji-data'
export type { EmojiContentProps } from './emoji-picker'

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
