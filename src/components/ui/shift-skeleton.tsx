import { memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/shared/utils/cn'
import {
  PREVIEW_CARD_STATS_CLASS,
  PREVIEW_CARD_TAGS_CLASS,
} from '@/components/ui/shift-card/PreviewCardLayout'
import {
  SHIFT_CARD_CLASS,
  SHIFT_CARD_META_CLASS,
  SHIFT_CARD_ROW_CLASS,
} from '@/components/ui/shift-card/shift-card-styles'

const FEED_CARD_SKELETON_COUNT = 3

interface ShiftSkeletonProps {
  variant?: 'default' | 'staff' | 'supplier'
}

const VARIANT_CONTAINER_CLASSES: Record<'default' | 'staff', string> = {
  default: '',
  staff: 'p3',
}

const FeedCardSkeleton = memo(function FeedCardSkeleton({
  variant = 'default',
}: {
  variant?: 'default' | 'staff'
}) {
  return (
    <div
      className={cn(SHIFT_CARD_CLASS, 'flex flex-col gap-2', VARIANT_CONTAINER_CLASSES[variant])}
    >
      <div className={SHIFT_CARD_ROW_CLASS}>
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
          <div className="flex min-w-0 flex-1 flex-col gap-2 pt-px">
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-1/2 rounded-md" />
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-1 pt-px text-right">
          <Skeleton className="ml-auto h-5 w-22 rounded-md" />
          <Skeleton className="ml-auto h-2.5 w-10 rounded-sm" />
        </div>
      </div>

      <div className={cn(SHIFT_CARD_META_CLASS, 'min-w-0 gap-2')}>
        <Skeleton className="h-3 w-27 rounded-sm" />
        <Skeleton className="h-3 min-w-23 flex-1 rounded-sm" />
      </div>
    </div>
  )
})
FeedCardSkeleton.displayName = 'FeedCardSkeleton'

const SupplierCardSkeleton = memo(function SupplierCardSkeleton() {
  return (
    <div className={SHIFT_CARD_CLASS}>
      <div className="flex min-w-0 items-start gap-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="mt-1 h-3 w-1/2 rounded-md" />
          <div className={PREVIEW_CARD_STATS_CLASS}>
            <Skeleton className="h-3 w-14 rounded-sm" />
            <Skeleton className="h-3 w-22 rounded-sm" />
          </div>
          <div className={PREVIEW_CARD_TAGS_CLASS}>
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
})
SupplierCardSkeleton.displayName = 'SupplierCardSkeleton'

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
      {Array.from({ length: count }, (_, index) =>
        variant === 'supplier' ? (
          <SupplierCardSkeleton key={index} />
        ) : (
          <FeedCardSkeleton key={index} variant={variant} />
        )
      )}
    </div>
  )
})
FeedCardSkeletonList.displayName = 'FeedCardSkeletonList'
