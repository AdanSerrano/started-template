export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Liveness check: ¿está vivo el proceso? NO toca dependencias.
 * Un orquestador (k8s) usa esto para reiniciar el pod; si mirara la DB,
 * mataría pods sanos cuando la DB cae. Para readiness usa /api/health.
 */
export function GET() {
  return Response.json({ status: 'ok', uptime: process.uptime() })
}
