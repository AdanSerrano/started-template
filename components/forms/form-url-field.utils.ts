export const DEFAULT_URL_MESSAGES = {
  protocolNotAllowed: 'Protocol "{protocol}" not allowed',
  invalidFormat: 'Invalid URL format',
  validUrl: 'Valid URL',
  invalid: 'Invalid',
}

export interface UrlValidation {
  valid: boolean
  protocol?: string | undefined
  hostname?: string | undefined
  error?: string | undefined
}

export function validateUrl(
  url: string,
  allowedProtocols: string[],
  messages: typeof DEFAULT_URL_MESSAGES,
): UrlValidation {
  if (!url || !url.trim()) {
    return { valid: false }
  }

  try {
    let urlToValidate = url
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
      urlToValidate = `https://${url}`
    }

    const parsed = new URL(urlToValidate)
    const protocol = parsed.protocol.replace(':', '')

    if (!allowedProtocols.includes(protocol)) {
      return {
        valid: false,
        protocol,
        error: messages.protocolNotAllowed.replace('{protocol}', protocol),
      }
    }

    return {
      valid: true,
      protocol,
      hostname: parsed.hostname,
    }
  } catch {
    return {
      valid: false,
      error: messages.invalidFormat,
    }
  }
}

export function getFaviconUrl(url: string): string | null {
  try {
    let urlToValidate = url
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
      urlToValidate = `https://${url}`
    }
    const parsed = new URL(urlToValidate)
    return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=32`
  } catch {
    return null
  }
}

export function hasProtocol(url: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)
}
