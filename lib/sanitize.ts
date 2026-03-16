/**
 * Sanitizacion centralizada de HTML con DOMPurify.
 *
 * OBLIGATORIO usar en todo input de texto rico o HTML user-generated.
 *
 * Uso:
 *   import { sanitizeHtml, sanitizeText } from '@/lib/sanitize'
 *   const clean = sanitizeHtml(userInput)
 *   const plainText = sanitizeText(userInput)
 */

import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
  'b',
  'i',
  'em',
  'strong',
  'a',
  'p',
  'br',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'blockquote',
  'code',
  'pre',
]

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class']

/**
 * Sanitiza HTML permitiendo tags seguros (para rich text).
 * Siempre agrega rel="noopener noreferrer" a links externos.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_ATTR: ['target'],
  })
}

/**
 * Elimina TODO el HTML y devuelve solo texto plano.
 * Usar para inputs que no deben contener HTML.
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
}

const MARKDOWN_ALLOWED_TAGS = [...ALLOWED_TAGS, 'img', 'hr', 'br']

const MARKDOWN_ALLOWED_ATTR = [...ALLOWED_ATTR, 'src', 'alt']

/**
 * Sanitiza HTML generado desde Markdown (permite img, hr, br adicionales).
 */
export function sanitizeMarkdownHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: MARKDOWN_ALLOWED_TAGS,
    ALLOWED_ATTR: MARKDOWN_ALLOWED_ATTR,
  })
}

/**
 * Sanitiza para uso en atributos HTML (previene XSS en atributos).
 */
export function sanitizeAttr(dirty: string): string {
  return dirty
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
