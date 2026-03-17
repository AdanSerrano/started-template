export function parseNumberInput(
  value: string,
  allowDecimal: boolean,
): number | null {
  if (value === '' || value === '-') return null
  const parsed = allowDecimal ? parseFloat(value) : parseInt(value, 10)
  return isNaN(parsed) ? null : parsed
}

export function formatNumberValue(
  value: number,
  allowDecimal: boolean,
  decimalPlaces: number,
): number {
  return allowDecimal ? parseFloat(value.toFixed(decimalPlaces)) : value
}

export function clampValue(
  value: number,
  min?: number,
  max?: number,
): number | null {
  if (max !== undefined && value > max) return null
  if (min !== undefined && value < min) return null
  return value
}
