import { useTranslation } from 'react-i18next'
import { SupplierCard } from '@/components/ui/shift-card/SupplierCard'
import { CatalogListShell } from '@/shared/ui/CatalogListShell'
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
    <CatalogListShell
      activeFilters={activeFilters}
      onResetFilters={onResetFilters}
      onRemoveFilter={onRemoveFilter}
      isLoading={isLoading}
      itemsCount={suppliersCount}
      isEmpty={list.length === 0}
      skeletonVariant="supplier"
      emptyMessage={
        isRestaurantsMode
          ? t('supplierUi.restaurants.emptyTitle', {
              defaultValue: 'Заведения не найдены',
            })
          : t('venueUi.suppliers.emptyTitle', { defaultValue: 'Поставщики не найдены' })
      }
      emptyDescription={
        isRestaurantsMode
          ? t('supplierUi.restaurants.emptyDescription', {
              defaultValue: 'Попробуйте обновить список или изменить фильтры',
            })
          : t('venueUi.suppliers.emptyDescription', {
              defaultValue: 'Отключите фильтр или добавьте нового поставщика',
            })
      }
      emptyImage="inbox"
      hasMore={hasMore}
      isFetching={isFetching}
      onLoadMore={onLoadMore}
    >
      <div className="ui-density-stack">
        {list.map(item => (
          <SupplierCard key={item.id} supplier={item} onOpenDetails={onOpenDetails} mode={mode} />
        ))}
      </div>
    </CatalogListShell>
  )
}
