/**
 * Component test — RegisterForm.
 *
 * Tests: rendering, all form fields, submit button state.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signUp: {
      email: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  },
}))

vi.mock('@/routes', () => ({
  DEFAULT_LOGOUT_REDIRECT: '/login',
}))

vi.mock('@/components/password-strength.client', () => ({
  PasswordStrengthField: () => null,
}))

import { RegisterForm } from '@/modules/auth/components/register-form.client'

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all four form fields', () => {
    render(<RegisterForm />)

    expect(screen.getByText('nameLabel')).toBeInTheDocument()
    expect(screen.getByText('usernameLabel')).toBeInTheDocument()
    expect(screen.getByText('emailLabel')).toBeInTheDocument()
    expect(screen.getByText('passwordLabel')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<RegisterForm />)

    expect(
      screen.getByRole('button', { name: 'submitButton' }),
    ).toBeInTheDocument()
  })

  it('renders placeholders', () => {
    render(<RegisterForm />)

    expect(screen.getByPlaceholderText('namePlaceholder')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('usernamePlaceholder'),
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText('emailPlaceholder')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('********')).toBeInTheDocument()
  })

  it('accepts input in name field', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const input = screen.getByPlaceholderText('namePlaceholder')
    await user.type(input, 'John Doe')

    expect(input).toHaveValue('John Doe')
  })

  it('accepts input in username field', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const input = screen.getByPlaceholderText('usernamePlaceholder')
    await user.type(input, 'john_doe')

    expect(input).toHaveValue('john_doe')
  })

  it('accepts input in email field', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    const input = screen.getByPlaceholderText('emailPlaceholder')
    await user.type(input, 'john@test.com')

    expect(input).toHaveValue('john@test.com')
  })

  it('submit button is enabled by default', () => {
    render(<RegisterForm />)

    expect(screen.getByRole('button', { name: 'submitButton' })).toBeEnabled()
  })
})
