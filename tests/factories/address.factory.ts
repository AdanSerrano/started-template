/**
 * Factory para crear direcciones de test.
 */

interface MockAddress {
  id: string
  userId: string
  type: 'shipping' | 'billing'
  isDefault: boolean
  firstName: string
  lastName: string
  street: string
  city: string
  province: string | null
  postalCode: string
  country: string
  phone: string | null
  createdAt: Date
  updatedAt: Date
}

let counter = 0

export function createMockAddress(
  overrides: Partial<MockAddress> = {},
): MockAddress {
  counter++
  return {
    id: `test-address-${counter}`,
    userId: 'test-user-1',
    type: 'shipping',
    isDefault: counter === 1,
    firstName: `Name ${counter}`,
    lastName: `Surname ${counter}`,
    street: `Calle Test ${counter}`,
    city: 'Barcelona',
    province: 'Barcelona',
    postalCode: '08001',
    country: 'ES',
    phone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}
