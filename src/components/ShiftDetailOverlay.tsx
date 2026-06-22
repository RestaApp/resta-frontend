import { useMemo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetShiftByIdQuery } from '@/services/api/shiftsApi'
import { ShiftDetailsScreen } from '@/shared/ui/shift-details-screen/ShiftDetailsScreen'
import { DetailsScreenFrame } from '@/shared/ui/shift-details-screen/DetailsScreenFrame'
import { ShiftDetailsSkeleton } from '@/components/ui/shift-details-skeleton'
import { ErrorState } from '@/components/ui/states'
import { vacancyToShift } from '@/shared/shifts/mapping'
import { useShiftApplication } from '@/shared/shifts/useShiftApplication'

interface ShiftDetailOverlayProps {
  id: number
  onClose: () => void
}

export function ShiftDetailOverlay({ id, onClose }: ShiftDetailOverlayProps) {
  const { t } = useTranslation()
  const {
    data: vacancy,
    isLoading: isVacancyLoading,
    isError,
    refetch,
  } = useGetShiftByIdQuery(String(id))
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

  if (isVacancyLoading) {
    return (
      <DetailsScreenFrame
        variant="page"
        open
        onOpenChange={open => {
          if (!open) onClose()
        }}
        onClose={onClose}
      >
        <ShiftDetailsSkeleton />
      </DetailsScreenFrame>
    )
  }

  // Ошибка/удалённая/просроченная смена (частый случай для deep-link) — раньше
  // здесь был бесконечный скелетон (isError не обрабатывался).
  if (isError || !shift) {
    return (
      <DetailsScreenFrame
        variant="page"
        open
        onOpenChange={open => {
          if (!open) onClose()
        }}
        onClose={onClose}
      >
        <ErrorState
          title={t('errors.loadError')}
          onRetry={() => void refetch()}
          retryLabel={t('common.retry', { defaultValue: 'Повторить' })}
          className="min-h-0 py-10"
        />
      </DetailsScreenFrame>
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
