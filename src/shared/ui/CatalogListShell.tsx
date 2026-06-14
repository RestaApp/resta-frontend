import type { ReactNode } from 'react'
import type { ActiveFilterItem } from '@/shared/types/active-filters'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { EmptyState } from '@/components/ui/EmptyState'
import { FeedCardSkeletonList } from '@/components/ui/shift-skeleton'
import { InfiniteScrollTrigger } from '@/shared/ui/InfiniteScrollTrigger'
import { SearchFilters } from '@/shared/ui/SearchFilters'

interface CatalogListShellProps {
  activeFilters: ActiveFilterItem[]
  onResetFilters: () => void
  onRemoveFilter: (id: string) => void
  isLoading: boolean
  itemsCount: number
  isEmpty: boolean
  skeletonVariant: 'staff' | 'supplier'
  emptyMessage: string
  emptyDescription: string
  emptyImage?: 'inbox' | 'shift-applicants'
  hasMore: boolean
  isFetching: boolean
  onLoadMore: () => void
  onRefresh?: () => Promise<unknown> | void
  refreshDisabled?: boolean
  children: ReactNode
  className?: string
}

export const CatalogListShell = ({
  activeFilters,
  onResetFilters,
  onRemoveFilter,
  isLoading,
  itemsCount,
  isEmpty,
  skeletonVariant,
  emptyMessage,
  emptyDescription,
  emptyImage = 'inbox',
  hasMore,
  isFetching,
  onLoadMore,
  onRefresh,
  refreshDisabled = false,
  children,
  className = 'ui-density-page ui-density-py',
}: CatalogListShellProps) => {
  const filters = (
    <SearchFilters
      activeFilters={activeFilters}
      onResetFilters={onResetFilters}
      onRemoveFilter={onRemoveFilter}
    />
  )
  const listBody = (
    <div className={className}>
      {isLoading && itemsCount === 0 ? (
        <FeedCardSkeletonList variant={skeletonVariant} className="ui-density-stack" />
      ) : isEmpty ? (
        <EmptyState image={emptyImage} message={emptyMessage} description={emptyDescription} />
      ) : (
        <>
          {children}
          <InfiniteScrollTrigger
            onLoadMore={onLoadMore}
            hasMore={hasMore}
            isLoading={isFetching}
            isError={false}
          />
        </>
      )}
    </div>
  )

  return (
    <>
      {onRefresh ? (
        <PullToRefresh onRefresh={onRefresh} disabled={refreshDisabled} staticContent={filters}>
          {listBody}
        </PullToRefresh>
      ) : (
        <>
          {filters}
          {listBody}
        </>
      )}
    </>
  )
}
