'use client'

import {
  memo,
  useEffect,
  useState,
  useTransition,
  useOptimistic,
  useCallback,
} from 'react'
import { useTranslations } from 'next-intl'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Monitor, Smartphone, Globe, Trash2 } from 'lucide-react'

interface SessionInfo {
  id: string
  token: string
  userAgent: string | null
  ipAddress: string | null
  createdAt: Date
  current: boolean
}

function parseUserAgent(
  ua: string | null,
  t: ReturnType<typeof useTranslations<'activeSessions'>>,
): {
  device: string
  browser: string
} {
  if (!ua) return { device: t('unknown'), browser: t('unknown') }

  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua)
  const device = isMobile ? t('mobile') : t('desktop')

  let browser = t('unknown')
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome'
  else if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari'
  else if (ua.includes('Edg')) browser = 'Edge'

  return { device, browser }
}

const SessionRow = memo(function SessionRow({
  session,
  isPending,
  onRevoke,
  t,
  locale,
}: {
  session: SessionInfo
  isPending: boolean
  onRevoke: (token: string) => void
  t: ReturnType<typeof useTranslations<'activeSessions'>>
  locale: string
}) {
  const { device, browser } = parseUserAgent(session.userAgent, t)
  const DeviceIcon = device === t('mobile') ? Smartphone : Monitor

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <DeviceIcon className="text-muted-foreground size-5" />
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">
              {browser} — {device}
            </p>
            {session.current && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                {t('current')}
              </span>
            )}
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            {session.ipAddress && (
              <span className="flex items-center gap-1">
                <Globe className="size-3" />
                {session.ipAddress}
              </span>
            )}
            <span>
              {session.createdAt.toLocaleDateString(
                locale === 'en' ? 'en-US' : 'es-ES',
                {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                },
              )}
            </span>
          </div>
        </div>
      </div>

      {!session.current && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRevoke(session.token)}
          disabled={isPending}
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  )
})

export function ActiveSessions() {
  const t = useTranslations('activeSessions')
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [optimisticSessions, removeOptimistic] = useOptimistic(
    sessions,
    (state, tokenToRemove: string) =>
      state.filter((s) => s.token !== tokenToRemove),
  )

  useEffect(() => {
    async function fetchSessions() {
      const result = await authClient.listSessions()

      if (result.data) {
        const currentSession = await authClient.getSession()
        const currentToken = currentSession.data?.session?.token

        setSessions(
          result.data.map((s: Record<string, unknown>) => ({
            id: s.id as string,
            token: s.token as string,
            userAgent: (s.userAgent as string) ?? null,
            ipAddress: (s.ipAddress as string) ?? null,
            createdAt: new Date(s.createdAt as string),
            current: s.token === currentToken,
          })),
        )
      }
      setLoading(false)
    }

    fetchSessions()
  }, [])

  const handleRevoke = useCallback(
    (token: string) => {
      startTransition(async () => {
        removeOptimistic(token)
        await authClient.revokeSession({ token })
        setSessions((prev) => prev.filter((s) => s.token !== token))
      })
    },
    [removeOptimistic],
  )

  const handleRevokeAll = useCallback(() => {
    startTransition(async () => {
      for (const s of sessions) {
        if (!s.current) removeOptimistic(s.token)
      }
      await authClient.revokeOtherSessions()
      setSessions((prev) => prev.filter((s) => s.current))
    })
  }, [sessions, removeOptimistic])

  if (loading) {
    return (
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="divide-border divide-y rounded-lg border">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-5" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="size-8" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Detect locale from document lang attribute
  const locale =
    typeof document !== 'undefined' ? document.documentElement.lang : 'es'

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{t('title')}</p>
          <p className="text-muted-foreground text-sm">
            {t('sessionCount', { count: optimisticSessions.length })}
          </p>
        </div>
        {optimisticSessions.filter((s) => !s.current).length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRevokeAll}
            disabled={isPending}
          >
            {isPending && <Loader2 className="animate-spin" />}
            {t('revokeOthers')}
          </Button>
        )}
      </div>

      <div className="divide-border divide-y rounded-lg border">
        {optimisticSessions.map((session) => (
          <SessionRow
            key={session.id}
            session={session}
            isPending={isPending}
            onRevoke={handleRevoke}
            t={t}
            locale={locale}
          />
        ))}
      </div>
    </div>
  )
}
