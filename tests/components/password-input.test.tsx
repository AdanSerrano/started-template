/**
 * Component test — PasswordInput toggle visibility.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordInput } from '@/components/ui/password-input.client'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      showPassword: 'Show password',
      hidePassword: 'Hide password',
    }
    return map[key] ?? key
  },
}))

describe('PasswordInput', () => {
  it('renders as password input by default', () => {
    render(<PasswordInput placeholder="Password" />)
    const input = screen.getByPlaceholderText('Password')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('toggles to text input on button click', async () => {
    const user = userEvent.setup()
    render(<PasswordInput placeholder="Password" />)

    const toggleBtn = screen.getByRole('button', { name: 'Show password' })
    await user.click(toggleBtn)

    const input = screen.getByPlaceholderText('Password')
    expect(input).toHaveAttribute('type', 'text')
  })

  it('toggles back to password on second click', async () => {
    const user = userEvent.setup()
    render(<PasswordInput placeholder="Password" />)

    const toggleBtn = screen.getByRole('button', { name: 'Show password' })
    await user.click(toggleBtn)
    await user.click(screen.getByRole('button', { name: 'Hide password' }))

    const input = screen.getByPlaceholderText('Password')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('is disabled when disabled prop is passed', () => {
    render(<PasswordInput placeholder="Password" disabled />)
    expect(screen.getByPlaceholderText('Password')).toBeDisabled()
    // The toggle button is always enabled (not tied to disabled prop)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
