/**
 * Component tests for TwoFactorVerifyForm — QR local, backup codes y submit.
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TwoFactorVerifyForm } from '@/modules/auth/components/two-factor/verify-form.client'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const TOTP_URI =
  'otpauth://totp/App:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=App'

describe('TwoFactorVerifyForm', () => {
  it('renderiza el QR como SVG local y NO como imagen de un tercero', () => {
    const { container } = render(
      <TwoFactorVerifyForm
        totpUri={TOTP_URI}
        backupCodes={[]}
        error={null}
        isPending={false}
        onSubmit={vi.fn()}
      />,
    )
    // El QR se genera en el cliente (svg), el secreto no sale a api.qrserver.com.
    expect(container.querySelector('svg')).toBeInTheDocument()
    const externalImg = container.querySelector('img[src*="qrserver"]')
    expect(externalImg).toBeNull()
  })

  it('muestra los backup codes', () => {
    render(
      <TwoFactorVerifyForm
        totpUri={TOTP_URI}
        backupCodes={['AAA-111', 'BBB-222']}
        error={null}
        isPending={false}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByText('AAA-111')).toBeInTheDocument()
    expect(screen.getByText('BBB-222')).toBeInTheDocument()
  })

  it('llama onSubmit con el código introducido', async () => {
    const onSubmit = vi.fn()
    render(
      <TwoFactorVerifyForm
        totpUri={TOTP_URI}
        backupCodes={[]}
        error={null}
        isPending={false}
        onSubmit={onSubmit}
      />,
    )
    const input = screen.getByPlaceholderText('000000')
    fireEvent.change(input, { target: { value: '123456' } })
    fireEvent.submit(input.closest('form')!)
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ code: '123456' })
  })
})
