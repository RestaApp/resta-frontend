import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetUsersQuery, type GetUsersParams } from '@/services/api/usersApi'
import { useLabels } from '@/shared/i18n/hooks'
import { useCities } from '@/shared/lib/hooks/useCities'
import { computeHasMore, usePaginatedFilterState } from '@/shared/lib/hooks/usePaginatedFilterState'
import { useAppSelector } from '@/store/hooks'
import { selectSelectedRole, selectUserCity } from '@/store/slices/userSlice'
import { APP_EVENTS } from '@/shared/utils/appEvents'
import { useDetailOverlay } from '@/shared/navigation/overlayContextHooks'
import {
  formatSupplierFiltersForDisplay,
  removeSupplierFilter,
  resolveAppliedCity,
} from './filtersUtils'
import { mapRestaurantUsersToItems, mapSupplierUsersToItems } from './mappers'
import {
  DEFAULT_SUPPLIER_FILTERS,
  SUPPLIERS_PER_PAGE,
  getValidSupplierTypesForCategory,
  type RestaurantApiUser,
  type SupplierApiUser,
  type SupplierFilters,
} from './types'
import { useSuppliersFilterOptions } from './useSuppliersFilterOptions'

/**
 * Контроллер страницы поставщиков/ресторанов.
 *
 * SRP: вся логика state, query‑params, маппингов, фильтров и списков опций.
 * UI‑компонент использует только результат `useVenueSuppliersPageModel()`.
 */
