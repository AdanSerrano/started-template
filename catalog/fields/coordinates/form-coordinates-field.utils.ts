export interface CoordinatesValue {
  latitude: number | null
  longitude: number | null
}

export const DEFAULT_COORDINATE_LABELS = {
  latitude: 'Latitude',
  longitude: 'Longitude',
  getLocation: 'Get my location',
  openMap: 'View on map',
  copy: 'Copy',
}

export function formatCoordinate(
  val: number | null | undefined,
  precision: number,
): string {
  if (val === null || val === undefined) return ''
  return val.toFixed(precision)
}

export function parseCoordinate(val: string): number | null {
  const parsed = parseFloat(val)
  if (isNaN(parsed)) return null
  return parsed
}

export function getMapUrl(
  lat: number,
  lng: number,
  mapProvider: 'google' | 'openstreetmap',
): string {
  if (mapProvider === 'openstreetmap') {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`
  }
  return `https://www.google.com/maps?q=${lat},${lng}`
}

export function isValidLatitude(lat: number | null): boolean {
  return lat === null || (lat >= -90 && lat <= 90)
}

export function isValidLongitude(lng: number | null): boolean {
  return lng === null || (lng >= -180 && lng <= 180)
}
