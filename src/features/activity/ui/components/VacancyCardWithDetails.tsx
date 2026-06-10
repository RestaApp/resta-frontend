import { useCallback, useMemo, type ComponentProps } from 'react'
import { useGetShiftByIdQuery, type VacancyApiItem } from '@/services/api/shiftsApi'
import type { Shift } from '@/shared/shifts/types'
import { FeedCard } from '@/components/ui/shift-card/ShiftCard'
import {
  ShiftDetailsScreen,
  type ShiftDetailsOwnerActions,
} from '@/shared/ui/shift-details-screen/ShiftDetailsScreen'
import { useDetailOverlay } from '@/shared/navigation/overlayContextHooks'

type ShiftDetailsScreenBindings = Omit<
  ComponentProps<typeof ShiftDetailsScreen>,
  'shift' | 'vacancyData' | 'isOpen' | 'onClose'
>

interface VacancyCardWithDetailsProps {
  vacancy: VacancyApiItem
  mapToShift: (vacancy: VacancyApiItem) => Shift
  detailsProps: ShiftDetailsScreenBindings
  ownerActions?: ShiftDetailsOwnerActions
}

const isVacancyDetailOverlay = (
  overlay: { type: string; id: number } | null,
  vacancyId: number
): boolean =>
  overlay != null &&
  (overlay.type === 'shift' || overlay.type === 'vacancy') &&
  overlay.id === vacancyId

export const VacancyCardWithDetails = ({
  vacancy,
  mapToShift,
  detailsProps,
  ownerActions,
}: VacancyCardWithDetailsProps) => {
  const { overlay, openShiftDetail, closeOverlay } = useDetailOverlay()
  const isOpen = isVacancyDetailOverlay(overlay, vacancy.id)

  const { data: detailVacancy } = useGetShiftByIdQuery(String(vacancy.id), {
    skip: !isOpen,
  })

  const resolvedVacancy = useMemo(
    () =>
      detailVacancy
        ? {
            ...detailVacancy,
            my_application: detailVacancy.my_application ?? vacancy.my_application,
          }
        : vacancy,
    [detailVacancy, vacancy]
  )
  const mappedShift = useMemo(() => mapToShift(resolvedVacancy), [resolvedVacancy, mapToShift])

  const handleOpenDetails = useCallback(() => {
    openShiftDetail(vacancy.id)
  }, [openShiftDetail, vacancy.id])

  const handleCloseDetails = useCallback(() => {
    closeOverlay()
  }, [closeOverlay])

  const { onApply, onCancel, ...restDetailsProps } = detailsProps

  const handleDetailsApply = useCallback(
    async (id: number, message?: string) => {
      await onApply(id, message)
      closeOverlay()
    },
    [closeOverlay, onApply]
  )

  const handleDetailsCancel = useCallback(
    async (appId: number | null | undefined, shiftId: number) => {
      await onCancel(appId, shiftId)
      closeOverlay()
    },
    [closeOverlay, onCancel]
  )

  return (
    <>
      <FeedCard shift={mappedShift} onOpenDetails={handleOpenDetails} />

      <ShiftDetailsScreen
        shift={mappedShift}
        vacancyData={resolvedVacancy}
        isOpen={isOpen}
        onClose={handleCloseDetails}
        {...restDetailsProps}
        onApply={handleDetailsApply}
        onCancel={handleDetailsCancel}
        ownerActions={ownerActions}
      />
    </>
  )
}
