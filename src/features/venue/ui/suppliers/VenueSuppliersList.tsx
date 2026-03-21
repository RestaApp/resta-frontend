import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/ui/EmptyState'
import { EmptyInboxIllustration } from '@/components/ui/empty-illustrations'
import { InfiniteScrollTrigger } from '@/features/feed/ui/components/InfiniteScrollTrigger'
import { SearchFilters } from '@/features/feed/ui/components/SearchFilters'
import { SupplierCard } from '@/components/ui/shift-card/SupplierCard'
import { ShiftSkeleton } from '@/components/ui/shift-skeleton'
import type { SupplierItem } from './types'

interface VenueSuppliersListProps {
  mode?: 'suppliers' | 'restaurants'
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
  mode = 'suppliers',
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
  const isRestaurantsMode = mode === 'restaurants'

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
            illustration={<EmptyInboxIllustration className="h-24 w-24" />}
          />
        ) : (
          <>
            <div className="ui-density-stack-sm">
              {list.map(item => {
                return (
                  <SupplierCard
                    key={item.id}
                    supplier={item}
                    onOpenDetails={onOpenDetails}
                    showDeliveryIndicator={!isRestaurantsMode}
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
