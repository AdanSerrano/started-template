/**
 * Component test example — FormTextField.
 *
 * Patron: render con FormProvider, interactuar, verificar.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, FormProvider } from 'react-hook-form'
import { FormTextField } from '@/components/forms/form-text-field'

function TestWrapper({
  children,
  defaultValues = {},
}: {
  children: React.ReactNode
  defaultValues?: Record<string, string>
}) {
  const form = useForm({ defaultValues })
  return <FormProvider {...form}>{children}</FormProvider>
}

describe('FormTextField', () => {
  it('renders label and placeholder', () => {
    render(
      <TestWrapper>
        <FormTextField name="name" label="Nombre" placeholder="Tu nombre" />
      </TestWrapper>,
    )

    expect(screen.getByText('Nombre')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Tu nombre')).toBeInTheDocument()
  })

  it('shows required indicator when required', () => {
    render(
      <TestWrapper>
        <FormTextField name="email" label="Email" required />
      </TestWrapper>,
    )

    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('accepts user input', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <FormTextField name="city" label="Ciudad" placeholder="Ciudad" />
      </TestWrapper>,
    )

    const input = screen.getByPlaceholderText('Ciudad')
    await user.type(input, 'Barcelona')

    expect(input).toHaveValue('Barcelona')
  })

  it('renders with default value', () => {
    render(
      <TestWrapper defaultValues={{ name: 'Test' }}>
        <FormTextField name="name" label="Nombre" />
      </TestWrapper>,
    )

    expect(screen.getByDisplayValue('Test')).toBeInTheDocument()
  })

  it('disables input when disabled prop is true', () => {
    render(
      <TestWrapper>
        <FormTextField name="name" label="Nombre" disabled />
      </TestWrapper>,
    )

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('shows description text', () => {
    render(
      <TestWrapper>
        <FormTextField
          name="bio"
          label="Bio"
          description="Escribe algo sobre ti"
        />
      </TestWrapper>,
    )

    expect(screen.getByText('Escribe algo sobre ti')).toBeInTheDocument()
  })

  it('shows character count when enabled', () => {
    render(
      <TestWrapper defaultValues={{ bio: 'Hola' }}>
        <FormTextField name="bio" label="Bio" maxLength={100} showCharCount />
      </TestWrapper>,
    )

    expect(screen.getByText('4/100')).toBeInTheDocument()
  })
})
