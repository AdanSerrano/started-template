import type { TimeValue } from '@/components/forms/form-field.types'

export function formatTime(time: TimeValue, format: '12h' | '24h'): string {
  const { hours, minutes } = time
  const paddedMinutes = minutes.toString().padStart(2, '0')

  if (format === '24h') {
    const paddedHours = hours.toString().padStart(2, '0')
    return `${paddedHours}:${paddedMinutes}`
  }

  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${paddedMinutes} ${period}`
}

export function generateHours(format: '12h' | '24h'): number[] {
  if (format === '24h') {
    return Array.from({ length: 24 }, (_, i) => i)
  }
  return Array.from({ length: 12 }, (_, i) => i || 12)
}

export function generateMinutes(step: number): number[] {
  return Array.from({ length: 60 / step }, (_, i) => i * step)
}

export function isTimeDisabled(
  hours: number,
  minutes: number,
  minTime?: TimeValue,
  maxTime?: TimeValue,
): boolean {
  const timeInMinutes = hours * 60 + minutes

  if (minTime) {
    const minInMinutes = minTime.hours * 60 + minTime.minutes
    if (timeInMinutes < minInMinutes) return true
  }

  if (maxTime) {
    const maxInMinutes = maxTime.hours * 60 + maxTime.minutes
    if (timeInMinutes > maxInMinutes) return true
  }

  return false
}
