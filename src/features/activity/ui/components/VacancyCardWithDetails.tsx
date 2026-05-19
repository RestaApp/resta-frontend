import { useCallback, useMemo, useState, type ComponentProps } from 'react'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { Shift } from '@/features/feed/model/types'
import { FeedCard, type ShiftCardProps } from '@/components/ui/shift-card/ShiftCard'
import { ShiftDetailsScreen } from '@/components/ui/shift-details-screen/ShiftDetailsScreen'

type ShiftDetailsBindings = Pick<
  ShiftCardProps,
  | 'isApplied'
  | 'applicationId'
  | 'applicationStatus'
  | 'onApply'
  | 'onCancel'
  | 'isLoading'
  | 'ownerActions'
>

type ShiftDetailsScreenBindings = Omit<
  ComponentProps<typeof ShiftDetailsScreen>,
  'shift' | 'vacancyData' | 'isOpen' | 'onClose'
>

interface VacancyCardWithDetailsProps {
  vacancy: VacancyApiItem
  mapToShift: (vacancy: VacancyApiItem) => Shift
  feedCardProps?: ShiftDetailsBindings
  detailsProps: ShiftDetailsScreenBindings
}

export const VacancyCardWithDetails = ({
  vacancy,
  mapToShift,
  feedCardProps,
  detailsProps,
}: VacancyCardWithDetailsProps) => {
  const mappedShift = useMemo(() => mapToShift(vacancy), [vacancy, mapToShift])
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenDetails = useCallback(() => setIsOpen(true), [])
  const handleCloseDetails = useCallback(() => setIsOpen(false), [])

  const { onApply, onCancel, ...restDetailsProps } = detailsProps

  const handleDetailsApply = useCallback(
    async (id: number, message?: string) => {
      await onApply(id, message)
      setIsOpen(false)
    },
    [onApply]
  )

  const handleDetailsCancel = useCallback(
    async (appId: number | null | undefined, shiftId: number) => {
      await onCancel(appId, shiftId)
      setIsOpen(false)
    },
    [onCancel]
  )

  return (
    <>
      <FeedCard
        shift={mappedShift}
        onOpenDetails={handleOpenDetails}
        onApply={() => {}}
        onCancel={() => {}}
        {...feedCardProps}
      />

      <ShiftDetailsScreen
        shift={mappedShift}
        vacancyData={vacancy}
        isOpen={isOpen}
        onClose={handleCloseDetails}
        {...restDetailsProps}
        onApply={handleDetailsApply}
        onCancel={handleDetailsCancel}
      />
    </>
  )
}
