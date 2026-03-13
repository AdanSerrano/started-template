'use client'

import { memo, useCallback } from 'react'
import type { FieldValues, ArrayPath, FieldArray } from 'react-hook-form'
import { useFieldArray, type Control } from 'react-hook-form'
import {
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FormArrayFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends ArrayPath<TFieldValues> = ArrayPath<TFieldValues>,
> {
  control: Control<TFieldValues>
  name: TName
  label?: string | undefined
  description?: string | undefined
  required?: boolean | undefined
  disabled?: boolean | undefined
  className?: string | undefined
  minItems?: number | undefined
  maxItems?: number | undefined
  defaultValue?: FieldArray<TFieldValues, TName> | undefined
  showReorder?: boolean | undefined
  showIndex?: boolean | undefined
  addButtonLabel?: string | undefined
  emptyMessage?: string | undefined
  renderItem: (props: {
    index: number
    field: Record<'id', string>
    remove: () => void
    isFirst: boolean
    isLast: boolean
  }) => React.ReactNode
}

const ArrayItemControls = memo(function ArrayItemControls({
  index,
  showIndex,
  showReorder,
  canMoveUp,
  canMoveDown,
  canRemove,
  onMoveUp,
  onMoveDown,
  onRemove,
  disabled,
}: {
  index: number
  showIndex: boolean
  showReorder: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  canRemove: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  disabled?: boolean | undefined
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      {showIndex && (
        <span className="text-muted-foreground w-6 text-center font-mono text-xs">
          {index + 1}
        </span>
      )}
      {showReorder && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onMoveUp}
            disabled={disabled || !canMoveUp}
            aria-label="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onMoveDown}
            disabled={disabled || !canMoveDown}
            aria-label="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive h-7 w-7"
        onClick={onRemove}
        disabled={disabled || !canRemove}
        aria-label="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
})

function FormArrayFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends ArrayPath<TFieldValues> = ArrayPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  required,
  disabled,
  className,
  minItems = 0,
  maxItems = Infinity,
  defaultValue,
  showReorder = false,
  showIndex = false,
  addButtonLabel = 'Add item',
  emptyMessage = 'No items yet. Click the button below to add one.',
  renderItem,
}: FormArrayFieldProps<TFieldValues, TName>) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name,
  })

  const handleAdd = useCallback(() => {
    if (fields.length < maxItems) {
      append(defaultValue || ({} as FieldArray<TFieldValues, TName>))
    }
  }, [append, defaultValue, fields.length, maxItems])

  const handleRemove = useCallback(
    (index: number) => {
      if (fields.length > minItems) {
        remove(index)
      }
    },
    [fields.length, minItems, remove],
  )

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index > 0) {
        move(index, index - 1)
      }
    },
    [move],
  )

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index < fields.length - 1) {
        move(index, index + 1)
      }
    },
    [fields.length, move],
  )

  const canAddMore = fields.length < maxItems
  const canRemoveItem = fields.length > minItems

  return (
    <FormItem className={className}>
      {label && (
        <FormLabel>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
          <span className="text-muted-foreground ml-2 text-xs">
            ({fields.length}
            {maxItems !== Infinity && ` / ${maxItems}`})
          </span>
        </FormLabel>
      )}

      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-muted-foreground text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className={cn(
                  'flex items-start gap-2 rounded-lg border p-3',
                  disabled && 'opacity-50',
                )}
              >
                {showReorder && (
                  <div className="text-muted-foreground cursor-grab pt-2">
                    <GripVertical className="h-4 w-4" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  {renderItem({
                    index,
                    field,
                    remove: () => handleRemove(index),
                    isFirst: index === 0,
                    isLast: index === fields.length - 1,
                  })}
                </div>

                <ArrayItemControls
                  index={index}
                  showIndex={showIndex}
                  showReorder={showReorder}
                  canMoveUp={index > 0}
                  canMoveDown={index < fields.length - 1}
                  canRemove={canRemoveItem}
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                  onRemove={() => handleRemove(index)}
                  disabled={disabled ?? false}
                />
              </div>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={disabled || !canAddMore}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          {addButtonLabel}
        </Button>
      </div>

      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  )
}

export const FormArrayField = memo(
  FormArrayFieldComponent,
) as typeof FormArrayFieldComponent
