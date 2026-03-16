import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'
import type { BaseFormFieldProps } from '../form-field.types'

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface TimeSlot {
  start: string
  end: string
}

export interface DaySchedule {
  enabled: boolean
  slots: TimeSlot[]
}

export type WeekSchedule = Record<DayOfWeek, DaySchedule>

export interface FormScheduleFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  allowMultipleSlots?: boolean | undefined
  maxSlotsPerDay?: number | undefined
  showCopyButton?: boolean | undefined
  use24Hour?: boolean | undefined
  labels?:
    | {
        days?: Record<DayOfWeek, string> | undefined
        addSlot?: string | undefined
        copyToAll?: string | undefined
      }
    | undefined
}

export const DAYS_ORDER: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

export const DEFAULT_LABELS = {
  days: {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
  } as Record<DayOfWeek, string>,
  addSlot: 'Add slot',
  copyToAll: 'Copy to all',
}

export const DEFAULT_SCHEDULE: WeekSchedule = {
  monday: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
  tuesday: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
  wednesday: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
  thursday: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
  friday: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
  saturday: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
  sunday: { enabled: false, slots: [{ start: '09:00', end: '17:00' }] },
}

export interface TimeSlotInputProps {
  slot: TimeSlot
  index: number
  showDelete: boolean
  onChange: (index: number, field: 'start' | 'end', value: string) => void
  onDelete: (index: number) => void
  disabled?: boolean | undefined
}

export interface DayRowProps {
  day: DayOfWeek
  dayLabel: string
  schedule: DaySchedule
  allowMultipleSlots: boolean
  maxSlots: number
  addSlotLabel: string
  showCopyButton: boolean
  copyLabel: string
  onToggle: (day: DayOfWeek) => void
  onSlotChange: (
    day: DayOfWeek,
    index: number,
    field: 'start' | 'end',
    value: string,
  ) => void
  onSlotDelete: (day: DayOfWeek, index: number) => void
  onSlotAdd: (day: DayOfWeek) => void
  onCopyToAll: (day: DayOfWeek) => void
  disabled?: boolean | undefined
}

export interface ScheduleContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  allowMultipleSlots: boolean
  maxSlotsPerDay: number
  showCopyButton: boolean
  labels: {
    days: Record<DayOfWeek, string>
    addSlot: string
    copyToAll: string
  }
}
