'use client'

import { memo, type ReactNode, type ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type ButtonProps = ComponentProps<typeof Button>

export interface FormSubmitButtonProps extends Omit<
  ButtonProps,
  'type' | 'children'
> {
  isPending?: boolean | undefined
  text: string
  loadingText?: string | undefined
  icon?: ReactNode | undefined
  loadingIcon?: ReactNode | undefined
  fullWidth?: boolean | undefined
}

function FormSubmitButtonComponent({
  isPending = false,
  text,
  loadingText,
  icon,
  loadingIcon,
  fullWidth = false,
  disabled,
  className,
  ...props
}: FormSubmitButtonProps) {
  const LoadingSpinner = loadingIcon ?? (
    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
  )

  return (
    <Button
      type="submit"
      disabled={disabled || isPending}
      aria-busy={isPending}
      className={cn(fullWidth && 'w-full', className)}
      {...props}
    >
      {isPending ? (
        <>
          {LoadingSpinner}
          {loadingText ?? text}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {text}
        </>
      )}
    </Button>
  )
}

export const FormSubmitButton = memo(FormSubmitButtonComponent)
FormSubmitButton.displayName = 'FormSubmitButton'

export interface FormButtonGroupProps {
  children: ReactNode
  align?: 'left' | 'center' | 'right' | 'between' | undefined
  className?: string | undefined
}

function FormButtonGroupComponent({
  children,
  align = 'right',
  className,
}: FormButtonGroupProps) {
  const alignmentClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  }[align]

  return (
    <div className={cn('flex items-center gap-3', alignmentClass, className)}>
      {children}
    </div>
  )
}

export const FormButtonGroup = memo(FormButtonGroupComponent)
FormButtonGroup.displayName = 'FormButtonGroup'

export interface FormCancelButtonProps extends Omit<
  ButtonProps,
  'type' | 'children'
> {
  text?: string | undefined
  onClick?: (() => void) | undefined
}

function FormCancelButtonComponent({
  text = 'Cancel',
  onClick,
  variant = 'outline',
  ...props
}: FormCancelButtonProps) {
  return (
    <Button type="button" variant={variant} onClick={onClick} {...props}>
      {text}
    </Button>
  )
}

export const FormCancelButton = memo(FormCancelButtonComponent)
FormCancelButton.displayName = 'FormCancelButton'
