'use client'

import { memo, useMemo } from 'react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FormFieldTooltip } from './form-field-tooltip'
import { TagContent, DEFAULT_TAG_LABELS } from './form-tag-field-content'
import type { BaseFormFieldProps, TagOption } from './form-field.types'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'

export interface FormTagFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  suggestions?: TagOption[] | undefined
  maxTags?: number | undefined
  allowCustom?: boolean | undefined
  validateTag?: ((tag: string) => boolean) | undefined
  transformTag?: ((tag: string) => string) | undefined
  labels?:
    | {
        add?: string | undefined
        placeholder?: string | undefined
        noSuggestions?: string | undefined
        maxReached?: string | undefined
      }
    | undefined
  tagClassName?: string | undefined
}

function FormTagFieldComponent<
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
  tooltip,
  suggestions = [],
  maxTags,
  allowCustom = true,
  validateTag,
  transformTag,
  labels,
  tagClassName,
}: FormTagFieldProps<TFieldValues, TName>) {
  const mergedLabels = useMemo(
    () => ({ ...DEFAULT_TAG_LABELS, ...labels }) as typeof DEFAULT_TAG_LABELS,
    [labels],
  )

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {label && (
            <div className="flex items-center gap-1.5">
              <FormLabel>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              {tooltip && <FormFieldTooltip tooltip={tooltip} />}
            </div>
          )}
          <FormControl>
            <TagContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              placeholder={placeholder}
              disabled={disabled ?? false}
              suggestions={suggestions}
              maxTags={maxTags}
              allowCustom={allowCustom}
              validateTag={validateTag}
              transformTag={transformTag}
              labels={mergedLabels}
              tagClassName={tagClassName}
            />
          </FormControl>
          <div className="flex items-center justify-between">
            {description && (
              <FormDescription className="flex-1 text-xs">
                {description}
              </FormDescription>
            )}
            {maxTags && (
              <span className="text-muted-foreground text-xs">
                {field.value?.length ?? 0}/{maxTags}
              </span>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormTagField = memo(
  FormTagFieldComponent,
) as typeof FormTagFieldComponent
