import { Skeleton } from '@/components/ui/skeleton'

export default function TwoFactorLoading() {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <Skeleton className="mx-auto h-7 w-56" />
        <Skeleton className="mx-auto h-4 w-72" />
      </div>
      <div className="space-y-4">
        <div className="flex justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="size-12" />
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}
