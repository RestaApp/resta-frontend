import { memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils/cn'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_META_CLASS,
  SHIFT_CARD_ROW_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'

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
    <div className={cn(SHIFT_CARD_CLASS, 'space-y-2.5', VARIANT_CONTAINER_CLASSES[variant])}>
      <div className={SHIFT_CARD_ROW_CLASS}>
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
          <Skeleton className="h-9 w-9 shrink-0 rounded-sm" />
          <div className="min-w-0 flex-1 space-y-2 pt-px">
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-1/2 rounded-md" />
          </div>
        </div>

        <div className="shrink-0 space-y-1.5 pt-px text-right">
          <Skeleton className="ml-auto h-5 w-[88px] rounded-md" />
          <Skeleton className="ml-auto h-2.5 w-10 rounded-sm" />
        </div>
      </div>

      <div className={cn(SHIFT_CARD_META_CLASS, 'min-w-0 gap-2')}>
        <Skeleton className="h-3 w-[106px] rounded-sm" />
        <Skeleton className="h-3 min-w-[92px] flex-1 rounded-sm" />
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
