'use client'

import { memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { DENSITY_PADDING, DENSITY_HEIGHT, SKELETON_HEIGHT } from '../constants'

// Skeleton row component - fully memoized
export const SkeletonRow = memo(function SkeletonRow({
  columnsCount,
  hasSelection,
  hasExpander,
  density,
  skeletonHeight,
}: {
  columnsCount: number
  hasSelection: boolean
  hasExpander: boolean
  density: 'compact' | 'default' | 'comfortable'
  skeletonHeight: string
}) {
  return (
    <TableRow className={DENSITY_HEIGHT[density]}>
      {hasSelection && (
        <TableCell className="!px-2 !py-0" style={{ width: 40 }}>
          <Skeleton className="mx-auto h-4 w-4" />
        </TableCell>
      )}
      {hasExpander && (
        <TableCell className="!px-1 !py-0" style={{ width: 36 }}>
          <Skeleton className="mx-auto h-4 w-4" />
        </TableCell>
      )}
      {Array.from({ length: columnsCount }).map((_, colIndex) => (
        <TableCell key={colIndex} className={DENSITY_PADDING[density]}>
          <Skeleton className={cn(skeletonHeight, 'w-full')} />
        </TableCell>
      ))}
    </TableRow>
  )
})

// Skeleton rows container
export const SkeletonRows = memo(function SkeletonRows({
  pageSize,
  columnsCount,
  hasSelection,
  hasExpander,
  density = 'default',
}: {
  pageSize: number
  columnsCount: number
  hasSelection: boolean
  hasExpander: boolean
  density?: 'compact' | 'default' | 'comfortable' | undefined
}) {
  const skeletonHeight = SKELETON_HEIGHT[density]
  const rows: React.ReactNode[] = []
  const skeletonCount = Math.min(pageSize, 10)
  for (let i = 0; i < skeletonCount; i++) {
    rows.push(
      <SkeletonRow
        key={`skeleton-${i}`}
        columnsCount={columnsCount}
        hasSelection={hasSelection}
        hasExpander={hasExpander}
        density={density}
        skeletonHeight={skeletonHeight}
      />,
    )
  }
  return <>{rows}</>
})

// Empty state component
export const EmptyRow = memo(function EmptyRow({
  columnsCount,
  emptyMessage,
  emptyIcon,
}: {
  columnsCount: number
  emptyMessage: string
  emptyIcon?: React.ReactNode | undefined
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={columnsCount}
        className="h-32 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-2">
          {emptyIcon && <span aria-hidden="true">{emptyIcon}</span>}
          <span>{emptyMessage}</span>
        </div>
      </TableCell>
    </TableRow>
  )
})
