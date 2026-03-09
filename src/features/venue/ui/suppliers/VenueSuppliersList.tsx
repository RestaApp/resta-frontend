import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { EmptyInboxIllustration } from '@/components/ui/empty-illustrations'
import { InfiniteScrollTrigger } from '@/features/feed/ui/components/InfiniteScrollTrigger'
import { ShiftCard } from '@/components/ui/shift-card/ShiftCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { Shift } from '@/features/feed/model/types'
import type { SupplierItem } from './types'

interface VenueSuppliersListProps {
  isLoading: boolean
  isFetching: boolean
  suppliersCount: number
  totalCount: number
  hasActiveApiFilters: boolean
  onlyActive: boolean
  onToggleOnlyActive: () => void
  onResetFilters: () => void
  list: SupplierItem[]
  supplierShiftMap: Map<number, Shift>
  hasMore: boolean
  onLoadMore: () => void
  onOpenDetails: (id: number) => void
}

export const VenueSuppliersList = ({
  isLoading,
  isFetching,
  suppliersCount,
  totalCount,
  hasActiveApiFilters,
  onlyActive,
  onToggleOnlyActive,
  onResetFilters,
  list,
  supplierShiftMap,
  hasMore,
  onLoadMore,
  onOpenDetails,
}: VenueSuppliersListProps) => {
  const { t } = useTranslation()

  return (
    <div className="ui-density-page ui-density-py ui-density-stack">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('venueUi.suppliers.total', { defaultValue: 'Всего поставщиков' })}: {totalCount}
        </p>
        <div className="flex items-center gap-2">
          {hasActiveApiFilters ? (
            <Button size="sm" variant="outline" onClick={onResetFilters}>
              {t('common.reset', { defaultValue: 'Сбросить' })}
            </Button>
          ) : null}
          <Button
            size="sm"
            variant={onlyActive ? 'primary' : 'outline'}
            onClick={onToggleOnlyActive}
          >
            {onlyActive
              ? t('venueUi.suppliers.showAll', { defaultValue: 'Показать всех' })
              : t('venueUi.suppliers.showActive', { defaultValue: 'Только активные' })}
          </Button>
        </div>
      </div>

      {isLoading && suppliersCount === 0 ? (
        <div className="ui-density-stack-sm">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
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
              const shift = supplierShiftMap.get(item.id)
              if (!shift) return null

              return (
                <ShiftCard
                  key={item.id}
                  shift={shift}
                  variant="supplier"
                  onOpenDetails={onOpenDetails}
                  onApply={() => {}}
                  onCancel={() => {}}
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
  )
}
