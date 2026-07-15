/**
 * Component tests for TwoFactorIdleState — estado y toggle de 2FA.
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TwoFactorIdleState } from '@/modules/auth/components/two-factor/idle-state.client'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('TwoFactorIdleState', () => {
  it('muestra "enable" cuando 2FA está desactivado', () => {
    render(<TwoFactorIdleState isEnabled={false} onToggle={vi.fn()} />)
    expect(screen.getByRole('button', { name: /enable/i })).toBeInTheDocument()
    expect(screen.getByText('disabledDesc')).toBeInTheDocument()
  })

  it('muestra "disable" cuando 2FA está activado', () => {
    render(<TwoFactorIdleState isEnabled={true} onToggle={vi.fn()} />)
    expect(screen.getByRole('button', { name: /disable/i })).toBeInTheDocument()
    expect(screen.getByText('enabledDesc')).toBeInTheDocument()
  })

  it('llama onToggle al pulsar el botón', async () => {
    const onToggle = vi.fn()
    render(<TwoFactorIdleState isEnabled={false} onToggle={onToggle} />)
    await userEvent.click(screen.getByRole('button', { name: /enable/i }))
    expect(onToggle).toHaveBeenCalledOnce()
  })
})
