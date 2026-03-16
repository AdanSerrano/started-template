/**
 * Next.js Instrumentation Hook
 *
 * Se ejecuta una vez cuando el servidor Next.js inicia.
 * Usar para inicializar monitoring, tracing, u otro setup server-side.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side initialization
    // Agregar OpenTelemetry, Sentry, u otro monitoring aqui.
    //
    // Ejemplo con OpenTelemetry (descomentar cuando se instale @opentelemetry/sdk-node):
    // const { NodeSDK } = await import('@opentelemetry/sdk-node')
    // const sdk = new NodeSDK({ ... })
    // sdk.start()
  }
}

export async function onRequestError(
  error: { digest: string } & Error,
  request: {
    path: string
    method: string
    headers: { [key: string]: string }
  },
  context: {
    routerKind: 'Pages Router' | 'App Router'
    routePath: string
    routeType: 'page' | 'route' | 'middleware'
    renderSource:
      | 'react-server-components'
      | 'react-server-components-payload'
      | 'server-rendering'
    revalidateReason: 'on-demand' | 'stale' | undefined
    renderType: 'dynamic' | 'dynamic-resume'
  },
) {
  console.error('[instrumentation] Request error:', {
    error: error.message,
    digest: error.digest,
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
  })
}
