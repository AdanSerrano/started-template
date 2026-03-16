/**
 * Helpers de audit log especificos de Next.js.
 * Extraen metadata del request para pasar a createAuditLog.
 */
import { headers } from 'next/headers'
import { getRequestId } from '@/lib/request-context'

export async function getRequestMetadata(): Promise<{
  ip: string
  userAgent: string
  requestId?: string
}> {
  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    'unknown'
  const userAgent = headersList.get('user-agent') ?? 'unknown'
  const requestId = getRequestId()
  return { ip, userAgent, ...(requestId && { requestId }) }
}
