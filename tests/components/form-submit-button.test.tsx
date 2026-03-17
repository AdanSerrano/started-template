/**
 * Component tests — FormSubmitButton, FormButtonGroup, FormCancelButton.
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import {
  FormSubmitButton,
  FormButtonGroup,
  FormCancelButton,
} from '@/components/forms/form-submit-button'

describe('FormSubmitButton', () => {
  it('renders with text', () => {
    render(<FormSubmitButton text="Guardar" />)
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('has type submit', () => {
    render(<FormSubmitButton text="Save" />)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('shows loading state when isPending', () => {
    render(<FormSubmitButton text="Save" isPending />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('shows custom loading text when isPending', () => {
    render(<FormSubmitButton text="Save" loadingText="Saving..." isPending />)
    expect(screen.getByRole('button')).toHaveTextContent('Saving...')
  })

  it('is disabled when disabled prop is true', () => {
    render(<FormSubmitButton text="Save" disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies full width class', () => {
    render(<FormSubmitButton text="Save" fullWidth />)
    expect(screen.getByRole('button').className).toContain('w-full')
  })
})

describe('FormButtonGroup', () => {
  it('renders children', () => {
    render(
      <FormButtonGroup>
        <button>A</button>
        <button>B</button>
      </FormButtonGroup>,
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('aligns right by default', () => {
    const { container } = render(
      <FormButtonGroup>
        <button>Test</button>
      </FormButtonGroup>,
    )
    expect(container.firstChild).toHaveClass('justify-end')
  })

  it('supports between alignment', () => {
    const { container } = render(
      <FormButtonGroup align="between">
        <button>A</button>
        <button>B</button>
      </FormButtonGroup>,
    )
    expect(container.firstChild).toHaveClass('justify-between')
  })
})

describe('FormCancelButton', () => {
  it('renders with default text', () => {
    render(<FormCancelButton />)
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('renders with custom text', () => {
    render(<FormCancelButton text="Cancelar" />)
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
  })

  it('has type button (not submit)', () => {
    render(<FormCancelButton />)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('calls onClick handler', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<FormCancelButton onClick={handleClick} />)

    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
