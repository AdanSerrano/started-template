export interface JsonValidation {
  isValid: boolean
  error?: string | undefined
  lineNumber?: number | undefined
}

export function validateJson(value: string): JsonValidation {
  if (!value || !value.trim()) {
    return { isValid: true }
  }

  try {
    JSON.parse(value)
    return { isValid: true }
  } catch (e) {
    const error = e as SyntaxError
    const match = error.message.match(/position (\d+)/)
    let lineNumber: number | undefined

    if (match) {
      const position = parseInt(match[1]!, 10)
      const lines = value.substring(0, position).split('\n')
      lineNumber = lines.length
    }

    return {
      isValid: false,
      error: error.message,
      lineNumber,
    }
  }
}

export function formatJson(value: string): string {
  try {
    const parsed = JSON.parse(value)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return value
  }
}

export function minifyJson(value: string): string {
  try {
    const parsed = JSON.parse(value)
    return JSON.stringify(parsed)
  } catch {
    return value
  }
}
