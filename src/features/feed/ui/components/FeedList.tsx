import { useMemo } from 'react'
import { FeedCard } from '@/components/ui/shift-card/ShiftCard'
import { InfiniteScrollTrigger } from '@/shared/ui/InfiniteScrollTrigger'
import type { Shift } from '@/shared/shifts/types'
import type { UseVacanciesInfiniteListReturn } from '@/features/feed/model/hooks/useVacanciesInfiniteList'
import type { ShiftStatus } from '@/shared/shifts/types'

interface FeedListProps {
  shifts: Shift[]
  activeList: UseVacanciesInfiniteListReturn
  getApplicationStatus: (id: number) => ShiftStatus | null
  onOpenDetails: (id: number) => void
}

export function FeedList({
  shifts,
  activeList,
  getApplicationStatus,
  onOpenDetails,
}: FeedListProps) {
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

  return (
    <>
      {sortedShifts.map(shift => (
        <FeedCard key={shift.id} shift={shift} onOpenDetails={onOpenDetails} />
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
