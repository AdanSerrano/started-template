'use client'

import { memo, useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { ChevronsUpDown, FolderTree } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TreeItem } from './tree-item'
import { SelectedBadge } from './selected-badge'
import { getAllValues, findNodeByValue, getNodePath } from './tree-utils'
import type { TreeSelectContentProps } from './types'

export const TreeSelectContent = memo(function TreeSelectContent({
  field,
  hasError,
  disabled,
  options,
  multiple,
  showCheckboxes,
  expandAll,
  maxSelections,
  placeholder,
  emptyMessage,
}: TreeSelectContentProps) {
  const allValues = useMemo(() => getAllValues(options), [options])

  const [expandedSet, setExpandedSet] = useState<Set<string>>(() =>
    expandAll ? new Set(allValues) : new Set(),
  )

  const selectedValues: string[] = useMemo(() => {
    if (multiple) {
      return Array.isArray(field.value) ? field.value : []
    }
    return field.value ? [field.value] : []
  }, [field.value, multiple])

  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues])

  const handleToggleExpand = useCallback((value: string) => {
    setExpandedSet((prev) => {
      const next = new Set(prev)
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      return next
    })
  }, [])

  const handleSelect = useCallback(
    (value: string) => {
      if (multiple) {
        const newSelected = selectedSet.has(value)
          ? selectedValues.filter((v) => v !== value)
          : maxSelections && selectedValues.length >= maxSelections
            ? selectedValues
            : [...selectedValues, value]
        field.onChange(newSelected)
      } else {
        field.onChange(value)
      }
    },
    [field, multiple, selectedSet, selectedValues, maxSelections],
  )

  const handleRemove = useCallback(
    (value: string, e: React.MouseEvent) => {
      e.stopPropagation()
      if (multiple) {
        field.onChange(selectedValues.filter((v) => v !== value))
      } else {
        field.onChange('')
      }
    },
    [field, multiple, selectedValues],
  )

  const renderSelectedLabels = useMemo(() => {
    if (selectedValues.length === 0) {
      return <span className="text-muted-foreground">{placeholder}</span>
    }

    if (multiple) {
      return (
        <div className="flex flex-wrap gap-1">
          {selectedValues.slice(0, 3).map((value) => {
            const node = findNodeByValue(options, value)
            return (
              <SelectedBadge
                key={value}
                value={value}
                label={node?.label || value}
                onRemove={handleRemove}
              />
            )
          })}
          {selectedValues.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{selectedValues.length - 3} more
            </Badge>
          )}
        </div>
      )
    }

    const path = getNodePath(options, selectedValues[0]!)
    return (
      <span className="truncate">{path?.join(' / ') || selectedValues[0]}</span>
    )
  }, [selectedValues, multiple, options, placeholder, handleRemove])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled ?? false}
          className={cn(
            'w-full justify-between font-normal',
            hasError && 'border-destructive',
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <FolderTree className="text-foreground/60 h-4 w-4 shrink-0" />
            {renderSelectedLabels}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <ScrollArea className="h-[300px]">
          <div className="p-2">
            {options.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                {emptyMessage}
              </p>
            ) : (
              options.map((node) => (
                <TreeItem
                  key={node.value}
                  node={node}
                  level={0}
                  isExpanded={expandedSet.has(node.value)}
                  isSelected={selectedSet.has(node.value)}
                  multiple={multiple}
                  showCheckboxes={showCheckboxes}
                  expandedSet={expandedSet}
                  selectedSet={selectedSet}
                  onToggleExpand={handleToggleExpand}
                  onSelect={handleSelect}
                  disabled={disabled ?? false}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
})
