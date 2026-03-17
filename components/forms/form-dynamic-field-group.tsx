'use client'

import { Plus, GripVertical } from 'lucide-react'
import { memo, useCallback, type ReactNode } from 'react'
import {
  useFieldArray,
  type Control,
  type FieldValues,
  type FieldArrayPath,
  type UseFieldArrayReturn,
} from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { FormLabel, FormDescription } from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { MoveUpButton, MoveDownButton, RemoveButton } from './dynamic-field-row'
import { FormFieldTooltip } from './form-field-tooltip'
import type { TooltipConfig } from './form-field.types'

export interface FormDynamicFieldGroupProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> =
    FieldArrayPath<TFieldValues>,
> {
  control: Control<TFieldValues>
  name: TFieldArrayName
  label?: ReactNode | undefined
  description?: ReactNode | undefined
  tooltip?: TooltipConfig | string | undefined
  required?: boolean | undefined
  minItems?: number | undefined
  maxItems?: number | undefined
  defaultValue?: Record<string, unknown> | undefined
  renderField: (
    index: number,
    fieldArray: UseFieldArrayReturn<TFieldValues, TFieldArrayName>,
  ) => ReactNode
  labels?: {
    add?: string | undefined
    remove?: string | undefined
    moveUp?: string | undefined
    moveDown?: string | undefined
    empty?: string | undefined
  }
  showDragHandle?: boolean | undefined
  showMoveButtons?: boolean | undefined
  addButtonPosition?: 'top' | 'bottom' | 'both' | undefined
  variant?: 'default' | 'card' | 'compact' | undefined
  disabled?: boolean | undefined
  className?: string | undefined
  itemClassName?: string | undefined
}

const DEFAULT_LABELS = {
  add: 'Add item',
  remove: 'Remove',
  moveUp: 'Move up',
  moveDown: 'Move down',
  empty: 'No items added yet',
}

function FormDynamicFieldGroupComponent<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> =
    FieldArrayPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  tooltip,
  required,
  minItems = 0,
  maxItems,
  defaultValue = {},
  renderField,
  labels,
  showDragHandle = false,
  showMoveButtons = false,
  addButtonPosition = 'bottom',
  variant = 'default',
  disabled,
  className,
  itemClassName,
}: FormDynamicFieldGroupProps<TFieldValues, TFieldArrayName>) {
  const fieldArray = useFieldArray({
    control,
    name,
  })

  const { fields, append, remove, move } = fieldArray

  const mergedLabels = { ...DEFAULT_LABELS, ...labels } as typeof DEFAULT_LABELS

  const canAdd = maxItems === undefined || fields.length < maxItems
  const canRemove = fields.length > minItems

  const handleAdd = useCallback(() => {
    if (canAdd) {
      append(defaultValue as Parameters<typeof append>[0])
    }
  }, [append, defaultValue, canAdd])

  const handleRemove = useCallback(
    (index: number) => {
      if (canRemove) {
        remove(index)
      }
    },
    [remove, canRemove],
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
    [move, fields.length],
  )

  const addButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleAdd}
      disabled={disabled || !canAdd}
      className="gap-2"
    >
      <Plus className="h-4 w-4" />
      {mergedLabels.add}
    </Button>
  )

  const variantStyles = {
    default: '',
    card: 'rounded-lg border bg-card p-4',
    compact: 'rounded border p-2',
  }

  return (
    <div className={cn('space-y-4', className)}>
      {(label || description) && (
        <div className="space-y-1">
          {label && (
            <div className="flex items-center gap-1.5">
              <FormLabel className="text-base">
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              {tooltip && <FormFieldTooltip tooltip={tooltip} />}
            </div>
          )}
          {description && (
            <FormDescription className="text-xs">{description}</FormDescription>
          )}
        </div>
      )}

      {(addButtonPosition === 'top' || addButtonPosition === 'both') && (
        <div>{addButton}</div>
      )}

      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border border-dashed py-8 text-center text-sm">
            {mergedLabels.empty}
          </div>
        ) : (
          fields.map((field, index) => (
            <div
              key={field.id}
              className={cn(
                'group relative',
                variantStyles[variant],
                itemClassName,
              )}
            >
              <div className="flex items-start gap-2">
                {showDragHandle && (
                  <div className="text-muted-foreground hover:text-foreground mt-2 cursor-grab">
                    <GripVertical className="h-5 w-5" />
                  </div>
                )}

                {showMoveButtons && (
                  <div className="mt-1 flex flex-col gap-1">
                    <MoveUpButton
                      index={index}
                      onMoveUp={handleMoveUp}
                      disabled={disabled || index === 0}
                    />
                    <MoveDownButton
                      index={index}
                      onMoveDown={handleMoveDown}
                      disabled={disabled || index === fields.length - 1}
                    />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  {renderField(index, fieldArray)}
                </div>

                <RemoveButton
                  index={index}
                  onRemove={handleRemove}
                  disabled={disabled || !canRemove}
                  variant={variant}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {(addButtonPosition === 'bottom' || addButtonPosition === 'both') && (
        <div>{addButton}</div>
      )}

      {maxItems && (
        <p className="text-muted-foreground text-right text-xs">
          {fields.length}/{maxItems} items
        </p>
      )}
    </div>
  )
}

export const FormDynamicFieldGroup = memo(
  FormDynamicFieldGroupComponent,
) as typeof FormDynamicFieldGroupComponent
