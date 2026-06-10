import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { FeedCardSkeletonList } from '@/components/ui/shift-skeleton'
import { ErrorState } from '@/components/ui/states'
import { MyShiftsSection } from '@/features/activity/ui/components/MyShiftsSection'
import { MyApplicationsSection } from '@/features/activity/ui/components/MyApplicationsSection'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import type { ActivityTab } from '@/shared/types/activity.types'
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
  onRefresh,
}: ActivityListTabProps) {
  const { t } = useTranslation()
  const isLoadingAny = isLoading || isAppliedLoading

  let content: ReactNode

  if (isError) {
    content = (
      <ErrorState
        title={t('feed.loadErrorShifts')}
        onRetry={() => void onRefresh()}
        retryLabel={t('common.retry', { defaultValue: 'Повторить' })}
      />
    )
  } else if (isLoadingAny) {
    content = <FeedCardSkeletonList />
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
    content = <MyApplicationsSection appliedShifts={appliedShifts} />
  }

  return (
    <PullToRefresh onRefresh={onRefresh} disabled={isLoadingAny}>
      {content}
    </PullToRefresh>
  )
}
