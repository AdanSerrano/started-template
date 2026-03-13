import { z } from 'zod/v4'

type T = (key: string) => string

export function createLoginSchema(t: T) {
  return z.object({
    identifier: z.string().min(3, t('identifierMin')),
    password: z.string().min(8, t('passwordMin')),
  })
}

export function createRegisterSchema(t: T) {
  return z.object({
    name: z.string().min(2, t('nameMin')).max(100),
    username: z
      .string()
      .min(3, t('usernameMin'))
      .max(30, t('usernameMax'))
      .regex(/^[a-zA-Z0-9_.]+$/, t('usernamePattern')),
    email: z.string().email(t('emailInvalid')),
    password: z.string().min(8, t('passwordMin')),
  })
}

export function createTwoFactorVerifySchema(t: T) {
  return z.object({
    code: z
      .string()
      .length(6, t('codeLength'))
      .regex(/^\d{6}$/, t('codePattern')),
  })
}

export function createTwoFactorEnableSchema(t: T) {
  return z.object({
    password: z.string().min(8, t('passwordMin')),
  })
}

export function createForgotPasswordSchema(t: T) {
  return z.object({
    email: z.string().email(t('emailInvalid')),
  })
}

export function createResetPasswordSchema(t: T) {
  return z
    .object({
      password: z.string().min(8, t('passwordMin')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('passwordsDoNotMatch'),
      path: ['confirmPassword'],
    })
}

// Inferred types from the schemas
export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>
export type RegisterInput = z.infer<ReturnType<typeof createRegisterSchema>>
export type TwoFactorVerifyInput = z.infer<
  ReturnType<typeof createTwoFactorVerifySchema>
>
export type TwoFactorEnableInput = z.infer<
  ReturnType<typeof createTwoFactorEnableSchema>
>
export type ForgotPasswordInput = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>
export type ResetPasswordInput = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>
