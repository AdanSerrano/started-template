import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'
import type { BaseFormFieldProps } from '../form-field.types'

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type EndType = 'never' | 'date' | 'count'
export type RecurrenceDayOfWeek = 'SU' | 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA'
export type MonthlyType = 'dayOfMonth' | 'dayOfWeek'

export interface RecurrenceValue {
  frequency: RecurrenceFrequency
  interval: number
  daysOfWeek?: RecurrenceDayOfWeek[] | undefined
  monthlyType?: MonthlyType | undefined
  dayOfMonth?: number | undefined
  endType: EndType
  endDate?: Date | undefined
  endCount?: number | undefined
}

export interface FormRecurrenceFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  showPreview?: boolean | undefined
  maxInterval?: number | undefined
  labels?:
    | {
        frequency?: string | undefined
        interval?: string | undefined
        days?: Record<RecurrenceDayOfWeek, string> | undefined
        ends?: string | undefined
        never?: string | undefined
        onDate?: string | undefined
        afterOccurrences?: string | undefined
        occurrences?: string | undefined
      }
    | undefined
}

export const DAYS_OF_WEEK: RecurrenceDayOfWeek[] = [
  'SU',
  'MO',
  'TU',
  'WE',
  'TH',
  'FR',
  'SA',
]

export const DEFAULT_LABELS = {
  frequency: 'Repeat',
  interval: 'Every',
  days: {
    SU: 'S',
    MO: 'M',
    TU: 'T',
    WE: 'W',
    TH: 'T',
    FR: 'F',
    SA: 'S',
  } as Record<RecurrenceDayOfWeek, string>,
  ends: 'Ends',
  never: 'Never',
  onDate: 'On date',
  afterOccurrences: 'After',
  occurrences: 'occurrences',
}

export const FREQUENCY_LABELS: Record<
  RecurrenceFrequency,
  { singular: string; plural: string }
> = {
  daily: { singular: 'day', plural: 'days' },
  weekly: { singular: 'week', plural: 'weeks' },
  monthly: { singular: 'month', plural: 'months' },
  yearly: { singular: 'year', plural: 'years' },
}

export const DEFAULT_VALUE: RecurrenceValue = {
  frequency: 'weekly',
  interval: 1,
  daysOfWeek: ['MO'],
  endType: 'never',
}

export interface RecurrenceContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  showPreview: boolean
  maxInterval: number
  labels: typeof DEFAULT_LABELS
}
