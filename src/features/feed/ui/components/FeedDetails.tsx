import { ShiftDetailsScreen } from '@/components/ui/ShiftDetailsScreen'
import type { Shift } from '@/features/feed/model/types'
import type { VacancyApiItem } from '@/services/api/shiftsApi'

interface FeedDetailsProps {
  selectedShift: Shift | null
  selectedVacancy: VacancyApiItem | null
  applicationId: number | null
  isApplied: boolean
  isLoading: boolean
  onClose: () => void
  onApply: (id: number, message?: string) => Promise<void>
  onCancel: (applicationId: number | null | undefined, shiftId: number) => Promise<void>
}

export function FeedDetails({
  selectedShift,
  selectedVacancy,
  applicationId,
  isApplied,
  isLoading,
  onClose,
  onApply,
  onCancel,
}: FeedDetailsProps) {
  return (
    <ShiftDetailsScreen
      shift={selectedShift}
      vacancyData={selectedVacancy}
      applicationId={applicationId}
      isOpen
      onClose={onClose}
      onApply={onApply}
      onCancel={onCancel}
      isApplied={isApplied}
      isLoading={isLoading}
    />
  )
}
