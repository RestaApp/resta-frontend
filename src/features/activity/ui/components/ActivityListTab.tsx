import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ShiftSkeleton } from '@/components/ui/shift-skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { MyShiftsSection } from '@/features/activity/ui/components/MyShiftsSection'
import { MyApplicationsSection } from '@/features/activity/ui/components/MyApplicationsSection'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { EmptyInboxIllustration } from '@/components/ui/empty-illustrations'
import { PullToRefresh } from '@/components/ui/PullToRefresh'

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
  onRefresh: () => Promise<void>
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
  onRefresh,
}: ActivityListTabProps) {
  const { t } = useTranslation()
  const isLoadingAny = isLoading || isAppliedLoading

  let content: ReactNode

  if (isError) {
    content = <div className="text-center py-8 text-destructive">{t('feed.loadErrorShifts')}</div>
  } else if (isLoadingAny) {
    content = <ActivityListSkeleton />
  } else if (shifts.length === 0 && appliedShifts.length === 0) {
    content = (
      <EmptyState
        message={t('activity.emptyList')}
        description={t('activity.emptyListDescription')}
        illustration={<EmptyInboxIllustration className="h-24 w-24" />}
      />
    )
  } else {
    content = (
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

  return (
    <PullToRefresh onRefresh={onRefresh} disabled={isLoadingAny}>
      {content}
    </PullToRefresh>
  )
}
