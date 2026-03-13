import { Skeleton } from '@/components/ui/skeleton'

export default function AccountLoading() {
  return (
    <div className="container-main py-8">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      {/* Profile card */}
      <div className="rounded-lg border p-6">
        <Skeleton className="mb-4 h-6 w-40" />
        <Skeleton className="mb-4 h-4 w-56" />

        {/* Form fields */}
        <div className="space-y-4">
          <div>
            <Skeleton className="mb-1 h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="mb-1 h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}
