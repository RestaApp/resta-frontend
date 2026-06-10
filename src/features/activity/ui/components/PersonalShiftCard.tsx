import { useCallback } from 'react'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { mapOwnerVacancyToCardShiftWithPhoto } from '@/shared/shifts/mapping'
import { useAppSelector } from '@/store/hooks'
import { selectUserData } from '@/features/navigation/model/userSlice'
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

  const mapToShift = useCallback(
    (vacancy: VacancyApiItem) => mapOwnerVacancyToCardShiftWithPhoto(vacancy, ownerPhotoUrl),
    [ownerPhotoUrl]
  )

  return (
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
  )
}
