import { useCallback, useRef, useState } from 'react'
import type { MentionUser } from './form-mention-field'

interface MentionState {
  isActive: boolean
  query: string
  startIndex: number
}

export function getMentionState(
  text: string,
  cursorPosition: number,
  trigger: string,
): MentionState {
  const beforeCursor = text.slice(0, cursorPosition)
  const lastTriggerIndex = beforeCursor.lastIndexOf(trigger)

  if (lastTriggerIndex === -1) {
    return { isActive: false, query: '', startIndex: -1 }
  }

  const textAfterTrigger = beforeCursor.slice(lastTriggerIndex + trigger.length)

  if (textAfterTrigger.includes(' ') || textAfterTrigger.includes('\n')) {
    return { isActive: false, query: '', startIndex: -1 }
  }

  const charBeforeTrigger =
    lastTriggerIndex > 0 ? beforeCursor[lastTriggerIndex - 1] : ' '
  if (
    charBeforeTrigger !== ' ' &&
    charBeforeTrigger !== '\n' &&
    lastTriggerIndex !== 0
  ) {
    return { isActive: false, query: '', startIndex: -1 }
  }

  return {
    isActive: true,
    query: textAfterTrigger.toLowerCase(),
    startIndex: lastTriggerIndex,
  }
}

interface UseMentionFieldOptions {
  field: {
    value: string | undefined
    onChange: (value: string) => void
    ref: (el: HTMLTextAreaElement | null) => void
  }
  trigger: string
  filterUsers: (query: string) => MentionUser[]
}

export function useMentionField({
  field,
  trigger,
  filterUsers,
}: UseMentionFieldOptions) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedIndexRef = useRef(0)
  const mentionStateRef = useRef<MentionState>({
    isActive: false,
    query: '',
    startIndex: -1,
  })
  const [mentionActive, setMentionActive] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')

  const insertMention = useCallback(
    (user: MentionUser) => {
      const textarea = textareaRef.current
      if (!textarea) return

      const { startIndex } = mentionStateRef.current
      const currentValue = field.value || ''
      const beforeMention = currentValue.slice(0, startIndex)
      const afterMention = currentValue.slice(textarea.selectionStart)
      const newValue = `${beforeMention}${trigger}${user.username} ${afterMention}`

      field.onChange(newValue)
      mentionStateRef.current.isActive = false
      setMentionActive(false)

      const newCursorPosition =
        startIndex + trigger.length + user.username.length + 1
      requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(newCursorPosition, newCursorPosition)
      })
    },
    [field, trigger],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      const cursorPosition = e.target.selectionStart
      const newState = getMentionState(value, cursorPosition, trigger)
      mentionStateRef.current = newState
      selectedIndexRef.current = 0
      setSelectedIndex(0)
      setMentionActive(newState.isActive)
      setMentionQuery(newState.query)
      field.onChange(value)
    },
    [field, trigger],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!mentionStateRef.current.isActive) return

      const filteredUsers = filterUsers(mentionStateRef.current.query)
      if (filteredUsers.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const next = Math.min(
          selectedIndexRef.current + 1,
          filteredUsers.length - 1,
        )
        selectedIndexRef.current = next
        setSelectedIndex(next)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const prev = Math.max(selectedIndexRef.current - 1, 0)
        selectedIndexRef.current = prev
        setSelectedIndex(prev)
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        const user = filteredUsers[selectedIndexRef.current]
        if (user) {
          insertMention(user)
        }
      } else if (e.key === 'Escape') {
        mentionStateRef.current.isActive = false
        setMentionActive(false)
      }
    },
    [filterUsers, insertMention],
  )

  const handleTextareaRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      field.ref(el)
      textareaRef.current = el
    },
    [field],
  )

  const filteredUsers = mentionActive ? filterUsers(mentionQuery) : []
  const isPopoverOpen = mentionActive && filteredUsers.length > 0

  return {
    selectedIndex,
    insertMention,
    handleChange,
    handleKeyDown,
    handleTextareaRef,
    filteredUsers,
    isPopoverOpen,
  }
}
