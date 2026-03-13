import { Skeleton } from '@/components/ui/skeleton'

export default function ResetPasswordLoading() {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <Skeleton className="mx-auto h-7 w-56" />
        <Skeleton className="mx-auto h-4 w-64" />
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}
