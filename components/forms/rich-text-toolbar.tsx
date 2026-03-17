'use client'

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Undo,
  Redo,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react'
import { memo } from 'react'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'

export type ToolbarAction =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikeThrough'
  | 'insertUnorderedList'
  | 'insertOrderedList'
  | 'justifyLeft'
  | 'justifyCenter'
  | 'justifyRight'
  | 'createLink'
  | 'undo'
  | 'redo'
  | 'formatBlock'

interface ToolbarButton {
  action: ToolbarAction
  icon: React.ElementType
  label: string
  arg?: string | undefined
}

const TOOLBAR_GROUPS: ToolbarButton[][] = [
  [
    { action: 'bold', icon: Bold, label: 'Bold' },
    { action: 'italic', icon: Italic, label: 'Italic' },
    { action: 'underline', icon: Underline, label: 'Underline' },
    { action: 'strikeThrough', icon: Strikethrough, label: 'Strikethrough' },
  ],
  [
    { action: 'formatBlock', icon: Heading1, label: 'Heading 1', arg: 'h1' },
    { action: 'formatBlock', icon: Heading2, label: 'Heading 2', arg: 'h2' },
    { action: 'formatBlock', icon: Heading3, label: 'Heading 3', arg: 'h3' },
  ],
  [
    { action: 'insertUnorderedList', icon: List, label: 'Bullet List' },
    { action: 'insertOrderedList', icon: ListOrdered, label: 'Numbered List' },
    { action: 'formatBlock', icon: Quote, label: 'Quote', arg: 'blockquote' },
    { action: 'formatBlock', icon: Code, label: 'Code', arg: 'pre' },
  ],
  [
    { action: 'justifyLeft', icon: AlignLeft, label: 'Align Left' },
    { action: 'justifyCenter', icon: AlignCenter, label: 'Align Center' },
    { action: 'justifyRight', icon: AlignRight, label: 'Align Right' },
  ],
  [{ action: 'createLink', icon: Link, label: 'Insert Link' }],
  [
    { action: 'undo', icon: Undo, label: 'Undo' },
    { action: 'redo', icon: Redo, label: 'Redo' },
  ],
]

const ToolbarButtonComponent = memo(function ToolbarButton({
  button,
  onAction,
}: {
  button: ToolbarButton
  onAction: (action: ToolbarAction, arg?: string) => void
}) {
  const Icon = button.icon
  return (
    <Toggle
      size="sm"
      aria-label={button.label}
      onPressedChange={() => onAction(button.action, button.arg)}
      className="h-8 w-8 p-0"
    >
      <Icon className="h-4 w-4" />
    </Toggle>
  )
})

export const RichTextToolbar = memo(function RichTextToolbar({
  onAction,
}: {
  onAction: (action: ToolbarAction, arg?: string) => void
}) {
  return (
    <div className="bg-muted/30 flex flex-wrap items-center gap-1 border-b p-1">
      {TOOLBAR_GROUPS.map((group, groupIndex) => (
        <div key={groupIndex} className="flex items-center">
          {groupIndex > 0 && (
            <Separator orientation="vertical" className="mx-1 h-6" />
          )}
          {group.map((button, buttonIndex) => (
            <ToolbarButtonComponent
              key={`${groupIndex}-${buttonIndex}`}
              button={button}
              onAction={onAction}
            />
          ))}
        </div>
      ))}
    </div>
  )
})
