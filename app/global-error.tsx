'use client'

/**
 * Global Error Boundary — captura errores que rompen el root layout.
 * Este es el ultimo recurso cuando error.tsx no puede renderizar.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="es">
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center',
            padding: '1rem',
          }}
        >
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>500</h1>
          <p style={{ color: '#666', marginTop: '1rem', fontSize: '1.125rem' }}>
            Algo salio mal. Por favor intenta de nuevo.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  )
}
