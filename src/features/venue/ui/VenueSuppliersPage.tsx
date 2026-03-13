import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetUsersQuery, type GetUsersParams } from '@/services/api/usersApi'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { useLabels } from '@/shared/i18n/hooks'
import { useCities } from '@/hooks/useCities'
import { SupplierDetailsScreen } from '@/components/ui/shift-details-screen/SupplierDetailsScreen'
import { useAppSelector } from '@/store/hooks'
import { selectUserCity } from '@/features/navigation/model/userSlice'
import { VenueSuppliersFiltersDrawer } from './suppliers/VenueSuppliersFiltersDrawer'
import { VenueSuppliersList } from './suppliers/VenueSuppliersList'
import { mapSupplierUsersToItems } from './suppliers/mappers'
import {
  DEFAULT_SERVICE_CATEGORY_OPTIONS,
  DEFAULT_SUPPLIER_FILTERS,
  DEFAULT_SUPPLIER_TYPES,
  SUPPLIERS_PER_PAGE,
  type SupplierApiUser,
  type SupplierFilters,
} from './suppliers/types'

export function VenueSuppliersPage() {
  const { t } = useTranslation()
  const { getSupplierTypeLabel } = useLabels()
  const { cities, isLoading: isCitiesLoading } = useCities({ enabled: true })
  const userCity = useAppSelector(selectUserCity)

  const defaultFilters = useMemo(
    () => ({
      ...DEFAULT_SUPPLIER_FILTERS,
      city: userCity?.trim() || '',
    }),
    [userCity]
  )

  const [onlyActive, setOnlyActive] = useState(false)
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<SupplierFilters>(defaultFilters)
  const [draftFilters, setDraftFilters] = useState<SupplierFilters>(defaultFilters)
  const [visibleCount, setVisibleCount] = useState(SUPPLIERS_PER_PAGE)

  useEffect(() => {
    if (!defaultFilters.city) return

    setAppliedFilters(prev => (prev.city.trim() ? prev : { ...prev, city: defaultFilters.city }))
    setDraftFilters(prev => (prev.city.trim() ? prev : { ...prev, city: defaultFilters.city }))
  }, [defaultFilters.city])

  useEffect(() => {
    const handler = () => {
      setDraftFilters(appliedFilters)
      setIsFiltersOpen(true)
    }

    window.addEventListener('openSuppliersFilters', handler)
    return () => window.removeEventListener('openSuppliersFilters', handler)
  }, [appliedFilters])

  useEffect(() => {
    setVisibleCount(SUPPLIERS_PER_PAGE)
  }, [appliedFilters])

  const queryParams = useMemo<GetUsersParams>(() => {
    const city = appliedFilters.city.trim()
    const supplierType = appliedFilters.supplierType || undefined
    const supplierTypes =
      !supplierType && appliedFilters.serviceCategories.length > 0
        ? appliedFilters.serviceCategories.join(',')
        : undefined

    return {
      user_type: 'supplier',
      city: city || undefined,
      supplier_category: supplierType,
      supplier_types: supplierTypes,
      delivery_available:
        appliedFilters.delivery === 'all' ? undefined : appliedFilters.delivery === 'yes',
      page: 1,
      per_page: visibleCount,
    }
  }, [appliedFilters, visibleCount])

  const { data, isLoading, isFetching, isError, refetch } = useGetUsersQuery(queryParams)

  const supplierUsers = useMemo<SupplierApiUser[]>(() => {
    const apiData = data?.data
    return Array.isArray(apiData) ? (apiData as SupplierApiUser[]) : []
  }, [data?.data])

  const suppliers = useMemo(
    () => mapSupplierUsersToItems(supplierUsers, t, getSupplierTypeLabel),
    [getSupplierTypeLabel, supplierUsers, t]
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
  }, [supplierUsers])

  const serviceCategoryOptions = useMemo(() => {
    const fromApi = supplierUsers.flatMap(item => {
      const categories =
        item.supplier_profile?.supplier_types ?? item.supplier_profile_attributes?.supplier_types
      return Array.isArray(categories) ? categories : []
    })

    return Array.from(new Set([...DEFAULT_SERVICE_CATEGORY_OPTIONS, ...fromApi]))
  }, [supplierUsers])

  const hasActiveApiFilters = useMemo(() => {
    return (
      Boolean(appliedFilters.city.trim()) ||
      Boolean(appliedFilters.supplierType) ||
      appliedFilters.serviceCategories.length > 0 ||
      appliedFilters.delivery !== 'all'
    )
  }, [appliedFilters])

  const activeFiltersList = useMemo(() => {
    const result: string[] = []

    const city = appliedFilters.city.trim()
    if (city) result.push(city)

    if (appliedFilters.supplierType) {
      result.push(getSupplierTypeLabel(appliedFilters.supplierType))
    }

    if (appliedFilters.serviceCategories.length > 0) {
      result.push(
        ...appliedFilters.serviceCategories.map(category => getSupplierTypeLabel(category))
      )
    }

    if (appliedFilters.delivery === 'yes') {
      result.push(t('venueUi.suppliers.filters.deliveryYes', { defaultValue: 'С доставкой' }))
    } else if (appliedFilters.delivery === 'no') {
      result.push(t('venueUi.suppliers.filters.deliveryNo', { defaultValue: 'Без доставки' }))
    }

    return result
  }, [appliedFilters, getSupplierTypeLabel, t])

  const handleLoadMore = useCallback(() => {
    if (isLoading || isFetching || !hasMore) return
    setVisibleCount(prev => prev + SUPPLIERS_PER_PAGE)
  }, [hasMore, isFetching, isLoading])

  const handleResetFilters = useCallback(() => {
    setAppliedFilters(defaultFilters)
    setDraftFilters(defaultFilters)
  }, [defaultFilters])

  const handleResetDraftFilters = useCallback(() => {
    setDraftFilters(defaultFilters)
  }, [defaultFilters])

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(draftFilters)
    setIsFiltersOpen(false)
  }, [draftFilters])

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
        onOpenDetails={setSelectedSupplierId}
      />

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
    </PullToRefresh>
  )
}
