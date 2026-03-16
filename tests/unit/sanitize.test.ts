import { describe, it, expect } from 'vitest'
import {
  sanitizeHtml,
  sanitizeText,
  sanitizeAttr,
  sanitizeMarkdownHtml,
} from '@/lib/sanitize'

describe('sanitizeHtml', () => {
  it('should preserve allowed tags', () => {
    const input = '<p>Hello <strong>world</strong></p>'
    const result = sanitizeHtml(input)

    expect(result).toContain('<p>')
    expect(result).toContain('<strong>')
  })

  it('should preserve links with href', () => {
    const input = '<a href="https://example.com">Link</a>'
    const result = sanitizeHtml(input)

    expect(result).toContain('href="https://example.com"')
    expect(result).toContain('Link')
  })

  it('should strip script tags', () => {
    const input = '<script>alert("xss")</script>'
    const result = sanitizeHtml(input)

    expect(result).not.toContain('<script>')
    expect(result).not.toContain('alert')
  })

  it('should strip event handler attributes', () => {
    const input = '<p onclick="alert(1)">text</p>'
    const result = sanitizeHtml(input)

    expect(result).not.toContain('onclick')
    expect(result).toContain('<p>')
  })

  it('should strip iframe tags', () => {
    const input = '<iframe src="https://evil.com"></iframe>'
    const result = sanitizeHtml(input)

    expect(result).not.toContain('<iframe')
  })

  it('should preserve list elements', () => {
    const input = '<ul><li>Item 1</li><li>Item 2</li></ul>'
    const result = sanitizeHtml(input)

    expect(result).toContain('<ul>')
    expect(result).toContain('<li>')
  })

  it('should preserve headings', () => {
    const input = '<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>'
    const result = sanitizeHtml(input)

    expect(result).toContain('<h1>')
    expect(result).toContain('<h2>')
    expect(result).toContain('<h3>')
  })

  it('should preserve code and pre tags', () => {
    const input = '<pre><code>const x = 1</code></pre>'
    const result = sanitizeHtml(input)

    expect(result).toContain('<pre>')
    expect(result).toContain('<code>')
  })

  it('should strip style attributes', () => {
    const input = '<p style="color:red">text</p>'
    const result = sanitizeHtml(input)

    expect(result).not.toContain('style')
  })

  it('should strip img tags (not in allowed list)', () => {
    const input = '<img src="https://evil.com/tracker.png" />'
    const result = sanitizeHtml(input)

    expect(result).not.toContain('<img')
  })

  it('should handle empty string', () => {
    expect(sanitizeHtml('')).toBe('')
  })

  it('should preserve class attribute', () => {
    const input = '<p class="text-bold">text</p>'
    const result = sanitizeHtml(input)

    expect(result).toContain('class="text-bold"')
  })
})

describe('sanitizeText', () => {
  it('should strip all HTML tags', () => {
    const input = '<p>Hello <strong>world</strong></p>'
    const result = sanitizeText(input)

    expect(result).toBe('Hello world')
  })

  it('should strip script tags and content', () => {
    const input = 'Text<script>alert("xss")</script>More'
    const result = sanitizeText(input)

    expect(result).not.toContain('<script>')
    expect(result).not.toContain('alert')
  })

  it('should handle plain text passthrough', () => {
    const input = 'Just plain text'
    const result = sanitizeText(input)

    expect(result).toBe('Just plain text')
  })

  it('should strip links but keep text', () => {
    const input = '<a href="https://evil.com">click here</a>'
    const result = sanitizeText(input)

    expect(result).toBe('click here')
    expect(result).not.toContain('href')
  })

  it('should handle empty string', () => {
    expect(sanitizeText('')).toBe('')
  })
})

describe('sanitizeAttr', () => {
  it('should escape ampersands', () => {
    expect(sanitizeAttr('a&b')).toBe('a&amp;b')
  })

  it('should escape double quotes', () => {
    expect(sanitizeAttr('a"b')).toBe('a&quot;b')
  })

  it('should escape single quotes', () => {
    expect(sanitizeAttr("a'b")).toBe('a&#x27;b')
  })

  it('should escape less-than signs', () => {
    expect(sanitizeAttr('a<b')).toBe('a&lt;b')
  })

  it('should escape greater-than signs', () => {
    expect(sanitizeAttr('a>b')).toBe('a&gt;b')
  })

  it('should escape multiple special characters', () => {
    const input = '<script>"alert(\'xss\')"</script>'
    const result = sanitizeAttr(input)

    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
    expect(result).not.toContain('"')
    expect(result).not.toContain("'")
  })

  it('should handle empty string', () => {
    expect(sanitizeAttr('')).toBe('')
  })

  it('should pass through safe strings unchanged', () => {
    expect(sanitizeAttr('hello world 123')).toBe('hello world 123')
  })
})

describe('sanitizeMarkdownHtml', () => {
  it('should allow img tags with src and alt', () => {
    const input = '<img src="https://example.com/img.png" alt="Photo" />'
    const result = sanitizeMarkdownHtml(input)

    expect(result).toContain('<img')
    expect(result).toContain('src="https://example.com/img.png"')
    expect(result).toContain('alt="Photo"')
  })

  it('should allow hr tags', () => {
    const input = '<hr />'
    const result = sanitizeMarkdownHtml(input)

    expect(result).toContain('<hr')
  })

  it('should still strip script tags', () => {
    const input = '<script>alert("xss")</script>'
    const result = sanitizeMarkdownHtml(input)

    expect(result).not.toContain('<script>')
  })

  it('should preserve standard allowed tags', () => {
    const input = '<p><strong>Bold</strong> and <em>italic</em></p>'
    const result = sanitizeMarkdownHtml(input)

    expect(result).toContain('<strong>')
    expect(result).toContain('<em>')
  })

  it('should strip onerror from img tags', () => {
    const input = '<img src="x" onerror="alert(1)" />'
    const result = sanitizeMarkdownHtml(input)

    expect(result).not.toContain('onerror')
  })
})
