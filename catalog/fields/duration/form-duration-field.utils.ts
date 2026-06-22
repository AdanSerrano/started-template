export interface DurationValue {
  hours: number
  minutes: number
  seconds: number
}

export const DEFAULT_DURATION_LABELS = {
  hours: 'Hours',
  minutes: 'Minutes',
  seconds: 'Seconds',
}

export function formatDuration(duration: DurationValue): string {
  const parts: string[] = []
  if (duration.hours > 0) {
    parts.push(`${duration.hours}h`)
  }
  if (duration.minutes > 0) {
    parts.push(`${duration.minutes}m`)
  }
  if (duration.seconds > 0 || parts.length === 0) {
    parts.push(`${duration.seconds}s`)
  }
  return parts.join(' ')
}

export function durationToSeconds(duration: DurationValue): number {
  return duration.hours * 3600 + duration.minutes * 60 + duration.seconds
}

export function normalizeDuration(
  currentValue: DurationValue,
  key: keyof DurationValue,
  newValue: number,
  maxHours: number,
): DurationValue {
  const updated = { ...currentValue, [key]: newValue }

  if (key === 'minutes' && newValue >= 60) {
    const extraHours = Math.floor(newValue / 60)
    updated.minutes = newValue % 60
    updated.hours = Math.min(maxHours, currentValue.hours + extraHours)
  }

  if (key === 'seconds' && newValue >= 60) {
    const extraMinutes = Math.floor(newValue / 60)
    updated.seconds = newValue % 60
    updated.minutes = currentValue.minutes + extraMinutes

    if (updated.minutes >= 60) {
      const extraHours = Math.floor(updated.minutes / 60)
      updated.minutes = updated.minutes % 60
      updated.hours = Math.min(maxHours, currentValue.hours + extraHours)
    }
  }

  return updated
}
