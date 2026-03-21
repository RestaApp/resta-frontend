import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/ui/EmptyState'
import { EmptyInboxIllustration } from '@/components/ui/empty-illustrations'
import { InfiniteScrollTrigger } from '@/features/feed/ui/components/InfiniteScrollTrigger'
import { SearchFilters } from '@/features/feed/ui/components/SearchFilters'
import { SupplierCard } from '@/components/ui/shift-card/SupplierCard'
import { ShiftSkeleton } from '@/components/ui/shift-skeleton'
import type { SupplierItem } from './types'

interface VenueSuppliersListProps {
  isLoading: boolean
  isFetching: boolean
  suppliersCount: number
  totalCount: number
  hasActiveApiFilters: boolean
  activeFiltersList: string[]
  onlyActive: boolean
  onToggleOnlyActive: () => void
  onResetFilters: () => void
  list: SupplierItem[]
  hasMore: boolean
  onLoadMore: () => void
  onOpenDetails: (id: number) => void
}

export const VenueSuppliersList = ({
  isLoading,
  isFetching,
  suppliersCount,
  activeFiltersList,
  onResetFilters,
  list,
  hasMore,
  onLoadMore,
  onOpenDetails,
}: VenueSuppliersListProps) => {
  const { t } = useTranslation()

  return (
    <div>
      <SearchFilters activeFiltersList={activeFiltersList} onResetFilters={onResetFilters} />
      <div className="ui-density-page ui-density-py">
        {isLoading && suppliersCount === 0 ? (
          <div className="ui-density-stack-sm">
            <ShiftSkeleton variant="supplier" />
            <ShiftSkeleton variant="supplier" />
            <ShiftSkeleton variant="supplier" />
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            message={t('venueUi.suppliers.emptyTitle', { defaultValue: 'Поставщики не найдены' })}
            description={t('venueUi.suppliers.emptyDescription', {
              defaultValue: 'Отключите фильтр или добавьте нового поставщика',
            })}
            illustration={<EmptyInboxIllustration className="h-24 w-24" />}
          />
        ) : (
          <>
            <div className="ui-density-stack-sm">
              {list.map(item => {
                return <SupplierCard key={item.id} supplier={item} onOpenDetails={onOpenDetails} />
              })}
            </div>

            <InfiniteScrollTrigger
              onLoadMore={onLoadMore}
              hasMore={hasMore}
              isLoading={isFetching}
              isError={false}
            />
          </>
        )}
      </div>
    </div>
  )
}
