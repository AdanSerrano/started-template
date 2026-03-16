/**
 * MSW handlers — mocks para API routes.
 *
 * Estos handlers interceptan requests HTTP durante tests
 * para simular respuestas del servidor.
 */

import { http, HttpResponse } from 'msw'

export const handlers = [
  // Health check
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'healthy',
      services: {
        database: { status: 'up', latencyMs: 5 },
      },
      timestamp: new Date().toISOString(),
      uptime: 1000,
    })
  }),

  // Auth session (mock)
  http.get('/api/auth/session', () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      },
      session: {
        id: 'test-session-1',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
    })
  }),
]
