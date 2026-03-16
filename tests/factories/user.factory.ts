/**
 * Factory para crear usuarios de test.
 */

interface MockUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  role: 'super_admin' | 'admin' | 'user'
  image: string | null
  phone: string | null
  username: string | null
  isActive: boolean
  twoFactorEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

let counter = 0

export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  counter++
  return {
    id: `test-user-${counter}`,
    name: `Test User ${counter}`,
    email: `user${counter}@test.com`,
    emailVerified: true,
    role: 'user',
    image: null,
    phone: null,
    username: `testuser${counter}`,
    isActive: true,
    twoFactorEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function createMockAdmin(overrides: Partial<MockUser> = {}): MockUser {
  return createMockUser({ role: 'admin', ...overrides })
}

export function createMockSuperAdmin(
  overrides: Partial<MockUser> = {},
): MockUser {
  return createMockUser({ role: 'super_admin', ...overrides })
}
