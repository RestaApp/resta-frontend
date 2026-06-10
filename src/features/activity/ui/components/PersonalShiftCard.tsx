import { useCallback, useMemo } from 'react'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { useGetShiftByIdQuery } from '@/services/api/shiftsApi'
import { mapOwnerVacancyToCardShift } from '@/shared/shifts/mapping'
import { useAppSelector } from '@/store/hooks'
import { selectUserData } from '@/features/navigation/model/userSlice'
import { ShiftDetailsScreen } from '@/shared/ui/shift-details-screen/ShiftDetailsScreen'
import { useDetailOverlay } from '@/shared/navigation/overlayContextHooks'
import { OwnerShiftSummaryCard } from './OwnerShiftSummaryCard'

interface PersonalShiftCardProps {
  shift: VacancyApiItem
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  isDeleting?: boolean
}

export const PersonalShiftCard = ({
  shift,
  onEdit,
  onDelete,
  isDeleting,
}: PersonalShiftCardProps) => {
  const userData = useAppSelector(selectUserData)
  const ownerPhotoUrl = userData?.photo_url ?? userData?.profile_photo_url ?? null
  const { overlay, openShiftDetail, closeOverlay } = useDetailOverlay()

  const isOpen =
    overlay != null &&
    (overlay.type === 'shift' || overlay.type === 'vacancy') &&
    overlay.id === shift.id

  const { data: detailVacancy } = useGetShiftByIdQuery(String(shift.id), {
    skip: !isOpen,
  })

  const resolvedVacancy = useMemo(
    () =>
      detailVacancy
        ? {
            ...detailVacancy,
            my_application: detailVacancy.my_application ?? shift.my_application,
          }
        : shift,
    [detailVacancy, shift]
  )

  const mappedShift = useMemo(() => {
    const mapped = mapOwnerVacancyToCardShift(resolvedVacancy)
    return {
      ...mapped,
      photoUrl: mapped.photoUrl ?? ownerPhotoUrl,
    }
  }, [ownerPhotoUrl, resolvedVacancy])

  const handleOpenDetails = useCallback(() => {
    openShiftDetail(shift.id)
  }, [openShiftDetail, shift.id])

  const handleCloseDetails = useCallback(() => {
    closeOverlay()
  }, [closeOverlay])

  return (
    <div className="ui-density-stack">
      <OwnerShiftSummaryCard
        vacancy={shift}
        photoUrl={ownerPhotoUrl}
        onOpenDetails={handleOpenDetails}
      />

      <ShiftDetailsScreen
        shift={mappedShift}
        vacancyData={resolvedVacancy}
        isOpen={isOpen}
        onClose={handleCloseDetails}
        applicationId={null}
        onApply={async () => {}}
        isApplied={false}
        onCancel={async () => {}}
        isLoading={false}
        ownerActions={{ onEdit, onDelete, isDeleting }}
      />
    </div>
  )
}
