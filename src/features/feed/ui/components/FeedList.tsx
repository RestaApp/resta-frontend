import { useEffect, useMemo, useRef } from 'react'
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
  const prevItemsCountRef = useRef(0)

  const ownerActions = useMemo(
    () => ({
      onEdit,
      onDelete,
      isDeleting,
    }),
    [onEdit, onDelete, isDeleting]
  )

  const sortedShifts = useMemo(() => {
    if (!shifts.length) return shifts

    return shifts
      .map((shift, index) => ({
        shift,
        index,
        isRejected: getApplicationStatus(shift.id) === 'rejected',
      }))
      .sort((a, b) => {
        if (a.isRejected === b.isRejected) {
          return a.index - b.index
        }
        return a.isRejected ? 1 : -1
      })
      .map(item => item.shift)
  }, [shifts, getApplicationStatus])

  useEffect(() => {
    prevItemsCountRef.current = sortedShifts.length
  }, [sortedShifts.length])

  return (
    <>
      {sortedShifts.map((shift, index) => {
        // Плавно анимируем только новые карточки, пришедшие после догрузки.
        const isNewItem = index >= prevItemsCountRef.current

        return (
          <motion.div
            key={shift.id}
            layout
            initial={isNewItem ? { y: 16, opacity: 0 } : false}
            animate={isNewItem ? { y: 0, opacity: 1 } : undefined}
            transition={isNewItem ? { duration: 0.24, ease: 'easeOut' } : undefined}
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
        )
      })}

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
