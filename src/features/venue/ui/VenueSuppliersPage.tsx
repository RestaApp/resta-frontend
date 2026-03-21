import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { mapSupplierUsersToItems } from './suppliers/mappers'
import { UserProfileDrawer } from '@/features/profile/ui/UserProfileDrawer'
import {
  DEFAULT_SERVICE_CATEGORY_OPTIONS,
  DEFAULT_SUPPLIER_FILTERS,
  DEFAULT_SUPPLIER_TYPES,
  SUPPLIERS_PER_PAGE,
  SUPPLIER_TYPES_BY_CATEGORY,
  type SupplierApiUser,
  type SupplierFilters,
  getValidSupplierTypesForCategory,
  isSupplierCategory,
} from './suppliers/types'
import type { UserData } from '@/services/api/authApi'
import type { SupplierItem } from './suppliers/types'

type RestaurantProfile = {
  restaurant_format?: string | null
  format?: string | null
  cuisine_types?: string[] | null
}

type RestaurantApiUser = UserData & {
  restaurant_profile?: RestaurantProfile | null
  restaurant_profile_attributes?: RestaurantProfile | null
}

const getRestaurantProfile = (item: RestaurantApiUser) =>
  item.restaurant_profile ?? item.restaurant_profile_attributes ?? null

const getUserPhotoUrl = (item: UserData): string | null => {
  const raw = item.photo_url ?? item.profile_photo_url
  if (typeof raw !== 'string') return null
  const normalized = raw.trim()
  return normalized.length > 0 ? normalized : null
}

const mapRestaurantUsersToItems = (
  users: RestaurantApiUser[],
  t: ReturnType<typeof useTranslation>['t'],
  getRestaurantFormatLabel: (value: string) => string
): SupplierItem[] => {
  return users.map(item => {
    const profile = getRestaurantProfile(item)
    const restaurantFormatCode = profile?.restaurant_format ?? profile?.format ?? null
    const cuisines = Array.isArray(profile?.cuisine_types)
      ? profile.cuisine_types.filter(Boolean)
      : []
    const formatLabel = restaurantFormatCode
      ? getRestaurantFormatLabel(restaurantFormatCode)
      : t('common.notSpecified', { defaultValue: 'Не указано' })
    const fromParts = [item.name, item.last_name].filter(Boolean).join(' ').trim()

    return {
      id: item.id,
      name:
        item.full_name ||
        fromParts ||
        t('venueUi.suppliers.unknownName', { defaultValue: `Заведение #${item.id}` }),
      bio: item.bio ?? null,
      city: item.city?.trim() || '',
      location: item.location?.trim() || '',
      email: item.email?.trim() || '',
      phone: item.phone?.trim() || '',
      averageRating: Number.isFinite(item.average_rating) ? item.average_rating : 0,
      totalReviews: Number.isFinite(item.total_reviews) ? item.total_reviews : 0,
      username: item.username || null,
      photoUrl: getUserPhotoUrl(item),
      supplierType: formatLabel,
      supplierCategory: formatLabel,
      serviceCategories: cuisines,
      deliveryAvailable: null,
      status: item.active ? 'active' : 'paused',
    }
  })
}

