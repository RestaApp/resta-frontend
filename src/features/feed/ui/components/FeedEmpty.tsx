import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { FeedCardSkeletonList } from '@/components/ui/shift-skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/states'
import type { FeedType } from '@/shared/shifts/types'
import {
  EmptyFiltersIllustration,
  EmptySearchIllustration,
} from '@/components/ui/empty-illustrations'

interface FeedListAreaProps {
  isInitialLoading: boolean
  error: unknown
  showEmptyState: boolean
  showLoadingAfterEmpty: boolean
  feedType: FeedType
  hasActiveFilters: boolean
  emptyMessage: string
  emptyDescription: string
  onResetFilters: () => void
  children: ReactNode
}

/** Обёртка: скелетоны / ошибка / empty / loading after empty / контент */
export function FeedListArea({
  isInitialLoading,
  error,
  showEmptyState,
  showLoadingAfterEmpty,
  feedType,
  hasActiveFilters,
  emptyMessage,
  emptyDescription,
  onResetFilters,
  children,
}: FeedListAreaProps) {
  const { t } = useTranslation()

  if (isInitialLoading) {
    return <FeedCardSkeletonList />
  }

  if (error) {
    return (
      <ErrorState
        title={feedType === 'shifts' ? t('feed.loadErrorShifts') : t('feed.loadErrorVacancies')}
      />
    )
  }

  if (showEmptyState) {
    return (
      <EmptyState
        message={emptyMessage}
        description={emptyDescription}
        illustration={
          hasActiveFilters ? (
            <EmptyFiltersIllustration className="h-24 w-24" />
          ) : (
            <EmptySearchIllustration className="h-24 w-24" />
          )
        }
        onReset={onResetFilters}
        showResetButton={hasActiveFilters}
      />
    )
  }

  if (showLoadingAfterEmpty) {
    return <FeedCardSkeletonList />
  }

  return <>{children}</>
}
