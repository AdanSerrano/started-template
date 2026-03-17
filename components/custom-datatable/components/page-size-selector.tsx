'use client'

import { MoreHorizontal } from 'lucide-react'
import { memo, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PageSizeSelectorProps {
  pageSize: number
  pageSizeOptions: number[]
  onPageSizeChange: (value: string) => void
  rowsPerPageLabel: string
  selectAriaLabel: string
}

export const PageSizeSelector = memo(function PageSizeSelector({
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  rowsPerPageLabel,
  selectAriaLabel,
}: PageSizeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-sm whitespace-nowrap">
        {rowsPerPageLabel}
      </span>
      <Select value={String(pageSize)} onValueChange={onPageSizeChange}>
        <SelectTrigger className="h-8 w-[70px]" aria-label={selectAriaLabel}>
          <SelectValue placeholder={pageSize} />
        </SelectTrigger>
        <SelectContent side="top">
          {pageSizeOptions.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
})

interface PageNumbersProps {
  pageNumbers: (number | 'ellipsis')[]
  pageIndex: number
  onPageChange: (page: number) => void
  goToPageLabel: (params: { page: number }) => string
}

export const PageNumbers = memo(function PageNumbers({
  pageNumbers,
  pageIndex,
  onPageChange,
  goToPageLabel,
}: PageNumbersProps) {
  return (
    <>
      {pageNumbers.map((page, index) =>
        page === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-8 w-8 items-center justify-center"
            aria-hidden="true"
          >
            <MoreHorizontal className="text-muted-foreground h-4 w-4" />
          </span>
        ) : (
          <Button
            key={page}
            variant={pageIndex === page ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(page)}
            aria-label={goToPageLabel({ page: page + 1 })}
            aria-current={pageIndex === page ? 'page' : undefined}
          >
            {page + 1}
          </Button>
        ),
      )}
    </>
  )
})

export function usePageNumbers(pageIndex: number, totalPages: number) {
  return useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i)
    }

    const pages: (number | 'ellipsis')[] = []
    const addedPages = new Set<number>()
    const current = pageIndex

    pages.push(0)
    addedPages.add(0)

    if (current > 3) pages.push('ellipsis')

    const start = Math.max(1, current - 1)
    const end = Math.min(totalPages - 2, current + 1)
    for (let i = start; i <= end; i++) {
      if (!addedPages.has(i)) {
        pages.push(i)
        addedPages.add(i)
      }
    }

    if (current < totalPages - 4) pages.push('ellipsis')

    const lastPage = totalPages - 1
    if (totalPages > 1 && !addedPages.has(lastPage)) pages.push(lastPage)

    return pages
  }, [pageIndex, totalPages])
}
