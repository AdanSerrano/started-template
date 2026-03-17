/**
 * Component tests for AddressForm — rendering, fields, new vs edit mode.
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AddressForm } from '@/modules/account/components/address-form.client'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock i18n navigation
const mockPush = vi.fn()
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock actions
vi.mock('@/modules/account/actions/account-actions', () => ({
  createAddressAction: vi.fn().mockResolvedValue({ success: true }),
  updateAddressAction: vi.fn().mockResolvedValue({ success: true }),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

describe('AddressForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all required fields for new address', () => {
    render(<AddressForm />)

    expect(screen.getByText('firstName')).toBeInTheDocument()
    expect(screen.getByText('lastName')).toBeInTheDocument()
    expect(screen.getByText('street')).toBeInTheDocument()
    expect(screen.getByText('city')).toBeInTheDocument()
    expect(screen.getByText('postalCode')).toBeInTheDocument()
  })

  it('renders optional fields', () => {
    render(<AddressForm />)

    expect(screen.getByText('province')).toBeInTheDocument()
    expect(screen.getByText('phone')).toBeInTheDocument()
  })

  it('shows create button for new address', () => {
    render(<AddressForm />)

    const submitBtn = screen.getByRole('button', { name: /createBtn/i })
    expect(submitBtn).toBeInTheDocument()
  })

  it('shows update button for editing existing address', () => {
    render(
      <AddressForm
        defaultValues={{
          id: 'addr-1',
          type: 'shipping',
          isDefault: false,
          firstName: 'Test',
          lastName: 'User',
          street: 'Calle Test',
          city: 'Barcelona',
          province: 'Barcelona',
          postalCode: '08001',
          country: 'ES',
          phone: '',
        }}
      />,
    )

    const submitBtn = screen.getByRole('button', { name: /updateBtn/i })
    expect(submitBtn).toBeInTheDocument()
  })

  it('populates fields with existing values in edit mode', () => {
    render(
      <AddressForm
        defaultValues={{
          id: 'addr-1',
          type: 'shipping',
          isDefault: false,
          firstName: 'Maria',
          lastName: 'Garcia',
          street: 'Gran Via 1',
          city: 'Madrid',
          province: 'Madrid',
          postalCode: '28001',
          country: 'ES',
          phone: '+34600111222',
        }}
      />,
    )

    expect(screen.getByDisplayValue('Maria')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Garcia')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Gran Via 1')).toBeInTheDocument()
    expect(screen.getAllByDisplayValue('Madrid')).toHaveLength(2)
  })

  it('renders cancel button', () => {
    render(<AddressForm />)

    const cancelBtn = screen.getByRole('button', { name: /cancel/i })
    expect(cancelBtn).toBeInTheDocument()
  })

  it('allows typing in first name field', async () => {
    const user = userEvent.setup()
    render(<AddressForm />)

    const inputs = screen.getAllByRole('textbox')
    const firstNameInput = inputs[0]!
    await user.type(firstNameInput, 'Carlos')

    expect(firstNameInput).toHaveValue('Carlos')
  })
})
