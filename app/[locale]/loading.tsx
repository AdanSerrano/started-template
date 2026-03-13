import { Skeleton } from '@/components/ui/skeleton'

export default function HomeLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar skeleton */}
      <header className="border-border/50 bg-background/85 sticky top-0 z-50 border-b backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero skeleton */}
        <section className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center">
          <div className="flex max-w-4xl flex-col items-center px-4 text-center">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-5 h-12 w-72 sm:h-14 sm:w-96" />
            <Skeleton className="mt-3 h-12 w-56 sm:h-14 sm:w-72" />
            <Skeleton className="mt-6 h-5 w-80" />
            <div className="mt-8 flex gap-4">
              <Skeleton className="h-12 w-40 rounded-lg" />
              <Skeleton className="h-12 w-28 rounded-lg" />
            </div>
          </div>
        </section>

        {/* Features skeleton */}
        <section className="bg-muted/40 dark:bg-muted/20 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-12 text-center">
              <Skeleton className="mx-auto h-8 w-64" />
              <Skeleton className="mx-auto mt-3 h-5 w-96" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border p-6">
                  <Skeleton className="mb-4 size-10 rounded-lg" />
                  <Skeleton className="mb-2 h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="mt-1 h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
