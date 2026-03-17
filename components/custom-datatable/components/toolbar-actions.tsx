'use client'

import { Download, FileText, FileJson, FileSpreadsheet } from 'lucide-react'
import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ExportFormat } from '../types'

const exportIcons: Record<ExportFormat, React.ElementType> = {
  csv: FileText,
  json: FileJson,
  xlsx: FileSpreadsheet,
}

// Memoized export dropdown
export const ExportDropdown = memo(function ExportDropdown({
  formats,
  onExport,
  labels,
}: {
  formats: ExportFormat[]
  onExport: (format: ExportFormat) => void
  labels: {
    export: string
    exportFormat: string
  }
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">{labels.export}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{labels.exportFormat}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {formats.map((format) => {
          const Icon = exportIcons[format]
          return (
            <DropdownMenuItem
              key={format}
              onClick={() => onExport(format)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              <span className="uppercase">{format}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

// Memoized bulk actions bar
export const BulkActionsBar = memo(function BulkActionsBar({
  selectedCount,
  bulkActions,
  onClearSelection,
  labels,
}: {
  selectedCount: number
  bulkActions: React.ReactNode
  onClearSelection: () => void
  labels: {
    selected: string
    selectedPlural: string
    clearSelection: string
  }
}) {
  return (
    <div className="bg-muted/50 flex items-center gap-3 rounded-md border px-4 py-2">
      <Badge variant="secondary" className="font-mono">
        {selectedCount}{' '}
        {selectedCount > 1 ? labels.selectedPlural : labels.selected}
      </Badge>
      <div className="bg-border h-4 w-px" />
      <div className="flex items-center gap-2">{bulkActions}</div>
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="text-muted-foreground"
      >
        {labels.clearSelection}
      </Button>
    </div>
  )
})
