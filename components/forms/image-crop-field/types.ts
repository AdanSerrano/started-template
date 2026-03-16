import type {
  FieldPath,
  FieldValues,
  ControllerRenderProps,
} from 'react-hook-form'
import type { BaseFormFieldProps } from '../form-field.types'

export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export interface FormImageCropFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends BaseFormFieldProps<TFieldValues, TName> {
  aspectRatio?: number | undefined
  minWidth?: number | undefined
  minHeight?: number | undefined
  maxFileSize?: number | undefined
  accept?: string | undefined
  outputFormat?: 'jpeg' | 'png' | 'webp' | undefined
  outputQuality?: number | undefined
  cropShape?: 'rect' | 'round' | undefined
  labels?:
    | {
        upload?: string | undefined
        change?: string | undefined
        remove?: string | undefined
        crop?: string | undefined
        cancel?: string | undefined
        apply?: string | undefined
        zoom?: string | undefined
        rotate?: string | undefined
      }
    | undefined
}

export interface ImageState {
  src: string
  zoom: number
  rotation: number
  position: { x: number; y: number }
}

export const DEFAULT_LABELS = {
  upload: 'Upload Image',
  change: 'Change',
  remove: 'Remove',
  crop: 'Crop Image',
  cancel: 'Cancel',
  apply: 'Apply',
  zoom: 'Zoom',
  rotate: 'Rotate',
}

export interface CropDialogProps {
  open: boolean
  imageState: ImageState | null
  imageStateRef: React.MutableRefObject<ImageState | null>
  aspectRatio: number
  cropShape: 'rect' | 'round'
  labels: typeof DEFAULT_LABELS
  isPending: boolean
  onZoomChange: (zoom: number) => void
  onRotate: () => void
  onPositionChange: (x: number, y: number) => void
  onApply: () => void
  onCancel: () => void
}

export interface ImageCropContentProps {
  field: ControllerRenderProps<FieldValues, string>
  hasError: boolean
  disabled?: boolean | undefined
  aspectRatio: number
  maxFileSize: number
  accept: string
  outputFormat: 'jpeg' | 'png' | 'webp'
  outputQuality: number
  cropShape: 'rect' | 'round'
  labels: typeof DEFAULT_LABELS
}
