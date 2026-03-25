import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/ui/EmptyState'
import { EmptyInboxIllustration } from '@/components/ui/empty-illustrations'
import { InfiniteScrollTrigger } from '@/features/feed/ui/components/InfiniteScrollTrigger'
import { SearchFilters } from '@/features/feed/ui/components/SearchFilters'
import { SupplierCard } from '@/components/ui/shift-card/SupplierCard'
import { ShiftSkeleton } from '@/components/ui/shift-skeleton'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/utils/cn'
import type { SupplierItem } from './types'

interface VenueSuppliersListProps {
  mode?: 'suppliers' | 'restaurants'
  isLoading: boolean
  isFetching: boolean
  suppliersCount: number
  totalCount: number
  activeFiltersList: string[]
  onlyActive: boolean
  onOnlyActiveChange: (value: boolean) => void
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
  totalCount,
  activeFiltersList,
  onlyActive,
  onOnlyActiveChange,
  onResetFilters,
  list,
  hasMore,
  onLoadMore,
  onOpenDetails,
}: VenueSuppliersListProps) => {
  const { t } = useTranslation()
  const isRestaurantsMode = mode === 'restaurants'
  const shownCountLabel = isRestaurantsMode
    ? t('supplierUi.restaurants.shownCount', { shown: list.length, total: totalCount })
    : t('venueUi.suppliers.shownCount', { shown: list.length, total: totalCount })

  return (
    <div>
      <SearchFilters activeFiltersList={activeFiltersList} onResetFilters={onResetFilters} />
      {!isRestaurantsMode ? (
        <div
          className={cn(
            'flex flex-wrap items-center justify-between gap-3 ui-density-page ui-density-py-sm bg-background',
            activeFiltersList.length > 0 ? 'border-t border-border' : 'border-b border-border'
          )}
        >
          <p className="text-sm text-muted-foreground">{shownCountLabel}</p>
          <label className="flex items-center gap-2 text-sm">
            <span>{t('venueUi.suppliers.showActive')}</span>
            <Switch
              checked={onlyActive}
              onCheckedChange={onOnlyActiveChange}
              ariaLabel={t('venueUi.suppliers.showActive')}
            />
          </label>
        </div>
      ) : null}
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
