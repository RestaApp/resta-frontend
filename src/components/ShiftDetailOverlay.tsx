import { useMemo, useCallback, useState } from 'react'
import { useGetShiftByIdQuery } from '@/services/api/shiftsApi'
import { ShiftDetailsScreen } from '@/shared/ui/shift-details-screen/ShiftDetailsScreen'
import { vacancyToShift } from '@/shared/shifts/mapping'
import { useShiftApplication } from '@/shared/shifts/useShiftApplication'
import { Loader } from '@/components/ui/loader'

interface ShiftDetailOverlayProps {
  id: number
  onClose: () => void
}

export function ShiftDetailOverlay({ id, onClose }: ShiftDetailOverlayProps) {
  const { data: vacancy, isLoading: isVacancyLoading } = useGetShiftByIdQuery(String(id))
  const { apply, cancel } = useShiftApplication()
  const [isApplied, setIsApplied] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const shift = useMemo(() => (vacancy ? vacancyToShift(vacancy) : null), [vacancy])

  const applicationId = vacancy?.my_application?.id ?? null
  const hasExistingApplication = Boolean(vacancy?.my_application)

  const handleApply = useCallback(
    async (shiftId: number, message?: string) => {
      setIsActionLoading(true)
      try {
        await apply(shiftId, message)
        setIsApplied(true)
      } finally {
        setIsActionLoading(false)
      }
    },
    [apply]
  )

  const handleCancel = useCallback(
    async (appId: number | null | undefined) => {
      setIsActionLoading(true)
      try {
        await cancel(appId)
        setIsApplied(false)
      } finally {
        setIsActionLoading(false)
      }
    },
    [cancel]
  )

  if (isVacancyLoading || !shift) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <ShiftDetailsScreen
      shift={shift}
      vacancyData={vacancy}
      applicationId={applicationId}
      isOpen
      onClose={onClose}
      onApply={handleApply}
      onCancel={handleCancel}
      isApplied={isApplied || hasExistingApplication}
      isLoading={isActionLoading}
    />
  )
}
