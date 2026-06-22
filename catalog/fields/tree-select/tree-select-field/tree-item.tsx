'use client'

import { ChevronRight, ChevronDown } from 'lucide-react'
import { memo, useCallback } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { TreeItemProps } from './types'

export const TreeItem = memo(function TreeItem({
  node,
  level,
  isExpanded,
  isSelected,
  multiple,
  showCheckboxes,
  expandedSet,
  selectedSet,
  onToggleExpand,
  onSelect,
  disabled,
}: TreeItemProps) {
  const hasChildren = node.children && node.children.length > 0
  const Icon = node.icon

  const handleItemClick = useCallback(() => {
    if (node.disabled || disabled) return
    onSelect(node.value)
  }, [node.disabled, node.value, disabled, onSelect])

  const handleExpandClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onToggleExpand(node.value)
    },
    [node.value, onToggleExpand],
  )

  const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const handleCheckedChange = useCallback(() => {
    onSelect(node.value)
  }, [node.value, onSelect])

  return (
    <div>
      <div
        className={cn(
          'hover:bg-accent/50 flex cursor-pointer items-center gap-1 rounded-md px-2 py-1',
          isSelected && !multiple && 'bg-accent',
          isSelected && multiple && 'bg-accent/50',
          node.disabled && 'cursor-not-allowed opacity-50',
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleItemClick}
      >
        {hasChildren ? (
          <button
            type="button"
            className="hover:bg-accent rounded p-0.5"
            onClick={handleExpandClick}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {showCheckboxes && multiple && (
          <Checkbox
            checked={isSelected}
            disabled={node.disabled || disabled}
            className="mr-1"
            onClick={handleCheckboxClick}
            onCheckedChange={handleCheckedChange}
          />
        )}

        {Icon && <Icon className="text-foreground/60 mr-1 h-4 w-4" />}

        <span className="flex-1 truncate text-sm">{node.label}</span>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeItem
              key={child.value}
              node={child}
              level={level + 1}
              isExpanded={expandedSet.has(child.value)}
              isSelected={selectedSet.has(child.value)}
              multiple={multiple}
              showCheckboxes={showCheckboxes}
              expandedSet={expandedSet}
              selectedSet={selectedSet}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              disabled={disabled ?? false}
            />
          ))}
        </div>
      )}
    </div>
  )
})
