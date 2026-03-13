export function FormErrorBanner({
  message,
}: {
  message: string | null | undefined
}) {
  if (!message) return null
  return (
    <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
      {message}
    </p>
  )
}
