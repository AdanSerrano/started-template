import { z } from 'zod/v4'

type T = (key: string) => string

export function createProfileUpdateSchema(t: T) {
  return z.object({
    name: z.string().min(2, t('nameMin')),
    phone: z.string().max(50).optional().or(z.literal('')),
  })
}

export function createAddressFormSchema(t: T) {
  return z.object({
    id: z.string().optional().or(z.literal('')),
    type: z.enum(['shipping', 'billing']),
    isDefault: z.boolean(),
    firstName: z.string().min(1, t('firstNameRequired')).max(100),
    lastName: z.string().min(1, t('lastNameRequired')).max(100),
    street: z.string().min(1, t('streetRequired')).max(255),
    city: z.string().min(1, t('cityRequired')).max(100),
    province: z.string().max(100).optional().or(z.literal('')),
    postalCode: z.string().min(1, t('postalCodeRequired')).max(20),
    country: z.string().length(2),
    phone: z.string().max(50).optional().or(z.literal('')),
  })
}

export function createChangePasswordSchema(t: T) {
  return z
    .object({
      currentPassword: z.string().min(1, t('currentPasswordRequired')),
      newPassword: z.string().min(8, t('passwordMin')),
      confirmPassword: z.string().min(1, t('confirmPasswordRequired')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      error: t('passwordsDoNotMatch'),
      path: ['confirmPassword'],
    })
}

// Inferred types from the schemas
export type ProfileUpdateInput = z.infer<
  ReturnType<typeof createProfileUpdateSchema>
>
export type AddressFormInput = z.infer<
  ReturnType<typeof createAddressFormSchema>
>
export type ChangePasswordInput = z.infer<
  ReturnType<typeof createChangePasswordSchema>
>
