import { useTranslation } from 'react-i18next'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { SupplierDetailsScreen } from '@/components/ui/shift-details-screen/SupplierDetailsScreen'
import { UserProfileDrawer } from '@/features/profile/ui/UserProfileDrawer'
import { VenueSuppliersFiltersDrawer } from './suppliers/VenueSuppliersFiltersDrawer'
import { VenueSuppliersList } from './suppliers/VenueSuppliersList'
import { useVenueSuppliersPageModel } from './suppliers/useVenueSuppliersPageModel'

/**
 * Страница‑оркестратор:
 *  • контроллер `useVenueSuppliersPageModel` — все state/derived/handlers;
 *  • `VenueSuppliersList` — лента с пагинацией;
 *  • `VenueSuppliersFiltersDrawer` — фильтры в bottom sheet;
 *  • details drawer в зависимости от роли.
 */
export function VenueSuppliersPage() {
  const { t } = useTranslation()
  const m = useVenueSuppliersPageModel()

  if (m.isError) {
    return (
      <div className="ui-density-page ui-density-py text-center text-destructive">
        {t('venueUi.suppliers.loadError', { defaultValue: 'Не удалось загрузить поставщиков' })}
      </div>
    )
  }

  return (
    <PullToRefresh onRefresh={() => m.refetch()} disabled={m.isLoading}>
      <VenueSuppliersList
        mode={m.isSupplierRole ? 'restaurants' : 'suppliers'}
        isLoading={m.isLoading}
        isFetching={m.isFetching}
        suppliersCount={m.suppliersCount}
        totalCount={m.totalCount}
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
          onClose={() => m.setSelectedRestaurantId(null)}
        />
      ) : (
        <SupplierDetailsScreen
          supplier={m.selectedSupplier}
          isOpen={m.selectedSupplierId !== null}
          onClose={() => m.setSelectedSupplierId(null)}
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
