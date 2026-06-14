import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetUsersQuery } from '@/services/api/usersApi'
import { useGetMyShiftsQuery, useInviteToShiftMutation } from '@/services/api/shiftsApi'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { useLabels } from '@/shared/i18n/hooks'
import { useCities } from '@/shared/lib/hooks/useCities'
import { computeHasMore, usePaginatedFilterState } from '@/shared/lib/hooks/usePaginatedFilterState'
import { useToast } from '@/shared/lib/hooks/useToast'
import { useAppSelector } from '@/store/hooks'
import { selectUserCity } from '@/features/navigation/model/userSlice'
import { useDetailOverlay } from '@/shared/navigation/overlayContextHooks'
import { normalizeVacanciesResponse } from '@/shared/shifts/normalizeShiftsResponse'
import { isInviteableOwnerListing } from '@/shared/shifts/ownerShiftDisplay'
import { getErrorMessage } from '@/shared/utils/getErrorMessage'
import { useUserPositions } from '@/features/navigation/model/hooks/useUserPositions'
import { useUserSpecializations } from '@/features/navigation/model/hooks/useUserSpecializations'
import {
  DEFAULT_EMPLOYEE_CATALOG_FILTERS,
  EMPLOYEES_PER_PAGE,
  resolveEmployeeUserType,
  type EmployeeCatalogFilters,
  type EmployeeCatalogItem,
} from './employeeCatalogTypes'
import { mapEmployeeUsersToItems } from './employeeCatalogMappers'
import {
  formatEmployeeCatalogFiltersForDisplay,
  removeEmployeeCatalogFilter,
  resolveEmployeeCatalogCity,
} from './employeeCatalogFiltersUtils'

export const useEmployeeCatalogModel = () => {
  const { t } = useTranslation()
  const { toast, showToast, hideToast } = useToast()
  const { getEmployeePositionLabel, getSpecializationLabel } = useLabels()
  const { cities, isLoading: isCitiesLoading } = useCities({ enabled: true })
  const userCity = useAppSelector(selectUserCity)
  const { openUserProfile } = useDetailOverlay()

  const defaultFilters = useMemo(
    () => ({
      ...DEFAULT_EMPLOYEE_CATALOG_FILTERS,
      city: userCity?.trim() || '',
    }),
    [userCity]
  )

  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmployee, setInviteEmployee] = useState<EmployeeCatalogItem | null>(null)
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null)
  const [invitingShiftId, setInvitingShiftId] = useState<number | null>(null)

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
    handleOpenFilters,
  } = usePaginatedFilterState<EmployeeCatalogFilters>({
    defaultFilters,
    pageSize: EMPLOYEES_PER_PAGE,
    removeFilter: removeEmployeeCatalogFilter,
  })

  const queryParams = useMemo(() => {
    const city = resolveEmployeeCatalogCity(appliedFilters)
    return {
      user_type: resolveEmployeeUserType(appliedFilters.position),
      city: city || undefined,
      specialization: appliedFilters.specialization || undefined,
      open_to_work: true,
      page: 1,
      per_page: visibleCount,
    }
  }, [appliedFilters, visibleCount])

  const { data, isLoading, isFetching, isError, refetch } = useGetUsersQuery(queryParams)

  const employees = useMemo(() => {
    const apiData = data?.data
    if (!Array.isArray(apiData)) return []
    return mapEmployeeUsersToItems(apiData, t, getEmployeePositionLabel)
  }, [data?.data, getEmployeePositionLabel, t])

  const pagination = data?.pagination || data?.meta
  const hasMore = computeHasMore(pagination, employees.length)

  const activeFilters = useMemo(
    () =>
      formatEmployeeCatalogFiltersForDisplay(appliedFilters, {
        getEmployeePositionLabel,
        getSpecializationLabel,
      }),
    [appliedFilters, getEmployeePositionLabel, getSpecializationLabel]
  )

  const { positions } = useUserPositions({ enabled: isFiltersOpen })
  const { specializations } = useUserSpecializations({
    position: draftFilters.position ?? '',
    enabled: Boolean(draftFilters.position) && isFiltersOpen,
  })

  const { data: myShiftsData } = useGetMyShiftsQuery(undefined, {
    skip: !isInviteOpen,
  })

  const inviteableVacancies = useMemo(() => {
    const shifts = normalizeVacanciesResponse(myShiftsData)
    return shifts.filter(isInviteableOwnerListing)
  }, [myShiftsData])

  const [inviteToShift] = useInviteToShiftMutation()

  const handleLoadMore = useCallback(() => {
    if (isLoading || isFetching || !hasMore) return
    incrementVisibleCount()
  }, [hasMore, incrementVisibleCount, isFetching, isLoading])

  const handleOpenProfile = useCallback(
    (id: number) => {
      setSelectedProfileId(id)
      openUserProfile(id)
    },
    [openUserProfile]
  )

  const handleCloseProfile = useCallback(() => {
    setSelectedProfileId(null)
  }, [])

  const handleOpenInvite = useCallback((employee: EmployeeCatalogItem) => {
    setInviteEmployee(employee)
    setIsInviteOpen(true)
  }, [])

  const handleCloseInvite = useCallback(() => {
    setIsInviteOpen(false)
    setInviteEmployee(null)
    setInvitingShiftId(null)
  }, [])

  const handleInvite = useCallback(
    async (shift: VacancyApiItem) => {
      if (!inviteEmployee || invitingShiftId !== null) return
      try {
        setInvitingShiftId(shift.id)
        await inviteToShift({ shiftId: shift.id, userId: inviteEmployee.id }).unwrap()
        showToast(
          t('venueUi.staff.catalog.inviteSuccess', {
            defaultValue: 'Приглашение отправлено',
          }),
          'success'
        )
        handleCloseInvite()
      } catch (error) {
        showToast(
          getErrorMessage(error) ??
            t('venueUi.staff.catalog.inviteError', {
              defaultValue: 'Не удалось отправить приглашение',
            }),
          'error'
        )
      } finally {
        setInvitingShiftId(null)
      }
    },
    [handleCloseInvite, inviteEmployee, invitingShiftId, inviteToShift, showToast, t]
  )

  return {
    isFiltersOpen,
    setIsFiltersOpen,
    isInviteOpen,
    inviteEmployee,
    handleOpenInvite,
    handleCloseInvite,
    handleInvite,
    invitingShiftId,
    inviteableVacancies,
    isLoading,
    isFetching,
    isError,
    refetch,
    employees,
    employeesCount: employees.length,
    hasMore,
    activeFilters,
    handleLoadMore,
    handleResetFilters,
    handleRemoveFilter,
    draftFilters,
    setDraftFilters,
    handleApplyFilters,
    handleOpenFilters,
    handleResetDraftFilters,
    handleOpenProfile,
    selectedProfileId,
    handleCloseProfile,
    cities,
    isCitiesLoading,
    positions,
    specializations,
    getEmployeePositionLabel,
    getSpecializationLabel,
    toast,
    hideToast,
  }
}
