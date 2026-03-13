'use client'

import { memo, useCallback, useMemo } from 'react'
import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, Locate, Copy, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BaseFormFieldProps } from './form-field.types'

export interface CoordinatesValue {
  latitude: number | null
  longitude: number | null
}

export interface FormCoordinatesFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFormFieldProps<TFieldValues, TName>, 'placeholder'> {
  showGetLocation?: boolean | undefined
  showOpenMap?: boolean | undefined
  showCopy?: boolean | undefined
  precision?: number | undefined
  mapProvider?: 'google' | 'openstreetmap' | undefined
  labels?: {
    latitude?: string | undefined
    longitude?: string | undefined
    getLocation?: string | undefined
    openMap?: string | undefined
    copy?: string | undefined
  }
}

const DEFAULT_LABELS = {
  latitude: 'Latitude',
  longitude: 'Longitude',
  getLocation: 'Get my location',
  openMap: 'View on map',
  copy: 'Copy',
}

interface CoordinatesContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  showGetLocation: boolean
  showOpenMap: boolean
  showCopy: boolean
  precision: number
  mapProvider: 'google' | 'openstreetmap'
  labels: typeof DEFAULT_LABELS
}

const CoordinatesContent = memo(function CoordinatesContent({
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

  const formatCoordinate = useCallback(
    (val: number | null | undefined): string => {
      if (val === null || val === undefined) return ''
      return val.toFixed(precision)
    },
    [precision],
  )

  const parseCoordinate = useCallback((val: string): number | null => {
    const parsed = parseFloat(val)
    if (isNaN(parsed)) return null
    return parsed
  }, [])

  const getMapUrl = useCallback(
    (lat: number, lng: number): string => {
      if (mapProvider === 'openstreetmap') {
        return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`
      }
      return `https://www.google.com/maps?q=${lat},${lng}`
    },
    [mapProvider],
  )

  const handleLatChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const lat = parseCoordinate(e.target.value)
      field.onChange({ ...value, latitude: lat })
    },
    [field, value, parseCoordinate],
  )

  const handleLngChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const lng = parseCoordinate(e.target.value)
      field.onChange({ ...value, longitude: lng })
    },
    [field, value, parseCoordinate],
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
      (error) => {
        console.error('Geolocation error:', error)
      },
      { enableHighAccuracy: true },
    )
  }, [field])

  const handleOpenMap = useCallback(() => {
    if (value.latitude !== null && value.longitude !== null) {
      window.open(getMapUrl(value.latitude, value.longitude), '_blank')
    }
  }, [value, getMapUrl])

  const handleCopy = useCallback(() => {
    if (value.latitude !== null && value.longitude !== null) {
      navigator.clipboard.writeText(`${value.latitude}, ${value.longitude}`)
    }
  }, [value])

  const hasCoordinates = value.latitude !== null && value.longitude !== null
  const isValidLat =
    value.latitude === null || (value.latitude >= -90 && value.latitude <= 90)
  const isValidLng =
    value.longitude === null ||
    (value.longitude >= -180 && value.longitude <= 180)

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
              value={formatCoordinate(value.latitude)}
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
              value={formatCoordinate(value.longitude)}
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

function FormCoordinatesFieldComponent<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  disabled,
  className,
  required,
  showGetLocation = true,
  showOpenMap = true,
  showCopy = true,
  precision = 6,
  mapProvider = 'google',
  labels: customLabels,
}: FormCoordinatesFieldProps<TFieldValues, TName>) {
  const labels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...customLabels }) as typeof DEFAULT_LABELS,
    [customLabels],
  )

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <CoordinatesContent
              field={
                field as unknown as ControllerRenderProps<FieldValues, string>
              }
              hasError={!!fieldState.error}
              disabled={disabled ?? false}
              showGetLocation={showGetLocation}
              showOpenMap={showOpenMap}
              showCopy={showCopy}
              precision={precision}
              mapProvider={mapProvider}
              labels={labels}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const FormCoordinatesField = memo(
  FormCoordinatesFieldComponent,
) as typeof FormCoordinatesFieldComponent
