import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetUsersQuery, type GetUsersParams } from '@/services/api/usersApi'
import { useLabels } from '@/shared/i18n/hooks'
import { useCities } from '@/shared/lib/hooks/useCities'
import { useAppSelector } from '@/store/hooks'
import { selectSelectedRole, selectUserCity } from '@/features/navigation/model/userSlice'
import { APP_EVENTS, onAppEvent } from '@/shared/utils/appEvents'
import { resolveAppliedCity } from './filtersUtils'
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

  const [onlyActive, setOnlyActive] = useState(false)
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null)
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<SupplierFilters>(defaultFilters)
  const [draftFilters, setDraftFilters] = useState<SupplierFilters>(defaultFilters)
  const [visibleCount, setVisibleCount] = useState(SUPPLIERS_PER_PAGE)

  // Sync ref для глобального event listener (избегаем stale closure).
  const appliedFiltersRef = useRef(appliedFilters)
  useEffect(() => {
    appliedFiltersRef.current = appliedFilters
  }, [appliedFilters])

  // Subscription на global app event "открыть фильтры" — лежит снаружи компонента.
  useEffect(() => {
    return onAppEvent(APP_EVENTS.OPEN_SUPPLIERS_FILTERS, () => {
      setDraftFilters(appliedFiltersRef.current)
      setIsFiltersOpen(true)
    })
  }, [])

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
    return onlyActive ? suppliers.filter(item => item.status === 'active') : suppliers
  }, [
    appliedFilters.cuisineTypes,
    appliedFilters.restaurantFormats,
    getRestaurantFormatLabel,
    isSupplierRole,
    onlyActive,
    suppliers,
  ])

  const suppliersMap = useMemo(() => {
    const map = new Map<number, (typeof suppliers)[number]>()
    for (const item of suppliers) map.set(item.id, item)
    return map
  }, [suppliers])

  const selectedSupplier =
    selectedSupplierId !== null ? (suppliersMap.get(selectedSupplierId) ?? null) : null

  const selectedRestaurant =
    selectedRestaurantId !== null ? (suppliersMap.get(selectedRestaurantId) ?? null) : null

  const pagination = data?.pagination || data?.meta

  const hasMore = (() => {
    if (!pagination) return false
    if (typeof pagination.total_count === 'number') {
      return suppliers.length < pagination.total_count
    }
    if (pagination.next_page !== undefined && pagination.next_page !== null) return true
    if (pagination.current_page && pagination.total_pages) {
      return pagination.current_page < pagination.total_pages
    }
    return false
  })()

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

  const activeFiltersList = useMemo(() => {
    const result: string[] = []
    if (isSupplierRole) {
      const city = resolveAppliedCity(appliedFilters)
      if (city) result.push(city)
      if (appliedFilters.restaurantFormats.length > 0) {
        result.push(
          ...appliedFilters.restaurantFormats.map(value => getRestaurantFormatLabel(value))
        )
      }
      if (appliedFilters.cuisineTypes.length > 0) {
        result.push(...appliedFilters.cuisineTypes.map(value => getCuisineTypeLabel(value)))
      }
      return result
    }
    const city = resolveAppliedCity(appliedFilters)
    if (city) result.push(city)
    if (appliedFilters.supplierType) {
      result.push(getSupplierTypeLabel(appliedFilters.supplierType))
    }
    const validSupplierTypes = appliedFilters.supplierType
      ? getValidSupplierTypesForCategory(
          appliedFilters.supplierType,
          appliedFilters.serviceCategories
        )
      : []
    if (validSupplierTypes.length > 0) {
      result.push(...validSupplierTypes.map(category => getSupplierTypeLabel(category)))
    }
    if (appliedFilters.delivery === 'yes') {
      result.push(t('venueUi.suppliers.filters.deliveryYes', { defaultValue: 'С доставкой' }))
    } else if (appliedFilters.delivery === 'no') {
      result.push(t('venueUi.suppliers.filters.deliveryNo', { defaultValue: 'Без доставки' }))
    }
    return result
  }, [
    appliedFilters,
    getRestaurantFormatLabel,
    getSupplierTypeLabel,
    getCuisineTypeLabel,
    isSupplierRole,
    t,
  ])

  const handleLoadMore = useCallback(() => {
    if (isLoading || isFetching || !hasMore) return
    setVisibleCount(prev => prev + SUPPLIERS_PER_PAGE)
  }, [hasMore, isFetching, isLoading])

  const handleResetFilters = useCallback(() => {
    const next = { ...defaultFilters, city: '' }
    setAppliedFilters(next)
    setDraftFilters(next)
    setVisibleCount(SUPPLIERS_PER_PAGE)
  }, [defaultFilters])

  const handleResetDraftFilters = useCallback(() => {
    setDraftFilters({ ...defaultFilters, city: '' })
  }, [defaultFilters])

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(draftFilters)
    setVisibleCount(SUPPLIERS_PER_PAGE)
    setIsFiltersOpen(false)
  }, [draftFilters])

  const handleOpenDetails = useCallback(
    (id: number) => {
      if (isSupplierRole) {
        setSelectedRestaurantId(id)
        return
      }
      setSelectedSupplierId(id)
    },
    [isSupplierRole]
  )

  return {
    // role
    isSupplierRole,

    // labels
    getSupplierTypeLabel,
    getRestaurantFormatLabel,
    getCuisineTypeLabel,

    // cities (for filters drawer)
    cities,
    isCitiesLoading,

    // list state
    isLoading,
    isFetching,
    isError,
    refetch,
    list,
    suppliers,
    suppliersCount: suppliers.length,
    hasMore,
    activeFiltersList,
    onlyActive,
    setOnlyActive,
    handleLoadMore,
    handleResetFilters,

    // selection
    selectedSupplier,
    selectedSupplierId,
    setSelectedSupplierId,
    selectedRestaurant,
    selectedRestaurantId,
    setSelectedRestaurantId,
    handleOpenDetails,

    // filters drawer
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
