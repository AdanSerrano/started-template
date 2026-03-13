import { z } from 'zod/v4'

export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().max(50).optional().or(z.literal('')),
})

export const addressFormSchema = z.object({
  id: z.string().optional().or(z.literal('')),
  type: z.enum(['shipping', 'billing']),
  isDefault: z.boolean(),
  firstName: z.string().min(1, 'Nombre requerido').max(100),
  lastName: z.string().min(1, 'Apellido requerido').max(100),
  street: z.string().min(1, 'Direccion requerida').max(255),
  city: z.string().min(1, 'Ciudad requerida').max(100),
  province: z.string().max(100).optional().or(z.literal('')),
  postalCode: z.string().min(1, 'Codigo postal requerido').max(20),
  country: z.string().length(2),
  phone: z.string().max(50).optional().or(z.literal('')),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Contrasena actual requerida'),
    newPassword: z.string().min(8, 'Minimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contrasena'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contrasenas no coinciden',
    path: ['confirmPassword'],
  })

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type AddressFormInput = z.infer<typeof addressFormSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
