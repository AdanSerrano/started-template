'use client'

import { MapPin, Locate, Copy, ExternalLink } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  type DEFAULT_COORDINATE_LABELS,
  formatCoordinate,
  parseCoordinate,
  getMapUrl,
  isValidLatitude,
  isValidLongitude,
  CoordinatesValue,
} from './form-coordinates-field.utils'
import type { ControllerRenderProps, FieldValues } from 'react-hook-form'

export interface CoordinatesContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  showGetLocation: boolean
  showOpenMap: boolean
  showCopy: boolean
  precision: number
  mapProvider: 'google' | 'openstreetmap'
  labels: typeof DEFAULT_COORDINATE_LABELS
}

export const CoordinatesContent = memo(function CoordinatesContent({
  field,
  hasError,
  disabled,
  showGetLocation,
  showOpenMap,
  showCopy,
  precision,
  mapProvider,
  labels,
}: CoordinatesContentProps) {
  const value = useMemo(
    () =>
      (field.value || { latitude: null, longitude: null }) as CoordinatesValue,
    [field.value],
  )
  const handleLatChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      field.onChange({ ...value, latitude: parseCoordinate(e.target.value) })
    },
    [field, value],
  )
  const handleLngChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      field.onChange({ ...value, longitude: parseCoordinate(e.target.value) })
    },
    [field, value],
  )
  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (position) => {
        field.onChange({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => console.error('Geolocation error:', error),
      { enableHighAccuracy: true },
    )
  }, [field])
  const handleOpenMap = useCallback(() => {
    if (value.latitude !== null && value.longitude !== null) {
      window.open(
        getMapUrl(value.latitude, value.longitude, mapProvider),
        '_blank',
      )
    }
  }, [value, mapProvider])
  const handleCopy = useCallback(() => {
    if (value.latitude !== null && value.longitude !== null) {
      navigator.clipboard.writeText(`${value.latitude}, ${value.longitude}`)
    }
  }, [value])

  const hasCoordinates = value.latitude !== null && value.longitude !== null
  const isValidLat = isValidLatitude(value.latitude)
  const isValidLng = isValidLongitude(value.longitude)

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <MapPin className="text-foreground/60 mt-2 h-5 w-5" />
        <div className="grid flex-1 grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-muted-foreground text-xs font-medium">
              {labels.latitude}
            </label>
            <Input
              type="number"
              step="any"
              min="-90"
              max="90"
              value={formatCoordinate(value.latitude, precision)}
              onChange={handleLatChange}
              placeholder="-90 to 90"
              disabled={disabled ?? false}
              className={cn(
                'bg-background',
                (!isValidLat || hasError) && 'border-destructive',
              )}
            />
            {!isValidLat && (
              <p className="text-destructive text-xs">
                Must be between -90 and 90
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-muted-foreground text-xs font-medium">
              {labels.longitude}
            </label>
            <Input
              type="number"
              step="any"
              min="-180"
              max="180"
              value={formatCoordinate(value.longitude, precision)}
              onChange={handleLngChange}
              placeholder="-180 to 180"
              disabled={disabled ?? false}
              className={cn(
                'bg-background',
                (!isValidLng || hasError) && 'border-destructive',
              )}
            />
            {!isValidLng && (
              <p className="text-destructive text-xs">
                Must be between -180 and 180
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {showGetLocation && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGetLocation}
            disabled={disabled ?? false}
          >
            <Locate className="mr-2 h-4 w-4" />
            {labels.getLocation}
          </Button>
        )}
        {showOpenMap && hasCoordinates && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenMap}
            disabled={disabled ?? false}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {labels.openMap}
          </Button>
        )}
        {showCopy && hasCoordinates && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={disabled ?? false}
          >
            <Copy className="mr-2 h-4 w-4" />
            {labels.copy}
          </Button>
        )}
      </div>
    </div>
  )
})
