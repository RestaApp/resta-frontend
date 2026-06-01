import { useTranslation } from 'react-i18next'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { SupplierDetailsScreen } from '@/shared/ui/shift-details-screen/SupplierDetailsScreen'
import { ErrorState } from '@/components/ui/states'
import { UserProfileDrawer } from '@/features/profile/ui/UserProfileDrawer'
import { VenueSuppliersFiltersDrawer } from './suppliers/VenueSuppliersFiltersDrawer'
import { VenueSuppliersList } from './suppliers/VenueSuppliersList'
import { useVenueSuppliersPageModel } from './suppliers/useVenueSuppliersPageModel'
import { useDetailOverlay } from '@/shared/navigation/DetailOverlayContext'

/**
 * Страница‑оркестратор:
 *  • контроллер `useVenueSuppliersPageModel` — все state/derived/handlers;
 *  • `VenueSuppliersList` — лента с пагинацией;
 *  • `VenueSuppliersFiltersDrawer` — фильтры в bottom sheet;
 *  • details drawer в зависимости от роли.
 */
export function VenueSuppliersPage() {
  const { t } = useTranslation()
  const { closeOverlay } = useDetailOverlay()
  const m = useVenueSuppliersPageModel()

  if (m.isError) {
    const errorTitle = m.isSupplierRole
      ? t('supplierUi.restaurants.loadError', { defaultValue: 'Не удалось загрузить рестораны' })
      : t('venueUi.suppliers.loadError', { defaultValue: 'Не удалось загрузить поставщиков' })
    return (
      <ErrorState
        title={errorTitle}
        onRetry={() => m.refetch()}
        retryLabel={t('common.retry', { defaultValue: 'Повторить' })}
      />
    )
  }

  return (
    <PullToRefresh onRefresh={() => m.refetch()} disabled={m.isLoading}>
      <VenueSuppliersList
        mode={m.isSupplierRole ? 'restaurants' : 'suppliers'}
        isLoading={m.isLoading}
        isFetching={m.isFetching}
        suppliersCount={m.suppliersCount}
        activeFiltersList={m.activeFiltersList}
        onlyActive={m.onlyActive}
        onOnlyActiveChange={m.setOnlyActive}
        onResetFilters={m.handleResetFilters}
        list={m.list}
        hasMore={m.hasMore}
        onLoadMore={m.handleLoadMore}
        onOpenDetails={m.handleOpenDetails}
      />

      {m.isSupplierRole ? (
        <UserProfileDrawer
          userId={m.selectedRestaurant?.id ?? null}
          open={m.selectedRestaurantId !== null}
          onClose={() => {
            m.setSelectedRestaurantId(null)
            closeOverlay()
          }}
        />
      ) : (
        <SupplierDetailsScreen
          supplier={m.selectedSupplier}
          isOpen={m.selectedSupplierId !== null}
          onClose={() => {
            m.setSelectedSupplierId(null)
            closeOverlay()
          }}
        />
      )}

      <VenueSuppliersFiltersDrawer
        mode={m.isSupplierRole ? 'restaurants' : 'suppliers'}
        open={m.isFiltersOpen}
        onOpenChange={m.setIsFiltersOpen}
        draftFilters={m.draftFilters}
        setDraftFilters={m.setDraftFilters}
        supplierTypeOptions={m.supplierTypeOptions}
        serviceCategoryOptions={m.serviceCategoryOptions}
        restaurantFormatOptions={m.restaurantFormatOptions}
        cuisineTypeOptions={m.cuisineTypeOptions}
        cities={m.cities}
        isCitiesLoading={m.isCitiesLoading}
        getSupplierTypeLabel={m.getSupplierTypeLabel}
        getRestaurantFormatLabel={m.getRestaurantFormatLabel}
        getCuisineTypeLabel={m.getCuisineTypeLabel}
        onApply={m.handleApplyFilters}
        onReset={m.handleResetDraftFilters}
      />
    </PullToRefresh>
  )
}
