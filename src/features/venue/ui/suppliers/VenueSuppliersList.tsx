import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/ui/EmptyState'
import { InfiniteScrollTrigger } from '@/shared/ui/InfiniteScrollTrigger'
import { SearchFilters } from '@/shared/ui/SearchFilters'
import { SupplierCard } from '@/components/ui/shift-card/SupplierCard'
import { FeedCardSkeletonList } from '@/components/ui/shift-skeleton'
import type { ActiveFilterItem } from '@/shared/types/active-filters'
import type { SupplierItem } from './types'

interface VenueSuppliersListProps {
  mode?: 'suppliers' | 'restaurants'
  isLoading: boolean
  isFetching: boolean
  suppliersCount: number
  activeFilters: ActiveFilterItem[]
  onResetFilters: () => void
  onRemoveFilter: (id: string) => void
  list: SupplierItem[]
  hasMore: boolean
  onLoadMore: () => void
  onOpenDetails: (id: number) => void
}

export const VenueSuppliersList = ({
  mode = 'suppliers',
  isLoading,
  isFetching,
  suppliersCount,
  activeFilters,
  onResetFilters,
  onRemoveFilter,
  list,
  hasMore,
  onLoadMore,
  onOpenDetails,
}: VenueSuppliersListProps) => {
  const { t } = useTranslation()
  const isRestaurantsMode = mode === 'restaurants'

  return (
    <div>
      <SearchFilters
        activeFilters={activeFilters}
        onResetFilters={onResetFilters}
        onRemoveFilter={onRemoveFilter}
      />
      <div className="ui-density-page ui-density-py">
        {isLoading && suppliersCount === 0 ? (
          <FeedCardSkeletonList variant="supplier" className="ui-density-stack" />
        ) : list.length === 0 ? (
          <EmptyState
            message={
              isRestaurantsMode
                ? t('supplierUi.restaurants.emptyTitle', {
                  defaultValue: 'Заведения не найдены',
                })
                : t('venueUi.suppliers.emptyTitle', { defaultValue: 'Поставщики не найдены' })
            }
            description={
              isRestaurantsMode
                ? t('supplierUi.restaurants.emptyDescription', {
                  defaultValue: 'Попробуйте обновить список или изменить фильтры',
                })
                : t('venueUi.suppliers.emptyDescription', {
                  defaultValue: 'Отключите фильтр или добавьте нового поставщика',
                })
            }
            image="inbox"
          />
        ) : (
          <>
            <div className="ui-density-stack">
              {list.map(item => {
                return (
                  <SupplierCard
                    key={item.id}
                    supplier={item}
                    onOpenDetails={onOpenDetails}
                    mode={mode}
                  />
                )
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
