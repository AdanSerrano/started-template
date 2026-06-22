export type IPVersion = 'ipv4' | 'ipv6' | 'both'

export const DEFAULT_IP_MESSAGES = {
  cidrNotAllowed: 'CIDR notation not allowed',
  invalidCidr: 'Invalid CIDR notation',
  invalidCidrPrefix: 'Invalid CIDR prefix',
  ipv6Only: 'IPv6 only',
  ipv4CidrRange: 'IPv4 CIDR must be 0-32',
  ipv4Only: 'IPv4 only',
  ipv6CidrRange: 'IPv6 CIDR must be 0-128',
  invalidIp: 'Invalid IP address',
  valid: 'Valid',
  invalid: 'Invalid',
}

export interface IPValidation {
  valid: boolean
  version?: 'IPv4' | 'IPv6' | undefined
  cidr?: number | undefined
  error?: string | undefined
}

function validateIPv4(ip: string): boolean {
  const parts = ip.split('.')
  if (parts.length !== 4) return false

  return parts.every((part) => {
    const num = parseInt(part, 10)
    return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString()
  })
}

function validateIPv6(ip: string): boolean {
  const parts = ip.split(':')

  if (parts.length > 8) return false

  const hasDoubleColon = ip.includes('::')
  if (hasDoubleColon) {
    const doubleColonCount = (ip.match(/::/g) || []).length
    if (doubleColonCount > 1) return false
  } else if (parts.length !== 8) {
    return false
  }

  return parts.every((part) => {
    if (part === '') return hasDoubleColon
    return /^[0-9a-fA-F]{1,4}$/.test(part)
  })
}

export function validateIP(
  value: string,
  allowedVersions: IPVersion,
  allowCIDR: boolean,
  messages: typeof DEFAULT_IP_MESSAGES,
): IPValidation {
  if (!value || !value.trim()) {
    return { valid: false }
  }

  let ip = value.trim()
  let cidr: number | undefined

  if (ip.includes('/')) {
    if (!allowCIDR) {
      return { valid: false, error: messages.cidrNotAllowed }
    }
    const parts = ip.split('/')
    if (parts.length !== 2) {
      return { valid: false, error: messages.invalidCidr }
    }
    ip = parts[0]!
    cidr = parseInt(parts[1]!, 10)
    if (isNaN(cidr) || cidr < 0) {
      return { valid: false, error: messages.invalidCidrPrefix }
    }
  }

  const isIPv4 = validateIPv4(ip)
  const isIPv6 = !isIPv4 && validateIPv6(ip)

  if (isIPv4) {
    if (allowedVersions === 'ipv6') {
      return { valid: false, error: messages.ipv6Only }
    }
    if (cidr !== undefined && cidr > 32) {
      return { valid: false, error: messages.ipv4CidrRange }
    }
    return { valid: true, version: 'IPv4', cidr }
  }

  if (isIPv6) {
    if (allowedVersions === 'ipv4') {
      return { valid: false, error: messages.ipv4Only }
    }
    if (cidr !== undefined && cidr > 128) {
      return { valid: false, error: messages.ipv6CidrRange }
    }
    return { valid: true, version: 'IPv6', cidr }
  }

  return { valid: false, error: messages.invalidIp }
}

export function getPlaceholder(version: IPVersion, allowCIDR: boolean): string {
  const examples: Record<IPVersion, string> = {
    ipv4: allowCIDR ? '192.168.1.0/24' : '192.168.1.1',
    ipv6: allowCIDR ? '2001:db8::/32' : '2001:db8::1',
    both: allowCIDR ? '192.168.1.0/24 or 2001:db8::/32' : '192.168.1.1',
  }
  return examples[version]
}
