import { useTranslation } from 'react-i18next'
import { ShiftSkeleton } from '@/components/ui/shift-skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { MyShiftsSection } from '@/features/activity/ui/components/MyShiftsSection'
import { MyApplicationsSection } from '@/features/activity/ui/components/MyApplicationsSection'
import type { VacancyApiItem } from '@/services/api/shiftsApi'

function ActivityListSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-9 w-48 bg-muted/50 rounded-xl mb-3" />
        <div className="space-y-4">
          <ShiftSkeleton />
          <ShiftSkeleton />
        </div>
      </div>
      <div>
        <div className="h-9 w-40 bg-muted/50 rounded-xl mb-3" />
        <div className="space-y-4">
          <ShiftSkeleton />
          <ShiftSkeleton />
        </div>
      </div>
    </div>
  )
}

interface ActivityListTabProps {
  isLoading: boolean
  isAppliedLoading: boolean
  isError: boolean
  shifts: VacancyApiItem[]
  appliedShifts: VacancyApiItem[]
  isDeleting: boolean
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  showToast: (m: string, t?: 'success' | 'error' | 'info') => void
}

export function ActivityListTab({
  isLoading,
  isAppliedLoading,
  isError,
  shifts,
  appliedShifts,
  isDeleting,
  onEdit,
  onDelete,
  showToast,
}: ActivityListTabProps) {
  const { t } = useTranslation()
  const isLoadingAny = isLoading || isAppliedLoading

  if (isError) {
    return <div className="text-center py-8 text-destructive">{t('feed.loadErrorShifts')}</div>
  }

  if (isLoadingAny) {
    return <ActivityListSkeleton />
  }

  if (shifts.length === 0 && appliedShifts.length === 0) {
    return (
      <EmptyState
        message={t('activity.emptyList')}
        description={t('activity.emptyListDescription')}
      />
    )
  }

  return (
    <div className="space-y-6">
      <MyShiftsSection
        shifts={shifts}
        onEdit={onEdit}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />
      <MyApplicationsSection appliedShifts={appliedShifts} showToast={showToast} />
    </div>
  )
}
