import { useTranslation } from 'react-i18next'
import { ShiftSkeleton } from '@/components/ui/shift-skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import type { FeedType } from '@/features/feed/model/types'
import {
  EmptyFiltersIllustration,
  EmptySearchIllustration,
} from '@/components/ui/empty-illustrations'

interface FeedEmptyProps {
  emptyMessage: string
  emptyDescription: string
  onReset: () => void
  showResetButton: boolean
  hasActiveFilters: boolean
}

export function FeedEmpty({
  emptyMessage,
  emptyDescription,
  onReset,
  showResetButton,
  hasActiveFilters,
}: FeedEmptyProps) {
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
      onReset={onReset}
      showResetButton={showResetButton}
    />
  )
}

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
  children: React.ReactNode
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
    return (
      <div className="space-y-4">
        <ShiftSkeleton />
        <ShiftSkeleton />
        <ShiftSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 text-center text-destructive">
        {feedType === 'shifts' ? t('feed.loadErrorShifts') : t('feed.loadErrorVacancies')}
      </div>
    )
  }

  if (showEmptyState) {
    return (
      <FeedEmpty
        emptyMessage={emptyMessage}
        emptyDescription={emptyDescription}
        onReset={onResetFilters}
        showResetButton={hasActiveFilters}
        hasActiveFilters={hasActiveFilters}
      />
    )
  }

  if (showLoadingAfterEmpty) {
    return (
      <div className="space-y-4">
        <ShiftSkeleton />
        <ShiftSkeleton />
        <ShiftSkeleton />
      </div>
    )
  }

  return <>{children}</>
}
