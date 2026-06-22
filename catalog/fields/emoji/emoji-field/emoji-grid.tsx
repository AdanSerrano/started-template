'use client'

import { memo, useCallback } from 'react'

interface EmojiButtonProps {
  emoji: string
  onSelect: (emoji: string) => void
}

const EmojiButton = memo(function EmojiButton({
  emoji,
  onSelect,
}: EmojiButtonProps) {
  const handleClick = useCallback(() => {
    onSelect(emoji)
  }, [emoji, onSelect])

  return (
    <button
      type="button"
      className="hover:bg-accent flex h-8 w-8 items-center justify-center rounded text-xl transition-colors"
      onClick={handleClick}
    >
      {emoji}
    </button>
  )
})

export const EmojiGrid = memo(function EmojiGrid({
  emojis,
  onSelect,
}: {
  emojis: string[]
  onSelect: (emoji: string) => void
}) {
  return (
    <div className="grid grid-cols-8 gap-1 p-2">
      {emojis.map((emoji, index) => (
        <EmojiButton
          key={`${emoji}-${index}`}
          emoji={emoji}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
})

interface SelectedEmojiButtonProps {
  emoji: string
  onRemove: (emoji: string) => void
}

export const SelectedEmojiButton = memo(function SelectedEmojiButton({
  emoji,
  onRemove,
}: SelectedEmojiButtonProps) {
  const handleClick = useCallback(() => {
    onRemove(emoji)
  }, [emoji, onRemove])

  return (
    <button
      type="button"
      className="hover:bg-destructive/10 hover:border-destructive flex h-8 w-8 items-center justify-center rounded border text-lg transition-colors"
      onClick={handleClick}
      title="Remove"
    >
      {emoji}
    </button>
  )
})
