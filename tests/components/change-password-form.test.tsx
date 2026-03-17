/**
 * Component test — ChangePasswordForm.
 *
 * Tests: rendering, three password fields, submit button.
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChangePasswordForm } from '@/modules/account/components/change-password-form.client'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    changePassword: vi.fn().mockResolvedValue({ error: null }),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('ChangePasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders three password fields', () => {
    render(<ChangePasswordForm />)

    expect(screen.getByText('currentPassword')).toBeInTheDocument()
    expect(screen.getByText('newPassword')).toBeInTheDocument()
    expect(screen.getByText('confirmPassword')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<ChangePasswordForm />)

    expect(screen.getByRole('button', { name: 'saveBtn' })).toBeInTheDocument()
  })

  it('submit button is enabled by default', () => {
    render(<ChangePasswordForm />)

    expect(screen.getByRole('button', { name: 'saveBtn' })).toBeEnabled()
  })

  it('accepts input in password fields', async () => {
    const user = userEvent.setup()
    render(<ChangePasswordForm />)

    const inputs = screen.getAllByDisplayValue('')
    expect(inputs.length).toBeGreaterThanOrEqual(3)

    await user.type(inputs[0]!, 'oldpass123')
    expect(inputs[0]).toHaveValue('oldpass123')
  })
})
