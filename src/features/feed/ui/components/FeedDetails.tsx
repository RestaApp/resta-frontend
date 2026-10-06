import {
  ShiftDetailsScreen,
  type ShiftDetailsOwnerActions,
} from '@/shared/ui/shift-details-screen/ShiftDetailsScreen'
import type { Shift, ShiftStatus } from '@/shared/shifts/types'
import type { VacancyApiItem } from '@/services/api/shiftsApi'

interface FeedDetailsProps {
  selectedShift: Shift | null
  selectedVacancy: VacancyApiItem | null
  applicationId: number | null
  /** Свежий статус отклика из getAppliedShifts (кэш ленты может отставать после accept/reject). */
  applicationStatus: ShiftStatus
  isApplied: boolean
  isLoading: boolean
  onClose: () => void
  onApply: (id: number, message?: string) => Promise<void>
  onCancel: (applicationId: number | null | undefined, shiftId: number) => Promise<void>
  ownerActions?: ShiftDetailsOwnerActions
}

export function FeedDetails({
  selectedShift,
  selectedVacancy,
  applicationId,
  applicationStatus,
  isApplied,
  isLoading,
  onClose,
  onApply,
  onCancel,
  ownerActions,
}: FeedDetailsProps) {
  return (
    <ShiftDetailsScreen
      shift={selectedShift}
      vacancyData={selectedVacancy}
      applicationId={applicationId}
      applicationStatus={applicationStatus}
      isOpen
      onClose={onClose}
      onApply={onApply}
      onCancel={onCancel}
      isApplied={isApplied}
      isLoading={isLoading}
      ownerActions={ownerActions}
    />
  )
}
