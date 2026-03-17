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
import { MaskContent } from './form-mask-field-content'
import {
  PRESET_MASKS,
  DEFAULT_DEFINITIONS,
  getMaskedPlaceholder,
} from './form-mask-field.utils'
import type { BaseFormFieldProps } from './form-field.types'
import type { MaskDefinition, PresetMask } from './form-mask-field.utils'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'

export type { MaskDefinition, PresetMask }

export interface FormMaskFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  mask?: string | MaskDefinition | undefined
  preset?: PresetMask | undefined
  showMask?: boolean | undefined
  maskChar?: string | undefined
  alwaysShowMask?: boolean | undefined
  leftIcon?: React.ReactNode | undefined
  rightIcon?: React.ReactNode | undefined
}

function FormMaskFieldComponent<
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
  mask,
  preset,
  showMask = true,
  maskChar = '_',
  alwaysShowMask = false,
  leftIcon,
  rightIcon,
}: FormMaskFieldProps<TFieldValues, TName>) {
  const maskDefinition = useMemo((): MaskDefinition => {
    if (preset) {
      return PRESET_MASKS[preset]
    }
    if (typeof mask === 'string') {
      return { pattern: mask }
    }
    return mask || { pattern: '' }
  }, [mask, preset])

  const definitions = useMemo(
    () =>
      ({
        ...DEFAULT_DEFINITIONS,
        ...maskDefinition.definitions,
      }) as typeof DEFAULT_DEFINITIONS,
    [maskDefinition.definitions],
  )

  const pattern = maskDefinition.pattern

  const displayPlaceholder = useMemo(
    () =>
      placeholder ||
      maskDefinition.placeholder ||
      getMaskedPlaceholder(pattern, maskChar, definitions),
    [placeholder, maskDefinition.placeholder, pattern, maskChar, definitions],
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
            <MaskContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              placeholder={displayPlaceholder}
              pattern={pattern}
              definitions={definitions}
              showMask={showMask}
              maskChar={maskChar}
              alwaysShowMask={alwaysShowMask}
              leftIcon={leftIcon}
              rightIcon={rightIcon}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormMaskField = memo(
  FormMaskFieldComponent,
) as typeof FormMaskFieldComponent
