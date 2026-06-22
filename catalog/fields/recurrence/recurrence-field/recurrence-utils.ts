import { format } from 'date-fns'
import { DAYS_OF_WEEK, FREQUENCY_LABELS } from './types'
import type { RecurrenceValue } from './types'

export function getRecurrenceDescription(value: RecurrenceValue): string {
  const freqLabel =
    value.interval === 1
      ? FREQUENCY_LABELS[value.frequency].singular
      : FREQUENCY_LABELS[value.frequency].plural

  let desc =
    value.interval === 1
      ? `Every ${freqLabel}`
      : `Every ${value.interval} ${freqLabel}`

  if (
    value.frequency === 'weekly' &&
    value.daysOfWeek &&
    value.daysOfWeek.length > 0
  ) {
    const dayNames = value.daysOfWeek.map((d) => {
      const index = DAYS_OF_WEEK.indexOf(d)
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]
    })
    desc += ` on ${dayNames.join(', ')}`
  }

  if (value.endType === 'date' && value.endDate) {
    desc += `, until ${format(value.endDate, 'MMM d, yyyy')}`
  } else if (value.endType === 'count' && value.endCount) {
    desc += `, ${value.endCount} times`
  }

  return desc
}
