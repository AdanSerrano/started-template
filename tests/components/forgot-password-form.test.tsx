/**
 * Component test — ForgotPasswordForm.
 *
 * Tests: rendering, email input, submit, success state (OWASP).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    requestPasswordReset: vi.fn().mockResolvedValue({ data: {} }),
  },
}))

import { ForgotPasswordForm } from '@/modules/auth/components/forgot-password-form.client'

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email field and submit button', () => {
    render(<ForgotPasswordForm />)

    expect(screen.getByText('emailLabel')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'submitButton' }),
    ).toBeInTheDocument()
  })

  it('renders email placeholder', () => {
    render(<ForgotPasswordForm />)

    expect(screen.getByPlaceholderText('emailPlaceholder')).toBeInTheDocument()
  })

  it('accepts email input', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordForm />)

    const input = screen.getByPlaceholderText('emailPlaceholder')
    await user.type(input, 'test@email.com')

    expect(input).toHaveValue('test@email.com')
  })

  it('shows success state after submit (OWASP: never reveals if email exists)', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordForm />)

    const input = screen.getByPlaceholderText('emailPlaceholder')
    await user.type(input, 'test@email.com')
    await user.click(screen.getByRole('button', { name: 'submitButton' }))

    await waitFor(() => {
      expect(screen.getByText('checkEmailTitle')).toBeInTheDocument()
    })
  })

  it('submit button is enabled by default', () => {
    render(<ForgotPasswordForm />)

    expect(screen.getByRole('button', { name: 'submitButton' })).toBeEnabled()
  })
})
