/**
 * Shared constants for CustomDataTable components
 * Centralizing these prevents duplication and ensures consistency
 */

import type { DensityType } from './types'

// Density padding classes for table cells
export const DENSITY_PADDING: Record<DensityType, string> = {
  compact: 'py-1 px-2',
  default: 'py-2 px-3',
  comfortable: 'py-3 px-4',
} as const

// Density height classes for table rows
export const DENSITY_HEIGHT: Record<DensityType, string> = {
  compact: 'h-8',
  default: 'h-12',
  comfortable: 'h-16',
} as const

// Skeleton height classes based on density
export const SKELETON_HEIGHT: Record<DensityType, string> = {
  compact: 'h-3',
  default: 'h-4',
  comfortable: 'h-5',
} as const

// Default page size options
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100] as const

// Click delay for distinguishing single vs double click
export const CLICK_DELAY_MS = 200

// Debounce delay for filter input (700ms to avoid excessive requests)
export const DEFAULT_FILTER_DEBOUNCE_MS = 700
