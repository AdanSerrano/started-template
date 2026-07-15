import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import importPlugin from 'eslint-plugin-import'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Override default ignores of eslint-config-next.
  // catalog/ contiene piezas opcionales fuera del arbol activo (ver docs/catalog.md).
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'next-env.d.ts',
    'catalog/**',
  ]),

  // Accessibility — enforce stricter jsx-a11y rules (already loaded by next)
  {
    rules: {
      'jsx-a11y/alt-text': ['error', { img: ['NextImage'] }],
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-redundant-roles': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/tabindex-no-positive': 'error',
    },
  },

  // Import ordering & hygiene
  {
    plugins: { import: importPlugin },
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true },
      },
    },
    rules: {
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'type',
          ],
          pathGroups: [
            { pattern: '@/**', group: 'internal', position: 'before' },
          ],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',
    },
  },

  // TypeScript strict rules & no-console
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
])

export default eslintConfig
