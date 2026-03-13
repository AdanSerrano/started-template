'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
interface TemplateField {
  key: string
  label: string
  type: string
  required?: boolean
  placeholder?: string
  helpText?: string
  options?: string[]
  maxLength?: number
  min?: number
  max?: number
}

interface DynamicFieldInputProps {
  field: TemplateField
  value: string
  onChange: (value: string) => void
}

export function DynamicFieldInput({
  field,
  value,
  onChange,
}: DynamicFieldInputProps) {
  const id = `field-${field.key}`

  const label = (
    <FieldLabel htmlFor={id}>
      {field.label}
      {field.required && <span className="text-destructive ml-1">*</span>}
    </FieldLabel>
  )

  const help = field.helpText ? (
    <FieldDescription>{field.helpText}</FieldDescription>
  ) : null

  if (field.type === 'select' && field.options?.length) {
    return (
      <Field>
        {label}
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={id} className="w-full">
            <SelectValue placeholder={field.placeholder ?? 'Seleccionar'} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {help}
      </Field>
    )
  }

  if (field.type === 'textarea') {
    return (
      <Field>
        {label}
        <Textarea
          id={id}
          placeholder={field.placeholder}
          required={field.required}
          value={value}
          maxLength={field.maxLength}
          rows={3}
          onChange={(e) => onChange(e.target.value)}
        />
        {help}
      </Field>
    )
  }

  if (field.type === 'boolean') {
    return (
      <Field>
        {label}
        <div className="flex items-center gap-2 pt-1">
          <Switch
            id={id}
            checked={value === 'true'}
            onCheckedChange={(v) => onChange(v ? 'true' : 'false')}
          />
          <span className="text-muted-foreground text-sm">
            {value === 'true' ? 'Si' : 'No'}
          </span>
        </div>
        {help}
      </Field>
    )
  }

  const typeMap: Record<string, string> = {
    email: 'email',
    phone: 'tel',
    url: 'url',
    date: 'date',
    datetime: 'datetime-local',
    number: 'number',
    color: 'color',
    image: 'url',
  }

  return (
    <Field>
      {label}
      <Input
        id={id}
        type={typeMap[field.type] ?? 'text'}
        placeholder={field.placeholder}
        required={field.required}
        value={value}
        maxLength={field.maxLength}
        min={field.min}
        max={field.max}
        onChange={(e) => onChange(e.target.value)}
      />
      {help}
    </Field>
  )
}
