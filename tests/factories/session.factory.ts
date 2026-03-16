/**
 * Factory para crear sesiones de test.
 */

interface MockSession {
  user: {
    id: string
    name: string
    email: string
    role: 'super_admin' | 'admin' | 'user'
  }
  session: {
    id: string
    expiresAt: string
  }
}

let counter = 0

export function createMockSession(
  overrides: Partial<MockSession['user']> = {},
): MockSession {
  counter++
  return {
    user: {
      id: `test-user-${counter}`,
      name: `Test User ${counter}`,
      email: `user${counter}@test.com`,
      role: 'user',
      ...overrides,
    },
    session: {
      id: `test-session-${counter}`,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    },
  }
}
