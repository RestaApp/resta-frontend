import { useMemo } from 'react'
import { motion } from 'motion/react'
import { ShiftCard } from '@/components/ui/ShiftCard'
import { InfiniteScrollTrigger } from '@/features/feed/ui/components/InfiniteScrollTrigger'
import type { Shift } from '@/features/feed/model/types'
import type { UseVacanciesInfiniteListReturn } from '@/features/feed/model/hooks/useVacanciesInfiniteList'
import type { ShiftStatus } from '@/components/ui/StatusPill'

interface FeedListProps {
  shifts: Shift[]
  activeList: UseVacanciesInfiniteListReturn
  getApplicationId: (id: number) => number | undefined
  getApplicationStatus: (id: number) => ShiftStatus
  isApplied: (id: number) => boolean
  onOpenDetails: (id: number) => void
  onApplyWithModal: (id: number, message?: string) => Promise<void>
  onCancel: (applicationId: number | null | undefined, shiftId: number) => Promise<void>
  isShiftLoading: (id: number) => boolean
  onEdit: (id: number) => void
  onDelete: (id: number) => Promise<void>
  isDeleting: boolean
}

export function FeedList({
  shifts,
  activeList,
  getApplicationId,
  getApplicationStatus,
  isApplied,
  onOpenDetails,
  onApplyWithModal,
  onCancel,
  isShiftLoading,
  onEdit,
  onDelete,
  isDeleting,
}: FeedListProps) {
  const ownerActions = useMemo(
    () => ({
      onEdit,
      onDelete,
      isDeleting,
    }),
    [onEdit, onDelete, isDeleting]
  )

  return (
    <>
      {shifts.map((shift, index) => (
        <motion.div
          key={shift.id}
          initial={index < 6 ? { y: 16, opacity: 0 } : false}
          animate={index < 6 ? { y: 0, opacity: 1 } : undefined}
          transition={index < 6 ? { delay: 0.15 + index * 0.04 } : undefined}
        >
          <ShiftCard
            shift={shift}
            applicationId={getApplicationId(shift.id) ?? null}
            applicationStatus={getApplicationStatus(shift.id) ?? null}
            isApplied={isApplied(shift.id)}
            onOpenDetails={onOpenDetails}
            onApply={onApplyWithModal}
            onCancel={onCancel}
            isLoading={isShiftLoading(shift.id)}
            ownerActions={ownerActions}
          />
        </motion.div>
      ))}

      {shifts.length > 0 ? (
        <InfiniteScrollTrigger
          onLoadMore={activeList.loadMore}
          hasMore={activeList.hasMore}
          isLoading={activeList.isFetching}
          isError={!!activeList.error}
        />
      ) : null}
    </>
  )
}
