import { useCallback } from 'react'
import { useGetShiftByIdQuery, type VacancyApiItem } from '@/services/api/shiftsApi'
import { mapOwnerVacancyToCardShift } from '@/shared/shifts/mapping'
import { useAppSelector } from '@/store/hooks'
import { selectUserData } from '@/features/navigation/model/userSlice'
import { ShiftApplicantsSection } from '@/shared/ui/shift-details-screen/ShiftApplicantsSection'
import { VacancyCardWithDetails } from './VacancyCardWithDetails'

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

  const { data: detailVacancy } = useGetShiftByIdQuery(String(shift.id))

  const applicantsVacancyData = detailVacancy ?? shift

  const mapToShift = useCallback(
    (vacancy: VacancyApiItem) => {
      const mapped = mapOwnerVacancyToCardShift(vacancy)
      return {
        ...mapped,
        photoUrl: mapped.photoUrl ?? ownerPhotoUrl,
      }
    },
    [ownerPhotoUrl]
  )

  return (
    <div className="ui-density-stack">
      <VacancyCardWithDetails
        vacancy={shift}
        mapToShift={mapToShift}
        detailsProps={{
          applicationId: null,
          onApply: async () => {},
          isApplied: false,
          onCancel: async () => {},
          isLoading: false,
        }}
        ownerActions={{ onEdit, onDelete, isDeleting }}
      />

      <ShiftApplicantsSection
        shiftId={shift.id}
        vacancyData={applicantsVacancyData}
        alwaysShow
      />
    </div>
  )
}
