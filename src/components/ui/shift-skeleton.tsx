import { memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils/cn'

export const FEED_CARD_SKELETON_COUNT = 3

interface ShiftSkeletonProps {
  variant?: 'default' | 'staff'
}
export type FeedCardSkeletonProps = ShiftSkeletonProps

const VARIANT_CONTAINER_CLASSES: Record<NonNullable<ShiftSkeletonProps['variant']>, string> = {
  default: '',
  staff: 'p-3.5',
}

export const FeedCardSkeleton = memo(function FeedCardSkeleton({
  variant = 'default',
}: ShiftSkeletonProps) {
  return (
    <div className={cn('shift-compact-card space-y-2.5', VARIANT_CONTAINER_CLASSES[variant])}>
      <div className="shift-compact-row">
        <div className="min-w-0 flex flex-1 items-start gap-[10px]">
          <Skeleton className="h-[36px] w-[36px] shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2 pt-[1px]">
            <Skeleton className="h-[15px] w-3/4 rounded-md" />
            <Skeleton className="h-[12px] w-1/2 rounded-md" />
          </div>
        </div>

        <div className="shrink-0 space-y-1.5 pt-[1px] text-right">
          <Skeleton className="ml-auto h-[20px] w-[88px] rounded-md" />
          <Skeleton className="ml-auto h-[10px] w-[40px] rounded-sm" />
        </div>
      </div>

      <div className="shift-compact-meta min-w-0 gap-2">
        <Skeleton className="h-[13px] w-[106px] rounded-sm" />
        <Skeleton className="h-[13px] min-w-[92px] flex-1 rounded-sm" />
      </div>
    </div>
  )
})
FeedCardSkeleton.displayName = 'FeedCardSkeleton'
export const ShiftSkeleton = FeedCardSkeleton

interface FeedCardSkeletonListProps {
  count?: number
  variant?: ShiftSkeletonProps['variant']
  className?: string
}

export const FeedCardSkeletonList = memo(function FeedCardSkeletonList({
  count = FEED_CARD_SKELETON_COUNT,
  variant = 'default',
  className,
}: FeedCardSkeletonListProps) {
  return (
    <div className={cn(className ?? 'ui-density-stack')}>
      {Array.from({ length: count }, (_, index) => (
        <FeedCardSkeleton key={index} variant={variant} />
      ))}
    </div>
  )
})
FeedCardSkeletonList.displayName = 'FeedCardSkeletonList'
