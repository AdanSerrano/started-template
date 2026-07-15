import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e', 'catalog'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      // all: true cuenta TODOS los archivos incluidos, no solo los importados por
      // un test → la cobertura es honesta (los no testeados cuentan como 0%).
      all: true,
      // Cobertura de la capa de LÓGICA (actions/services/repos/lib/utils). Los
      // componentes (.tsx) se cubren con component tests y E2E, no aquí.
      include: ['lib/**/*.ts', 'modules/**/*.ts'],
      exclude: [
        'node_modules/',
        '.next/',
        'tests/',
        'e2e/',
        '*.config.*',
        'components/ui/',
        'messages/',
        'db/migrations/',
        '**/types.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        statements: 50,
        branches: 50,
        functions: 50,
        lines: 50,
      },
    },
  },
})
