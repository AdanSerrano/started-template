/**
 * Component tests for AddressCard — rendering, actions, default badge.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  deleteAddressAction,
  setDefaultAddressAction,
} from '@/modules/account/actions/account-actions'
import { AddressCard } from '@/modules/account/components/address-card.client'

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
  deleteAddressAction: vi.fn().mockResolvedValue({ success: true }),
  setDefaultAddressAction: vi.fn().mockResolvedValue({ success: true }),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const baseAddress = {
  id: 'addr-1',
  userId: 'user-1',
  type: 'shipping' as const,
  isDefault: false,
  firstName: 'Carlos',
  lastName: 'Martinez',
  street: 'Calle Mayor 10',
  city: 'Barcelona',
  province: 'Barcelona',
  postalCode: '08001',
  country: 'ES',
  phone: '+34600123456',
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('AddressCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders address details', () => {
    render(<AddressCard address={baseAddress} />)

    expect(screen.getByText('Carlos Martinez')).toBeInTheDocument()
    expect(screen.getByText('Calle Mayor 10')).toBeInTheDocument()
    expect(screen.getByText('08001 Barcelona, Barcelona')).toBeInTheDocument()
    expect(screen.getByText('+34600123456')).toBeInTheDocument()
  })

  it('shows set default button for non-default address', () => {
    render(<AddressCard address={baseAddress} />)

    const setDefaultBtn = screen.getByRole('button', { name: /setDefault/i })
    expect(setDefaultBtn).toBeInTheDocument()
  })

  it('hides set default button for default address', () => {
    render(<AddressCard address={{ ...baseAddress, isDefault: true }} />)

    const buttons = screen.getAllByRole('button')
    const setDefaultBtn = buttons.find((btn) =>
      btn.textContent?.includes('setDefault'),
    )
    expect(setDefaultBtn).toBeUndefined()
  })

  it('shows default badge for default address', () => {
    render(<AddressCard address={{ ...baseAddress, isDefault: true }} />)

    expect(screen.getByText('default')).toBeInTheDocument()
  })

  it('renders edit link', () => {
    render(<AddressCard address={baseAddress} />)

    const editLink = screen.getByRole('link', { name: /edit/i })
    expect(editLink).toHaveAttribute('href', '/account/addresses/addr-1/edit')
  })

  it('renders delete button', () => {
    render(<AddressCard address={baseAddress} />)

    const deleteBtn = screen.getByRole('button', { name: /delete/i })
    expect(deleteBtn).toBeInTheDocument()
  })

  it('renders address without phone', () => {
    render(<AddressCard address={{ ...baseAddress, phone: null }} />)

    expect(screen.getByText('Carlos Martinez')).toBeInTheDocument()
    expect(screen.queryByText('+34600123456')).not.toBeInTheDocument()
  })

  it('renders address without province', () => {
    render(<AddressCard address={{ ...baseAddress, province: null }} />)

    expect(screen.getByText('08001 Barcelona')).toBeInTheDocument()
  })

  describe('interactions', () => {
    it('calls deleteAddressAction with the address id on delete', async () => {
      render(<AddressCard address={baseAddress} />)
      await userEvent.click(screen.getByRole('button', { name: /delete/i }))
      await waitFor(() =>
        expect(deleteAddressAction).toHaveBeenCalledWith('addr-1'),
      )
    })

    it('calls setDefaultAddressAction with the address id on set-default', async () => {
      render(<AddressCard address={baseAddress} />)
      await userEvent.click(screen.getByRole('button', { name: /setDefault/i }))
      await waitFor(() =>
        expect(setDefaultAddressAction).toHaveBeenCalledWith('addr-1'),
      )
    })
  })
})
