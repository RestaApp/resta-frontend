import { memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const ShiftSkeleton = memo(function ShiftSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 dark:border-[rgba(255,255,255,0.06)]">
      <div className="flex justify-between">
        <div className="flex gap-3">
          <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
          <div className="space-y-2 min-w-0">
            <Skeleton className="h-4 w-32 rounded-lg" />
            <Skeleton className="h-3 w-20 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-lg shrink-0" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-8 rounded-lg" />
        <Skeleton className="h-8 rounded-lg" />
      </div>

      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  )
})
