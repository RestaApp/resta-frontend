import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetUsersQuery, type GetUsersParams } from '@/services/api/usersApi'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { useLabels } from '@/shared/i18n/hooks'
import { useCities } from '@/hooks/useCities'
import { SupplierDetailsScreen } from '@/components/ui/shift-details-screen/SupplierDetailsScreen'
import { useAppSelector } from '@/store/hooks'
import { selectSelectedRole, selectUserCity } from '@/features/navigation/model/userSlice'
import { VenueSuppliersFiltersDrawer } from './suppliers/VenueSuppliersFiltersDrawer'
import { VenueSuppliersList } from './suppliers/VenueSuppliersList'
import {
  getRestaurantProfile,
  mapRestaurantUsersToItems,
  mapSupplierUsersToItems,
} from './suppliers/mappers'
import { resolveAppliedCity } from './suppliers/filtersUtils'
import { UserProfileDrawer } from '@/features/profile/ui/UserProfileDrawer'
import {
  DEFAULT_SERVICE_CATEGORY_OPTIONS,
  DEFAULT_SUPPLIER_FILTERS,
  DEFAULT_SUPPLIER_TYPES,
  SUPPLIERS_PER_PAGE,
  SUPPLIER_TYPES_BY_CATEGORY,
  type RestaurantApiUser,
  type SupplierApiUser,
  type SupplierFilters,
  getValidSupplierTypesForCategory,
  isSupplierCategory,
} from './suppliers/types'
import { APP_EVENTS, onAppEvent } from '@/shared/utils/appEvents'

export function VenueSuppliersPage() {
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

  const appliedFiltersRef = useRef(appliedFilters)

  useEffect(() => {
    appliedFiltersRef.current = appliedFilters
  }, [appliedFilters])

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

  const selectedSupplier = useMemo(
    () => (selectedSupplierId !== null ? (suppliersMap.get(selectedSupplierId) ?? null) : null),
    [selectedSupplierId, suppliersMap]
  )

  const selectedRestaurant = useMemo(
    () => (selectedRestaurantId !== null ? (suppliersMap.get(selectedRestaurantId) ?? null) : null),
    [selectedRestaurantId, suppliersMap]
  )

  const pagination = data?.pagination || data?.meta
  const totalCount =
    typeof pagination?.total_count === 'number' ? pagination.total_count : suppliers.length

  const hasMore = useMemo(() => {
    if (!pagination) return false
    if (typeof pagination.total_count === 'number') {
      return suppliers.length < pagination.total_count
    }
    if (pagination.next_page !== undefined && pagination.next_page !== null) {
      return true
    }
    if (pagination.current_page && pagination.total_pages) {
      return pagination.current_page < pagination.total_pages
    }
    return false
  }, [pagination, suppliers.length])

  const supplierTypeOptions = useMemo(() => {
    if (isSupplierRole) return []
    const fromApi = supplierUsers
      .map(
        item =>
          item.supplier_profile?.supplier_category ??
          item.supplier_profile_attributes?.supplier_category ??
          item.supplier_profile?.supplier_type ??
          item.supplier_profile_attributes?.supplier_type
      )
      .filter((value): value is string => Boolean(value))

    return Array.from(new Set([...DEFAULT_SUPPLIER_TYPES, ...fromApi]))
  }, [isSupplierRole, supplierUsers])

  const allServiceCategoryOptions = useMemo(() => {
    if (isSupplierRole) return []
    const fromApi = supplierUsers.flatMap(item => {
      const categories =
        item.supplier_profile?.supplier_types ?? item.supplier_profile_attributes?.supplier_types
      return Array.isArray(categories) ? categories : []
    })

    return Array.from(new Set([...DEFAULT_SERVICE_CATEGORY_OPTIONS, ...fromApi]))
  }, [isSupplierRole, supplierUsers])

  const serviceCategoryOptions = useMemo(() => {
    if (isSupplierRole) return []
    const selectedCategory = draftFilters.supplierType
    if (!selectedCategory || !isSupplierCategory(selectedCategory)) {
      return allServiceCategoryOptions
    }

    const validByCategory = new Set(SUPPLIER_TYPES_BY_CATEGORY[selectedCategory])
    return allServiceCategoryOptions.filter(option => validByCategory.has(option))
  }, [allServiceCategoryOptions, draftFilters.supplierType, isSupplierRole])

  const restaurantFormatOptions = useMemo(() => {
    if (!isSupplierRole) return []
    const fromApi = restaurantUsers
      .map(item => {
        const profile = getRestaurantProfile(item)
        return profile?.restaurant_format ?? profile?.format ?? null
      })
      .filter((value): value is string => Boolean(value))

    return Array.from(new Set(fromApi))
  }, [isSupplierRole, restaurantUsers])

  const cuisineTypeOptions = useMemo(() => {
    if (!isSupplierRole) return []
    const fromApi = restaurantUsers.flatMap(item => {
      const profile = getRestaurantProfile(item)
      const raw = profile?.cuisine_types
      return Array.isArray(raw) ? raw.filter((value): value is string => Boolean(value)) : []
    })
    return Array.from(new Set(fromApi))
  }, [isSupplierRole, restaurantUsers])

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

  if (isError) {
    return (
      <div className="ui-density-page ui-density-py text-center text-destructive">
        {t('venueUi.suppliers.loadError', { defaultValue: 'Не удалось загрузить поставщиков' })}
      </div>
    )
  }

  return (
    <PullToRefresh onRefresh={() => refetch()} disabled={isLoading}>
      <VenueSuppliersList
        mode={isSupplierRole ? 'restaurants' : 'suppliers'}
        isLoading={isLoading}
        isFetching={isFetching}
        suppliersCount={suppliers.length}
        totalCount={totalCount}
        activeFiltersList={activeFiltersList}
        onlyActive={onlyActive}
        onOnlyActiveChange={setOnlyActive}
        onResetFilters={handleResetFilters}
        list={list}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        onOpenDetails={handleOpenDetails}
      />

      {isSupplierRole ? (
        <UserProfileDrawer
          userId={selectedRestaurant?.id ?? null}
          open={selectedRestaurantId !== null}
          onClose={() => setSelectedRestaurantId(null)}
        />
      ) : (
        <SupplierDetailsScreen
          supplier={selectedSupplier}
          isOpen={selectedSupplierId !== null}
          onClose={() => setSelectedSupplierId(null)}
        />
      )}

      <VenueSuppliersFiltersDrawer
        mode={isSupplierRole ? 'restaurants' : 'suppliers'}
        open={isFiltersOpen}
        onOpenChange={setIsFiltersOpen}
        draftFilters={draftFilters}
        setDraftFilters={setDraftFilters}
        supplierTypeOptions={supplierTypeOptions}
        serviceCategoryOptions={serviceCategoryOptions}
        restaurantFormatOptions={restaurantFormatOptions}
        cuisineTypeOptions={cuisineTypeOptions}
        cities={cities}
        isCitiesLoading={isCitiesLoading}
        getSupplierTypeLabel={getSupplierTypeLabel}
        getRestaurantFormatLabel={getRestaurantFormatLabel}
        getCuisineTypeLabel={getCuisineTypeLabel}
        onApply={handleApplyFilters}
        onReset={handleResetDraftFilters}
      />
    </PullToRefresh>
  )
}
