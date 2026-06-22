'use client'

import {
  Bold,
  Italic,
  Code,
  Link,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Image,
  Quote,
  Minus,
} from 'lucide-react'
import { memo } from 'react'
import { Toggle } from '@/components/ui/toggle'

export interface MarkdownAction {
  icon: React.ElementType
  label: string
  prefix: string
  suffix: string
  block?: boolean | undefined
}

export const MARKDOWN_ACTIONS: MarkdownAction[] = [
  { icon: Bold, label: 'Bold', prefix: '**', suffix: '**' },
  { icon: Italic, label: 'Italic', prefix: '_', suffix: '_' },
  { icon: Code, label: 'Code', prefix: '`', suffix: '`' },
  { icon: Link, label: 'Link', prefix: '[', suffix: '](url)' },
  { icon: Image, label: 'Image', prefix: '![alt](', suffix: ')' },
  { icon: Heading1, label: 'H1', prefix: '# ', suffix: '', block: true },
  { icon: Heading2, label: 'H2', prefix: '## ', suffix: '', block: true },
  { icon: List, label: 'List', prefix: '- ', suffix: '', block: true },
  {
    icon: ListOrdered,
    label: 'Numbered',
    prefix: '1. ',
    suffix: '',
    block: true,
  },
  { icon: Quote, label: 'Quote', prefix: '> ', suffix: '', block: true },
  { icon: Minus, label: 'Divider', prefix: '\n---\n', suffix: '', block: true },
]

export const MarkdownToolbar = memo(function MarkdownToolbar({
  onAction,
}: {
  onAction: (action: MarkdownAction) => void
}) {
  return (
    <div className="bg-muted/30 flex flex-wrap items-center gap-1 border-b p-1">
      {MARKDOWN_ACTIONS.map((action, index) => {
        const Icon = action.icon
        return (
          <Toggle
            key={index}
            size="sm"
            aria-label={action.label}
            onPressedChange={() => onAction(action)}
            className="h-8 w-8 p-0"
          >
            <Icon className="h-4 w-4" />
          </Toggle>
        )
      })}
    </div>
  )
})
