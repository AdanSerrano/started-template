import { resetProviders } from '@/lib/providers'

/**
 * Reset all provider singletons after each test.
 */
export function setupProviderCleanup() {
  afterEach(() => {
    resetProviders()
  })
}

/**
 * Mock data factories for common entities.
 */
export const factories = {
  user(
    overrides?: Partial<{
      id: string
      name: string
      email: string
      role: string
    }>,
  ) {
    return {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user' as const,
      ...overrides,
    }
  },

  session(overrides?: Partial<{ user: ReturnType<typeof factories.user> }>) {
    return {
      user: factories.user(overrides?.user),
      session: {
        id: 'session-1',
        token: 'test-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }
  },

  address(overrides?: Partial<Record<string, unknown>>) {
    return {
      id: 'addr-1',
      userId: 'user-1',
      type: 'shipping' as const,
      isDefault: false,
      firstName: 'Test',
      lastName: 'User',
      street: '123 Main St',
      city: 'Barcelona',
      province: 'Barcelona',
      postalCode: '08001',
      country: 'ES',
      phone: '+34 600 000 000',
      ...overrides,
    }
  },
}
