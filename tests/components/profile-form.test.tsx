/**
 * Component tests for ProfileForm — rendering, form fields, submit behavior.
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProfileForm } from '@/modules/account/components/profile-form.client'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock i18n navigation
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock actions
vi.mock('@/modules/account/actions/account-actions', () => ({
  updateProfileAction: vi.fn().mockResolvedValue({ success: true }),
}))

// Mock upload utility
vi.mock('@/modules/account/utils/upload-avatar', () => ({
  uploadAvatar: vi.fn().mockResolvedValue('https://cdn.example.com/new.jpg'),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}))

describe('ProfileForm', () => {
  const defaultProps = {
    defaultValues: { name: 'John Doe', phone: '+34600000000' },
    userId: 'user-1',
    currentImage: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders name and phone fields with default values', () => {
    render(<ProfileForm {...defaultProps} />)

    const nameInput = screen.getByDisplayValue('John Doe')
    expect(nameInput).toBeInTheDocument()

    const phoneInput = screen.getByDisplayValue('+34600000000')
    expect(phoneInput).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<ProfileForm {...defaultProps} />)

    const submitBtn = screen.getByRole('button', { name: /saveBtn/i })
    expect(submitBtn).toBeInTheDocument()
  })

  it('renders avatar upload area', () => {
    render(<ProfileForm {...defaultProps} />)

    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
    expect(fileInput).toHaveAttribute('accept', 'image/*')
  })

  it('renders avatar label text', () => {
    render(<ProfileForm {...defaultProps} />)

    expect(screen.getByText('avatarLabel')).toBeInTheDocument()
    expect(screen.getByText('avatarHint')).toBeInTheDocument()
  })

  it('shows current image when provided', () => {
    render(
      <ProfileForm
        {...defaultProps}
        currentImage="https://cdn.example.com/avatar.jpg"
      />,
    )

    const img = screen.getByAltText('Avatar')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/avatar.jpg')
  })

  it('allows editing name field', async () => {
    const user = userEvent.setup()
    render(<ProfileForm {...defaultProps} />)

    const nameInput = screen.getByDisplayValue('John Doe')
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Smith')

    expect(nameInput).toHaveValue('Jane Smith')
  })
})