export const useVenueSuppliersPageModel = () => {
  const { t } = useTranslation()
  const { getSupplierTypeLabel, getRestaurantFormatLabel, getCuisineTypeLabel } = useLabels()
  const { cities, isLoading: isCitiesLoading } = useCities({ enabled: true })
  const userCity = useAppSelector(selectUserCity)
  const selectedRole = useAppSelector(selectSelectedRole)
  const isSupplierRole = selectedRole === 'supplier'

  const defaultFilters = useMemo(
    () => ({
      ...DEFAULT_SUPPLIER_FILTERS,
      city: userCity?.trim() || '',
    }),
    [userCity]
  )

  const { openUserProfile, closeOverlay, overlay } = useDetailOverlay()
  const selectedUserId = overlay?.type === 'user' ? overlay.id : null

  const {
    appliedFilters,
    draftFilters,
    setDraftFilters,
    visibleCount,
    isFiltersOpen,
    setIsFiltersOpen,
    incrementVisibleCount,
    handleResetFilters,
    handleRemoveFilter,
    handleResetDraftFilters,
    handleApplyFilters,
  } = usePaginatedFilterState<SupplierFilters>({
    defaultFilters,
    pageSize: SUPPLIERS_PER_PAGE,
    removeFilter: removeSupplierFilter,
    createResetFilters: filters => ({ ...filters, city: '' }),
    openAppEvent: APP_EVENTS.OPEN_SUPPLIERS_FILTERS,
    openFiltersOnAppEvent: true,
  })

  const queryParams = useMemo<GetUsersParams>(() => {
    if (isSupplierRole) {
      const city = resolveAppliedCity(appliedFilters)
      return {
        user_type: 'restaurant',
        city: city || undefined,
        page: 1,
        per_page: visibleCount,
      }
    }

    const city = resolveAppliedCity(appliedFilters)
    const supplierType = appliedFilters.supplierType || undefined
    const supplierTypes = supplierType
      ? getValidSupplierTypesForCategory(supplierType, appliedFilters.serviceCategories)
      : []

    return {
      user_type: 'supplier',
      city: city || undefined,
      supplier_category: supplierType,
      supplier_types: supplierTypes.length > 0 ? supplierTypes.join(',') : undefined,
      delivery_available:
        appliedFilters.delivery === 'all' ? undefined : appliedFilters.delivery === 'yes',
      page: 1,
      per_page: visibleCount,
    }
  }, [appliedFilters, isSupplierRole, visibleCount])

  const { data, isLoading, isFetching, isError, refetch } = useGetUsersQuery(queryParams)

  const { supplierUsers, restaurantUsers } = useMemo(() => {
    const apiData = data?.data
    if (!Array.isArray(apiData)) {
      return {
        supplierUsers: [] as SupplierApiUser[],
        restaurantUsers: [] as RestaurantApiUser[],
      }
    }
    if (isSupplierRole) {
      return {
        supplierUsers: [] as SupplierApiUser[],
        restaurantUsers: apiData as RestaurantApiUser[],
      }
    }
    return {
      supplierUsers: apiData as SupplierApiUser[],
      restaurantUsers: [] as RestaurantApiUser[],
    }
  }, [data?.data, isSupplierRole])

  const suppliers = useMemo(
    () =>
      isSupplierRole
        ? mapRestaurantUsersToItems(restaurantUsers, t, getRestaurantFormatLabel)
        : mapSupplierUsersToItems(supplierUsers, t, getSupplierTypeLabel),
    [
      getRestaurantFormatLabel,
      getSupplierTypeLabel,
      isSupplierRole,
      restaurantUsers,
      supplierUsers,
      t,
    ]
  )

  const list = useMemo(() => {
    if (isSupplierRole) {
      return suppliers.filter(item => {
        if (appliedFilters.restaurantFormats.length > 0) {
          const normalizedCategory = item.supplierCategory.toLowerCase()
          const byFormat = appliedFilters.restaurantFormats.some(format => {
            const label = getRestaurantFormatLabel(format).toLowerCase()
            return normalizedCategory === label
          })
          if (!byFormat) return false
        }
        if (appliedFilters.cuisineTypes.length > 0) {
          const selected = new Set(appliedFilters.cuisineTypes.map(value => value.toLowerCase()))
          const hasCuisine = item.serviceCategories.some(category =>
            selected.has(category.toLowerCase())
          )
          if (!hasCuisine) return false
        }
        return true
      })
    }
    return appliedFilters.onlyActive
      ? suppliers.filter(item => item.status === 'active')
      : suppliers
  }, [
    appliedFilters.cuisineTypes,
    appliedFilters.onlyActive,
    appliedFilters.restaurantFormats,
    getRestaurantFormatLabel,
    isSupplierRole,
    suppliers,
  ])

  const pagination = data?.pagination || data?.meta
  const hasMore = computeHasMore(pagination, suppliers.length)

  const {
    supplierTypeOptions,
    serviceCategoryOptions,
    restaurantFormatOptions,
    cuisineTypeOptions,
  } = useSuppliersFilterOptions({
    isSupplierRole,
    supplierUsers,
    restaurantUsers,
    draftFilters,
  })

  const activeFilters = useMemo(
    () =>
      formatSupplierFiltersForDisplay(
        appliedFilters,
        {
          getRestaurantFormatLabel,
          getCuisineTypeLabel,
          getSupplierTypeLabel,
          deliveryYes: t('venueUi.suppliers.filters.deliveryYes', { defaultValue: 'С доставкой' }),
          deliveryNo: t('venueUi.suppliers.filters.deliveryNo', { defaultValue: 'Без доставки' }),
          onlyActive: t('venueUi.suppliers.showActive', { defaultValue: 'Только активные' }),
        },
        isSupplierRole
      ),
    [
      appliedFilters,
      getRestaurantFormatLabel,
      getSupplierTypeLabel,
      getCuisineTypeLabel,
      isSupplierRole,
      t,
    ]
  )

  const handleLoadMore = useCallback(() => {
    if (isLoading || isFetching || !hasMore) return
    incrementVisibleCount()
  }, [hasMore, incrementVisibleCount, isFetching, isLoading])

  const handleOpenDetails = useCallback(
    (id: number) => {
      openUserProfile(id)
    },
    [openUserProfile]
  )

  const handleCloseDetails = useCallback(() => {
    closeOverlay()
  }, [closeOverlay])

  return {
    isSupplierRole,
    getSupplierTypeLabel,
    getRestaurantFormatLabel,
    getCuisineTypeLabel,
    cities,
    isCitiesLoading,
    isLoading,
    isFetching,
    isError,
    refetch,
    list,
    suppliers,
    suppliersCount: list.length,
    hasMore,
    activeFilters,
    handleLoadMore,
    handleResetFilters,
    handleRemoveFilter,
    selectedUserId,
    handleOpenDetails,
    handleCloseDetails,
    isFiltersOpen,
    setIsFiltersOpen,
    draftFilters,
    setDraftFilters,
    handleApplyFilters,
    handleResetDraftFilters,
    supplierTypeOptions,
    serviceCategoryOptions,
    restaurantFormatOptions,
    cuisineTypeOptions,
  }
}
