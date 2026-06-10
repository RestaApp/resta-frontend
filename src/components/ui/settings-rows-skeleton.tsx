import { memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { SHIFT_CARD_CLASS } from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/shared/utils/cn'

interface SettingsRowsSkeletonProps {
  rowCount?: number
  className?: string
}

export const SettingsRowsSkeleton = memo(function SettingsRowsSkeleton({
  rowCount = 3,
  className,
}: SettingsRowsSkeletonProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Skeleton className="h-4 w-32 rounded-md" />
      <div className={cn(SHIFT_CARD_CLASS, 'flex flex-col divide-y divide-border/50 p-0')}>
        {Array.from({ length: rowCount }, (_, index) => (
          <div key={index} className="flex items-center justify-between gap-2 px-3 py-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
              <Skeleton className="h-4 w-2/5 rounded-md" />
            </div>
            <Skeleton className="h-8 w-15 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
})
SettingsRowsSkeleton.displayName = 'SettingsRowsSkeleton'
