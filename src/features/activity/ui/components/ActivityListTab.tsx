import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ShiftSkeleton } from '@/components/ui/shift-skeleton'
import { MyShiftsSection } from '@/features/activity/ui/components/MyShiftsSection'
import { MyApplicationsSection } from '@/features/activity/ui/components/MyApplicationsSection'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import type { ActivityTab } from '../../model/hooks/useActivityPageModel'

function ActivityListSkeleton() {
  return (
    <div className="ui-density-stack-lg">
      <div>
        <div className="h-9 w-48 bg-muted/50 rounded-xl mb-3" />
        <div className="ui-density-stack">
          <ShiftSkeleton />
          <ShiftSkeleton />
        </div>
      </div>
      <div>
        <div className="h-9 w-40 bg-muted/50 rounded-xl mb-3" />
        <div className="ui-density-stack">
          <ShiftSkeleton />
          <ShiftSkeleton />
        </div>
      </div>
    </div>
  )
}

interface ActivityListTabProps {
  activeTab: ActivityTab
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
  activeTab,
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
  } else if (activeTab === 'shifts') {
    content = (
      <MyShiftsSection
        shifts={shifts}
        onEdit={onEdit}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />
    )
  } else {
    content = <MyApplicationsSection appliedShifts={appliedShifts} showToast={showToast} />
  }

  return (
    <PullToRefresh onRefresh={onRefresh} disabled={isLoadingAny}>
      {content}
    </PullToRefresh>
  )
}
