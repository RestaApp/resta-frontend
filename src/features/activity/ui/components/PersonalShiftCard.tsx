import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { mapOwnerVacancyToCardShift } from '@/features/feed/model/utils/mapping'
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
  return (
    <VacancyCardWithDetails
      vacancy={shift}
      mapToShift={mapOwnerVacancyToCardShift}
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
