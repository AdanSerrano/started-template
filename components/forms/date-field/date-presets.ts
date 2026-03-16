import type { DatePreset, DateRange } from '../form-field.types'

export interface DateRangePreset {
  label: string
  getValue: () => DateRange
}

export const DEFAULT_PRESET_LABELS = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  in7Days: 'In 7 days',
  in30Days: 'In 30 days',
  last7Days: 'Last 7 days',
  last30Days: 'Last 30 days',
  thisMonth: 'This month',
  lastMonth: 'Last month',
}

export type PresetLabels = typeof DEFAULT_PRESET_LABELS

export function buildDatePresets(labels: PresetLabels): DatePreset[] {
  return [
    { label: labels.today, getValue: () => new Date() },
    {
      label: labels.tomorrow,
      getValue: () => {
        const date = new Date()
        date.setDate(date.getDate() + 1)
        return date
      },
    },
    {
      label: labels.in7Days,
      getValue: () => {
        const date = new Date()
        date.setDate(date.getDate() + 7)
        return date
      },
    },
    {
      label: labels.in30Days,
      getValue: () => {
        const date = new Date()
        date.setDate(date.getDate() + 30)
        return date
      },
    },
  ]
}

export function buildDateRangePresets(labels: PresetLabels): DateRangePreset[] {
  return [
    {
      label: labels.today,
      getValue: () => {
        const today = new Date()
        return { from: today, to: today }
      },
    },
    {
      label: labels.last7Days,
      getValue: () => {
        const to = new Date()
        const from = new Date()
        from.setDate(from.getDate() - 7)
        return { from, to }
      },
    },
    {
      label: labels.last30Days,
      getValue: () => {
        const to = new Date()
        const from = new Date()
        from.setDate(from.getDate() - 30)
        return { from, to }
      },
    },
    {
      label: labels.thisMonth,
      getValue: () => {
        const from = new Date()
        from.setDate(1)
        const to = new Date()
        return { from, to }
      },
    },
    {
      label: labels.lastMonth,
      getValue: () => {
        const to = new Date()
        to.setDate(0)
        const from = new Date(to)
        from.setDate(1)
        return { from, to }
      },
    },
  ]
}
