import { Skeleton } from '@/components/ui/skeleton'

export default function VerifyEmailLoading() {
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <Skeleton className="size-16 rounded-full" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
  )
}
