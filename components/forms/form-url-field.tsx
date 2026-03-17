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
import { DEFAULT_URL_MESSAGES } from './form-url-field.utils'
import { UrlContent } from './url-field-content'
import type { BaseFormFieldProps } from './form-field.types'
import type { FieldPath, FieldValues } from 'react-hook-form'

export interface FormUrlFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  showValidation?: boolean | undefined
  showOpenLink?: boolean | undefined
  showCopy?: boolean | undefined
  showFavicon?: boolean | undefined
  allowedProtocols?: string[] | undefined
  autoAddProtocol?: boolean | undefined
  messages?: Partial<typeof DEFAULT_URL_MESSAGES> | undefined
}

function FormUrlFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  placeholder = 'https://example.com',
  disabled,
  className,
  required,
  showValidation = true,
  showOpenLink = true,
  showCopy = true,
  showFavicon = true,
  allowedProtocols = ['http', 'https'],
  autoAddProtocol = true,
  messages: customMessages,
}: FormUrlFieldProps<TFieldValues, TName>) {
  const messages = useMemo(
    () =>
      ({
        ...DEFAULT_URL_MESSAGES,
        ...customMessages,
      }) as typeof DEFAULT_URL_MESSAGES,
    [customMessages],
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
            <UrlContent
              field={field}
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              placeholder={placeholder}
              showValidation={showValidation}
              showOpenLink={showOpenLink}
              showCopy={showCopy}
              showFavicon={showFavicon}
              allowedProtocols={allowedProtocols}
              autoAddProtocol={autoAddProtocol}
              messages={messages}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormUrlField = memo(
  FormUrlFieldComponent,
) as typeof FormUrlFieldComponent
