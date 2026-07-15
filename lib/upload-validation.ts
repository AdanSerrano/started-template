/**
 * Validacion de archivos para upload.
 *
 * Whitelist de tipos, limite de tamano, y verificacion de magic bytes.
 */

export interface FileValidationOptions {
  maxSizeBytes?: number
  allowedMimeTypes?: string[]
  allowedExtensions?: string[]
}

export interface FileValidationResult {
  valid: boolean
  error?: string
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024 // 5MB

// SVG queda FUERA de los defaults a propósito: un SVG puede contener <script>
// y ser un vector de XSS almacenado. Un consumidor que lo necesite debe
// habilitarlo explícitamente y sanear el contenido.
const DEFAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const DEFAULT_ALLOWED_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'pdf',
  'csv',
  'xlsx',
  'docx',
]

// Magic bytes para tipos comunes. webp se valida aparte (RIFF + "WEBP" en offset 8).
const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
    0x50, 0x4b, 0x03, 0x04,
  ],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    0x50, 0x4b, 0x03, 0x04,
  ],
}

function getExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : ''
}

async function readBytes(file: File, length: number): Promise<Uint8Array> {
  const buffer = await file.slice(0, length).arrayBuffer()
  return new Uint8Array(buffer)
}

async function checkMagicBytes(file: File, mimeType: string): Promise<boolean> {
  // webp: cabecera RIFF (0-3) + fourCC "WEBP" (8-11); RIFF solo lo comparten WAV/AVI.
  if (mimeType === 'image/webp') {
    const bytes = await readBytes(file, 12)
    const riff = [0x52, 0x49, 0x46, 0x46].every((b, i) => bytes[i] === b)
    const webp = [0x57, 0x45, 0x42, 0x50].every((b, i) => bytes[8 + i] === b)
    return riff && webp
  }

  const expected = MAGIC_BYTES[mimeType]
  // Sin firma binaria conocida (p.ej. text/csv, o un tipo custom que el
  // consumidor habilitó explícitamente): no hay bytes que verificar.
  if (!expected) return true

  const bytes = await readBytes(file, expected.length)
  return expected.every((byte, i) => bytes[i] === byte)
}

export async function validateFile(
  file: File,
  options?: FileValidationOptions,
): Promise<FileValidationResult> {
  const maxSize = options?.maxSizeBytes ?? DEFAULT_MAX_SIZE
  const allowedMimeTypes =
    options?.allowedMimeTypes ?? DEFAULT_ALLOWED_MIME_TYPES
  const allowedExtensions =
    options?.allowedExtensions ?? DEFAULT_ALLOWED_EXTENSIONS

  // Verificar tamano
  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / 1024 / 1024)
    return { valid: false, error: `El archivo excede ${maxMB}MB` }
  }

  // Verificar MIME type
  if (!allowedMimeTypes.includes(file.type)) {
    return { valid: false, error: `Tipo de archivo no permitido: ${file.type}` }
  }

  // Verificar extension (obligatoria: sin extensión no se puede validar)
  const ext = getExtension(file.name)
  if (!ext || !allowedExtensions.includes(ext)) {
    return { valid: false, error: `Extension no permitida: .${ext}` }
  }

  // Verificar magic bytes
  const magicValid = await checkMagicBytes(file, file.type)
  if (!magicValid) {
    return {
      valid: false,
      error: 'El contenido del archivo no coincide con su tipo declarado',
    }
  }

  return { valid: true }
}
