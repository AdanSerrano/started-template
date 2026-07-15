import { describe, it, expect } from 'vitest'
import { validateFile } from '@/lib/upload-validation'

function createMockFile(name: string, type: string, content: Uint8Array): File {
  return new File([content], name, { type })
}

const JPEG_MAGIC = new Uint8Array([
  0xff,
  0xd8,
  0xff,
  0xe0,
  ...Array(96).fill(0),
])
const PNG_MAGIC = new Uint8Array([0x89, 0x50, 0x4e, 0x47, ...Array(96).fill(0)])

describe('validateFile', () => {
  describe('valid files', () => {
    it('accepts a valid JPEG file', async () => {
      const file = createMockFile('photo.jpg', 'image/jpeg', JPEG_MAGIC)
      const result = await validateFile(file)
      expect(result).toEqual({ valid: true })
    })

    it('accepts a valid PNG file', async () => {
      const file = createMockFile('image.png', 'image/png', PNG_MAGIC)
      const result = await validateFile(file)
      expect(result).toEqual({ valid: true })
    })
  })

  describe('file size', () => {
    it('rejects file exceeding default max size', async () => {
      const largeContent = new Uint8Array(6 * 1024 * 1024)
      largeContent.set(JPEG_MAGIC)
      const file = createMockFile('big.jpg', 'image/jpeg', largeContent)
      const result = await validateFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('5MB')
    })

    it('rejects file exceeding custom max size', async () => {
      const content = new Uint8Array(2000)
      content.set(JPEG_MAGIC)
      const file = createMockFile('medium.jpg', 'image/jpeg', content)
      const result = await validateFile(file, { maxSizeBytes: 1000 })
      expect(result.valid).toBe(false)
      expect(result.error).toContain('excede')
    })

    it('accepts file within custom max size', async () => {
      const file = createMockFile('small.jpg', 'image/jpeg', JPEG_MAGIC)
      const result = await validateFile(file, {
        maxSizeBytes: 10 * 1024 * 1024,
      })
      expect(result.valid).toBe(true)
    })
  })

  describe('MIME type', () => {
    it('rejects invalid MIME type', async () => {
      const file = createMockFile(
        'script.js',
        'application/javascript',
        new Uint8Array(10),
      )
      const result = await validateFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('no permitido')
      expect(result.error).toContain('application/javascript')
    })

    it('accepts MIME type from custom allowed list', async () => {
      const file = createMockFile(
        'data.json',
        'application/json',
        new Uint8Array([0x7b, 0x7d]),
      )
      const result = await validateFile(file, {
        allowedMimeTypes: ['application/json'],
        allowedExtensions: ['json'],
      })
      expect(result.valid).toBe(true)
    })
  })

  describe('extension', () => {
    it('rejects disallowed extension', async () => {
      const file = createMockFile('virus.exe', 'image/jpeg', JPEG_MAGIC)
      const result = await validateFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('no permitida')
      expect(result.error).toContain('.exe')
    })

    it('rejects a file without extension', async () => {
      const file = createMockFile('payload', 'image/jpeg', JPEG_MAGIC)
      const result = await validateFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('no permitida')
    })
  })

  describe('security hardening', () => {
    it('rejects SVG by default (stored XSS vector)', async () => {
      const svg = new TextEncoder().encode(
        '<svg><script>alert(1)</script></svg>',
      )
      const file = createMockFile('x.svg', 'image/svg+xml', svg)
      const result = await validateFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('no permitido')
    })

    it('rejects a fake webp with RIFF header but wrong fourCC', async () => {
      // RIFF válido pero "WAVE" en offset 8 en vez de "WEBP" (un WAV/AVI)
      const fake = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
      ])
      const file = createMockFile('fake.webp', 'image/webp', fake)
      const result = await validateFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('no coincide')
    })

    it('accepts a real webp (RIFF + WEBP fourCC)', async () => {
      const webp = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
      ])
      const file = createMockFile('real.webp', 'image/webp', webp)
      const result = await validateFile(file)
      expect(result.valid).toBe(true)
    })
  })

  describe('magic bytes', () => {
    it('rejects file claiming JPEG but with PNG magic bytes', async () => {
      const file = createMockFile('fake.jpg', 'image/jpeg', PNG_MAGIC)
      const result = await validateFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('no coincide')
    })

    it('rejects file claiming PNG but with JPEG magic bytes', async () => {
      const file = createMockFile('fake.png', 'image/png', JPEG_MAGIC)
      const result = await validateFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('no coincide')
    })

    it('skips magic byte check for types without defined magic bytes', async () => {
      const csvContent = new Uint8Array([0x61, 0x2c, 0x62])
      const file = createMockFile('data.csv', 'text/csv', csvContent)
      const result = await validateFile(file)
      expect(result.valid).toBe(true)
    })
  })

  describe('custom options', () => {
    it('overrides all defaults', async () => {
      const file = createMockFile(
        'doc.pdf',
        'application/pdf',
        new Uint8Array(100),
      )
      const result = await validateFile(file, {
        allowedMimeTypes: ['image/png'],
        allowedExtensions: ['png'],
        maxSizeBytes: 1024,
      })
      expect(result.valid).toBe(false)
    })
  })
})
