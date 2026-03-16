#!/usr/bin/env node

/**
 * Validates commit messages follow conventional commits format.
 *
 * Valid: feat: add login page
 * Valid: fix(auth): resolve session timeout
 * Valid: docs: update README
 * Invalid: added login page
 * Invalid: Fix stuff
 */

import { readFileSync } from 'node:fs'

const msgFile = process.argv[2]
if (!msgFile) {
  console.error('Usage: node validate-commit-msg.mjs <commit-msg-file>')
  process.exit(1)
}

const msg = readFileSync(msgFile, 'utf-8').trim()

// Skip merge commits
if (msg.startsWith('Merge ')) process.exit(0)

const TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
]

const pattern = new RegExp(
  `^(${TYPES.join('|')})(\\([a-z0-9-]+\\))?!?: .{1,100}$`,
)

if (!pattern.test(msg.split('\n')[0])) {
  console.error('')
  console.error('Invalid commit message format.')
  console.error('')
  console.error('Expected: <type>[optional scope]: <description>')
  console.error(`  Types: ${TYPES.join(', ')}`)
  console.error('')
  console.error('Examples:')
  console.error('  feat: add user registration')
  console.error('  fix(auth): resolve session timeout')
  console.error('  docs: update deployment guide')
  console.error('')
  process.exit(1)
}
