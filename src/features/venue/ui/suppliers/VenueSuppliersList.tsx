import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'
import { EmptyInboxIllustration } from '@/components/ui/empty-illustrations'
import { InfiniteScrollTrigger } from '@/features/feed/ui/components/InfiniteScrollTrigger'
import { SupplierCard } from '@/components/ui/shift-card/SupplierCard'
import { Skeleton } from '@/components/ui/skeleton'
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
  onResetFilters,
  list,
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
        </div>
      </div>

      {isLoading && suppliersCount === 0 ? (
        <div className="ui-density-stack-sm">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
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
  )
}
