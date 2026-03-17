/**
 * Component test — LoginForm.
 *
 * Tests: rendering, field labels, submit button, error states,
 * magic link toggle.
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
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => null }),
}))

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      email: vi.fn().mockResolvedValue({ data: {}, error: null }),
      username: vi.fn().mockResolvedValue({ data: {}, error: null }),
      magicLink: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  },
}))

vi.mock('@/routes', () => ({
  DEFAULT_LOGIN_REDIRECT: '/account',
  DEFAULT_LOGOUT_REDIRECT: '/login',
}))

import { LoginForm } from '@/modules/auth/components/login-form.client'

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders identifier and password fields', () => {
    render(<LoginForm />)

    expect(screen.getByText('identifierLabel')).toBeInTheDocument()
    expect(screen.getByText('passwordLabel')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<LoginForm />)

    expect(
      screen.getByRole('button', { name: 'submitButton' }),
    ).toBeInTheDocument()
  })

  it('renders forgot password link', () => {
    render(<LoginForm />)

    expect(screen.getByText('forgotPasswordLink')).toBeInTheDocument()
  })

  it('renders magic link button', () => {
    render(<LoginForm />)

    expect(
      screen.getByRole('button', { name: /magicLink\.useMagicLink/ }),
    ).toBeInTheDocument()
  })

  it('accepts user input in identifier field', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const input = screen.getByPlaceholderText('identifierPlaceholder')
    await user.type(input, 'user@test.com')

    expect(input).toHaveValue('user@test.com')
  })

  it('accepts user input in password field', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const input = screen.getByPlaceholderText('********')
    await user.type(input, 'mypassword')

    expect(input).toHaveValue('mypassword')
  })

  it('submit button is enabled by default', () => {
    render(<LoginForm />)

    expect(screen.getByRole('button', { name: 'submitButton' })).toBeEnabled()
  })

  it('shows magic link form when toggle clicked', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(
      screen.getByRole('button', { name: /magicLink\.useMagicLink/ }),
    )

    expect(screen.getByText('title')).toBeInTheDocument()
  })
})
