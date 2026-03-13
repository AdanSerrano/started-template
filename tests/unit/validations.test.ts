import { describe, it, expect } from 'vitest'
import {
  createProfileUpdateSchema,
  createAddressFormSchema,
  createChangePasswordSchema,
} from '@/modules/account/validations'

const t = (key: string) => key

describe('ProfileUpdateSchema', () => {
  const schema = createProfileUpdateSchema(t)

  it('should accept valid profile data', () => {
    const result = schema.safeParse({
      name: 'John Doe',
      phone: '+34 600 000 000',
    })
    expect(result.success).toBe(true)
  })

  it('should reject name shorter than 2 characters', () => {
    const result = schema.safeParse({ name: 'J' })
    expect(result.success).toBe(false)
  })

  it('should allow empty phone', () => {
    const result = schema.safeParse({ name: 'John', phone: '' })
    expect(result.success).toBe(true)
  })
})

describe('AddressFormSchema', () => {
  const schema = createAddressFormSchema(t)

  const validAddress = {
    type: 'shipping',
    isDefault: false,
    firstName: 'John',
    lastName: 'Doe',
    street: '123 Main St',
    city: 'Barcelona',
    postalCode: '08001',
    country: 'ES',
  }

  it('should accept valid address', () => {
    const result = schema.safeParse(validAddress)
    expect(result.success).toBe(true)
  })

  it('should reject missing required fields', () => {
    const result = schema.safeParse({ type: 'shipping' })
    expect(result.success).toBe(false)
  })

  it('should reject invalid country code', () => {
    const result = schema.safeParse({ ...validAddress, country: 'Spain' })
    expect(result.success).toBe(false)
  })
})

describe('ChangePasswordSchema', () => {
  const schema = createChangePasswordSchema(t)

  it('should accept matching passwords', () => {
    const result = schema.safeParse({
      currentPassword: 'oldpass123',
      newPassword: 'newpass123',
      confirmPassword: 'newpass123',
    })
    expect(result.success).toBe(true)
  })

  it('should reject mismatched passwords', () => {
    const result = schema.safeParse({
      currentPassword: 'oldpass123',
      newPassword: 'newpass123',
      confirmPassword: 'different',
    })
    expect(result.success).toBe(false)
  })

  it('should reject short new password', () => {
    const result = schema.safeParse({
      currentPassword: 'oldpass123',
      newPassword: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
  })
})
