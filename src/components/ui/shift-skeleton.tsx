import { memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils/cn'

interface ShiftSkeletonProps {
  variant?: 'default' | 'staff' | 'supplier'
}

const VARIANT_CONTAINER_CLASSES: Record<NonNullable<ShiftSkeletonProps['variant']>, string> = {
  default: '',
  staff: 'p-3.5',
  supplier: '',
}

export const ShiftSkeleton = memo(function ShiftSkeleton({
  variant = 'default',
}: ShiftSkeletonProps) {
  const isSupplier = variant === 'supplier'
  const isStaff = variant === 'staff'

  return (
    <div
      className={cn(
        'space-y-4 rounded-xl border border-[var(--surface-stroke-soft)] bg-card p-4',
        VARIANT_CONTAINER_CLASSES[variant]
      )}
    >
      <div className="flex justify-between">
        <div className="flex gap-3">
          <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
          <div className="space-y-2 min-w-0">
            <Skeleton className={cn('h-4 rounded-lg', isSupplier ? 'w-36' : 'w-32')} />
            <Skeleton className={cn('h-3 rounded-lg', isSupplier ? 'w-24' : 'w-20')} />
          </div>
        </div>
        <Skeleton
          className={cn('shrink-0', isSupplier ? 'h-9 w-9 rounded-full' : 'h-6 w-16 rounded-lg')}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Skeleton className={cn('rounded-lg', isStaff ? 'h-7' : 'h-8')} />
        <Skeleton className={cn('rounded-lg', isStaff ? 'h-7' : 'h-8')} />
      </div>

      {isSupplier ? (
        <div className="space-y-2">
          <Skeleton className="h-7 w-3/5 rounded-lg" />
          <Skeleton className="h-4 w-2/3 rounded-lg" />
        </div>
      ) : (
        <Skeleton className={cn('w-full rounded-lg', isStaff ? 'h-9' : 'h-10')} />
      )}
    </div>
  )
})