export function VenueSuppliersPage() {
  const { t } = useTranslation()
  const { getSupplierTypeLabel, getRestaurantFormatLabel } = useLabels()
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

  useEffect(() => {
    if (isSupplierRole) return
    const handler = () => {
      setDraftFilters(appliedFilters)
      setIsFiltersOpen(true)
    }

    window.addEventListener('openSuppliersFilters', handler)
    return () => window.removeEventListener('openSuppliersFilters', handler)
  }, [appliedFilters, isSupplierRole])

  const queryParams = useMemo<GetUsersParams>(() => {
    if (isSupplierRole) {
      return {
        user_type: 'restaurant',
        city: (defaultFilters.city || '').trim() || undefined,
        page: 1,
        per_page: visibleCount,
      }
    }

    const city = (appliedFilters.city.trim() || defaultFilters.city).trim()
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
  }, [appliedFilters, defaultFilters.city, isSupplierRole, visibleCount])

  const { data, isLoading, isFetching, isError, refetch } = useGetUsersQuery(queryParams)

  const supplierUsers = useMemo<SupplierApiUser[]>(() => {
    const apiData = data?.data
    return Array.isArray(apiData) ? (apiData as SupplierApiUser[]) : []
  }, [data?.data])

  const restaurantUsers = useMemo<RestaurantApiUser[]>(() => {
    const apiData = data?.data
    return Array.isArray(apiData) ? (apiData as RestaurantApiUser[]) : []
  }, [data?.data])

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

  const list = useMemo(
    () => (onlyActive ? suppliers.filter(item => item.status === 'active') : suppliers),
    [onlyActive, suppliers]
  )

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

  const hasActiveApiFilters = useMemo(() => {
    if (isSupplierRole) return Boolean((defaultFilters.city || '').trim())
    const city = (appliedFilters.city.trim() || defaultFilters.city).trim()
    const validSupplierTypes = appliedFilters.supplierType
      ? getValidSupplierTypesForCategory(
          appliedFilters.supplierType,
          appliedFilters.serviceCategories
        )
      : []

    return (
      Boolean(city) ||
      Boolean(appliedFilters.supplierType) ||
      validSupplierTypes.length > 0 ||
      appliedFilters.delivery !== 'all'
    )
  }, [appliedFilters, defaultFilters.city, isSupplierRole])

  const activeFiltersList = useMemo(() => {
    const result: string[] = []

    if (isSupplierRole) {
      const city = (defaultFilters.city || '').trim()
      if (city) result.push(city)
      return result
    }

    const city = (appliedFilters.city.trim() || defaultFilters.city).trim()
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
  }, [appliedFilters, defaultFilters.city, getSupplierTypeLabel, isSupplierRole, t])

  const handleLoadMore = useCallback(() => {
    if (isLoading || isFetching || !hasMore) return
    setVisibleCount(prev => prev + SUPPLIERS_PER_PAGE)
  }, [hasMore, isFetching, isLoading])

  const handleResetFilters = useCallback(() => {
    if (isSupplierRole) return
    setAppliedFilters(defaultFilters)
    setDraftFilters(defaultFilters)
    setVisibleCount(SUPPLIERS_PER_PAGE)
  }, [defaultFilters, isSupplierRole])

  const handleResetDraftFilters = useCallback(() => {
    if (isSupplierRole) return
    setDraftFilters(defaultFilters)
  }, [defaultFilters, isSupplierRole])

  const handleApplyFilters = useCallback(() => {
    if (isSupplierRole) return
    setAppliedFilters(draftFilters)
    setVisibleCount(SUPPLIERS_PER_PAGE)
    setIsFiltersOpen(false)
  }, [draftFilters, isSupplierRole])

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
        hasActiveApiFilters={hasActiveApiFilters}
        activeFiltersList={activeFiltersList}
        onlyActive={onlyActive}
        onToggleOnlyActive={() => setOnlyActive(v => !v)}
        onResetFilters={handleResetFilters}
        list={list}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        onOpenDetails={id => {
          if (isSupplierRole) {
            setSelectedRestaurantId(id)
            return
          }
          setSelectedSupplierId(id)
        }}
      />

      {isSupplierRole ? (
        <UserProfileDrawer
          userId={selectedRestaurant?.id ?? null}
          open={selectedRestaurantId !== null}
          onClose={() => setSelectedRestaurantId(null)}
        />
      ) : (
        <>
          <SupplierDetailsScreen
            supplier={selectedSupplier}
            isOpen={selectedSupplierId !== null}
            onClose={() => setSelectedSupplierId(null)}
          />

          <VenueSuppliersFiltersDrawer
            open={isFiltersOpen}
            onOpenChange={setIsFiltersOpen}
            draftFilters={draftFilters}
            setDraftFilters={setDraftFilters}
            supplierTypeOptions={supplierTypeOptions}
            serviceCategoryOptions={serviceCategoryOptions}
            cities={cities}
            isCitiesLoading={isCitiesLoading}
            getSupplierTypeLabel={getSupplierTypeLabel}
            onApply={handleApplyFilters}
            onReset={handleResetDraftFilters}
          />
        </>
      )}
    </PullToRefresh>
  )
}
