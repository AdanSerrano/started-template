import { describe, expect, it } from 'vitest'
import { validateFile } from '@/lib/upload-validation'

function createMockFile(
  name: string,
  size: number,
  type: string,
  content?: Uint8Array,
): File {
  const buffer = content ?? new Uint8Array(size)
  return new File([buffer], name, { type })
}

describe('validateFile', () => {
  it('accepts a valid JPEG file', async () => {
    const jpegHeader = new Uint8Array([
      0xff,
      0xd8,
      0xff,
      0xe0,
      ...Array(96).fill(0),
    ])
    const file = createMockFile('photo.jpg', 100, 'image/jpeg', jpegHeader)
    const result = await validateFile(file)
    expect(result.valid).toBe(true)
  })

  it('accepts a valid PNG file', async () => {
    const pngHeader = new Uint8Array([
      0x89,
      0x50,
      0x4e,
      0x47,
      ...Array(96).fill(0),
    ])
    const file = createMockFile('image.png', 100, 'image/png', pngHeader)
    const result = await validateFile(file)
    expect(result.valid).toBe(true)
  })

  it('rejects file exceeding max size', async () => {
    const file = createMockFile('big.jpg', 10 * 1024 * 1024, 'image/jpeg')
    const result = await validateFile(file, { maxSizeBytes: 5 * 1024 * 1024 })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('5MB')
  })

  it('rejects disallowed MIME type', async () => {
    const file = createMockFile('script.js', 100, 'application/javascript')
    const result = await validateFile(file)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('no permitido')
  })

  it('rejects disallowed extension', async () => {
    const file = createMockFile('virus.exe', 100, 'image/jpeg')
    const result = await validateFile(file)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('no permitida')
  })

  it('rejects file with mismatched magic bytes', async () => {
    const fakeJpeg = new Uint8Array([0x00, 0x00, 0x00, ...Array(97).fill(0)])
    const file = createMockFile('fake.jpg', 100, 'image/jpeg', fakeJpeg)
    const result = await validateFile(file)
    expect(result.valid).toBe(false)
    expect(result.error).toContain('no coincide')
  })

  it('respects custom options', async () => {
    const file = createMockFile('doc.pdf', 100, 'application/pdf')
    const result = await validateFile(file, {
      allowedMimeTypes: ['image/png'],
      allowedExtensions: ['png'],
    })
    expect(result.valid).toBe(false)
  })
})
