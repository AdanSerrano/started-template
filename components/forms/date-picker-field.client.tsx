'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldDescription, FieldError } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import type { FieldError as RHFFieldError } from 'react-hook-form'

interface DatePickerFieldProps {
  value: Date | null | undefined
  onChange: (date: Date | null) => void
  placeholder?: string
  description?: string
  invalid?: boolean
  error?: RHFFieldError | undefined
}

export function DatePickerField({
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  description,
  invalid,
  error,
}: DatePickerFieldProps) {
  return (
    <Field data-invalid={invalid || undefined}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 size-4" />
            {value ? format(value, 'PPP', { locale: es }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={(date) => onChange(date ?? null)}
          />
        </PopoverContent>
      </Popover>
      {description && <FieldDescription>{description}</FieldDescription>}
      {invalid && error?.message && <FieldError>{error.message}</FieldError>}
    </Field>
  )
}
