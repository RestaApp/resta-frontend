import { memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { AVATAR_SM_CLASS } from '@/components/ui/avatar-styles'
import { SHIFT_CARD_CLASS } from '@/components/ui/shift-card/shift-card-styles'
import { cn } from '@/shared/utils/cn'

interface ShiftDetailsSkeletonProps {
  className?: string
}

export const ShiftDetailsSkeleton = memo(function ShiftDetailsSkeleton({
  className,
}: ShiftDetailsSkeletonProps) {
  return (
    <div className={cn('ui-density-page ui-density-stack pb-24', className)}>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-4/5 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className={cn(AVATAR_SM_CLASS, 'shrink-0')} />
          <Skeleton className="h-4 w-2/5 rounded-md" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-24 rounded-md" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Skeleton className="h-4 w-3/5 rounded-md" />
          <Skeleton className="h-4 w-2/5 rounded-md" />
        </div>
      </div>

      <div className={cn(SHIFT_CARD_CLASS, 'flex flex-col gap-3')}>
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-4/5 rounded-md" />
      </div>

      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-16 w-full rounded-md" />
      </div>

      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
    </div>
  )
})
ShiftDetailsSkeleton.displayName = 'ShiftDetailsSkeleton'
