import type { ExportFormat } from './types-columns'
import type { ReactNode } from 'react'

// ============================================
// COLUMN RESIZING CONFIG
// ============================================

export interface ColumnResizingConfig {
  enabled: boolean
  columnSizing: import('./types-columns').ColumnSizingState
  onColumnSizingChange: (
    sizing: import('./types-columns').ColumnSizingState,
  ) => void
  minColumnWidth?: number | undefined
  maxColumnWidth?: number | undefined
}

// ============================================
// VIRTUALIZATION CONFIG
// ============================================

export interface VirtualizationConfig {
  enabled: boolean
  rowHeight?: number | undefined
  overscan?: number | undefined
}

// ============================================
// KEYBOARD NAVIGATION CONFIG
// ============================================

export interface KeyboardNavigationConfig {
  enabled: boolean
  onEnter?: ((row: unknown, rowIndex: number) => void) | undefined
  onEscape?: (() => void) | undefined
  onDelete?: ((row: unknown, rowIndex: number) => void) | undefined
  enableCellNavigation?: boolean | undefined
}

// ============================================
// COLUMN PINNING CONFIG
// ============================================

export interface ColumnPinningConfig {
  enabled: boolean
  leftPinnedColumns?: string[] | undefined
  rightPinnedColumns?: string[] | undefined
  onPinningChange?:
    | ((pinning: { left: string[]; right: string[] }) => void)
    | undefined
}

// ============================================
// PERSISTENCE CONFIG
// ============================================

export interface PersistenceConfig {
  enabled: boolean
  key: string
  include?:
    | (
        | 'columnVisibility'
        | 'sorting'
        | 'density'
        | 'pageSize'
        | 'columnSizing'
        | 'columnPinning'
      )[]
    | undefined
  storage?: 'localStorage' | 'sessionStorage' | undefined
}

// ============================================
// COPY CONFIG
// ============================================

export interface CopyConfig {
  enabled: boolean
  format?: 'text' | 'csv' | 'json' | undefined
  includeHeaders?: boolean | undefined
  onCopy?: ((data: string) => void) | undefined
}

// ============================================
// PRINT CONFIG
// ============================================

export interface PrintConfig {
  enabled: boolean
  title?: string | undefined
  showLogo?: boolean | undefined
  pageSize?: 'A4' | 'Letter' | 'Legal' | undefined
  orientation?: 'portrait' | 'landscape' | undefined
}

// ============================================
// FULLSCREEN CONFIG
// ============================================

export interface FullscreenConfig {
  enabled: boolean
  onFullscreenChange?: ((isFullscreen: boolean) => void) | undefined
}

// ============================================
// EXPORT CONFIG
// ============================================

export interface ExportConfig<TData> {
  enabled: boolean
  formats?: ExportFormat[] | undefined
  filename?: string | undefined
  onExport?: ((format: ExportFormat, data: TData[]) => void) | undefined
  exportAllData?: boolean | undefined
  includeHeaders?: boolean | undefined
}

// ============================================
// LOADING & EMPTY STATES
// ============================================

export interface LoadingConfig {
  isLoading?: boolean | undefined
  isPending?: boolean | undefined
  loadingText?: string | undefined
  loadingOverlay?: ReactNode | undefined
  showSkeletons?: boolean | undefined
  skeletonCount?: number | undefined
}

export interface EmptyStateConfig {
  message?: string | undefined
  description?: string | undefined
  icon?: ReactNode | undefined
  action?: ReactNode | undefined
  customContent?: ReactNode | undefined
}

// ============================================
// TOOLBAR CONFIG
// ============================================

export interface ToolbarConfig {
  show?: boolean | undefined
  showSearch?: boolean | undefined
  showExport?: boolean | undefined
  showColumnVisibility?: boolean | undefined
  showDensityToggle?: boolean | undefined
  showRefresh?: boolean | undefined
  showFullscreen?: boolean | undefined
  showCopy?: boolean | undefined
  showPrint?: boolean | undefined
  onRefresh?: (() => void) | undefined
  customStart?: ReactNode | undefined
  customEnd?: ReactNode | undefined
}
