import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from 'react'
import { useGetShiftByIdQuery, type VacancyApiItem } from '@/services/api/shiftsApi'
import type { Shift } from '@/shared/shifts/types'
import { FeedCard } from '@/components/ui/shift-card/ShiftCard'
import {
  ShiftDetailsScreen,
  type ShiftDetailsOwnerActions,
} from '@/shared/ui/shift-details-screen/ShiftDetailsScreen'
import { useDetailOverlay } from '@/shared/navigation/DetailOverlayContext'

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

export const VacancyCardWithDetails = ({
  vacancy,
  mapToShift,
  detailsProps,
  ownerActions,
}: VacancyCardWithDetailsProps) => {
  const { overlay, openShiftDetail, closeOverlay } = useDetailOverlay()
  const [isOpen, setIsOpen] = useState(false)

  const prevOverlayRef = useRef(overlay)
  useEffect(() => {
    if (prevOverlayRef.current && !overlay && isOpen) {
      setIsOpen(false)
    }
    prevOverlayRef.current = overlay
  }, [overlay, isOpen])
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
    setIsOpen(true)
    openShiftDetail(vacancy.id)
  }, [openShiftDetail, vacancy.id])
  const handleCloseDetails = useCallback(() => {
    setIsOpen(false)
    closeOverlay()
  }, [closeOverlay])

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
      />

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
