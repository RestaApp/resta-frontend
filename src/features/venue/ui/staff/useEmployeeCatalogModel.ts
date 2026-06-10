import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetUsersQuery } from '@/services/api/usersApi'
import {
  useGetMyShiftsQuery,
  useInviteToShiftMutation,
} from '@/services/api/shiftsApi'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import { useLabels } from '@/shared/i18n/hooks'
import { useCities } from '@/shared/lib/hooks/useCities'
import { useToast } from '@/shared/lib/hooks/useToast'
import { useAppSelector } from '@/store/hooks'
import { selectUserCity } from '@/features/navigation/model/userSlice'
import { APP_EVENTS, onAppEvent } from '@/shared/utils/appEvents'
import { useDetailOverlay } from '@/shared/navigation/overlayContextHooks'
import { normalizeVacanciesResponse } from '@/shared/shifts/normalizeShiftsResponse'
import { getOwnerShiftListingStatus } from '@/shared/shifts/ownerShiftDisplay'
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

  const [isCatalogOpen, setIsCatalogOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmployee, setInviteEmployee] = useState<EmployeeCatalogItem | null>(null)
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null)
  const [appliedFilters, setAppliedFilters] = useState<EmployeeCatalogFilters>(defaultFilters)
  const [draftFilters, setDraftFilters] = useState<EmployeeCatalogFilters>(defaultFilters)
  const [visibleCount, setVisibleCount] = useState(EMPLOYEES_PER_PAGE)
  const [invitingShiftId, setInvitingShiftId] = useState<number | null>(null)

  const appliedFiltersRef = useRef(appliedFilters)
  useEffect(() => {
    appliedFiltersRef.current = appliedFilters
  }, [appliedFilters])

  useEffect(() => {
    return onAppEvent(APP_EVENTS.OPEN_STAFF_EMPLOYEE_CATALOG, () => {
      setDraftFilters(appliedFiltersRef.current)
      setIsCatalogOpen(true)
    })
  }, [])

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

  const { data, isLoading, isFetching, isError, refetch } = useGetUsersQuery(queryParams, {
    skip: !isCatalogOpen,
  })

  const employees = useMemo(() => {
    const apiData = data?.data
    if (!Array.isArray(apiData)) return []
    return mapEmployeeUsersToItems(apiData, t, getEmployeePositionLabel)
  }, [data?.data, getEmployeePositionLabel, t])

  const pagination = data?.pagination || data?.meta

  const hasMore = (() => {
    if (!pagination) return false
    if (typeof pagination.total_count === 'number') {
      return employees.length < pagination.total_count
    }
    if (pagination.next_page !== undefined && pagination.next_page !== null) return true
    if (pagination.current_page && pagination.total_pages) {
      return pagination.current_page < pagination.total_pages
    }
    return false
  })()

  const activeFilters = useMemo(
    () =>
      formatEmployeeCatalogFiltersForDisplay(appliedFilters, {
        getEmployeePositionLabel,
        getSpecializationLabel,
      }),
    [appliedFilters, getEmployeePositionLabel, getSpecializationLabel, t]
  )

  const { positions } = useUserPositions({ enabled: isFiltersOpen || isCatalogOpen })
  const { specializations } = useUserSpecializations({
    position: draftFilters.position ?? '',
    enabled: Boolean(draftFilters.position) && (isFiltersOpen || isCatalogOpen),
  })

  const { data: myShiftsData } = useGetMyShiftsQuery(undefined, {
    skip: !isInviteOpen,
  })

  const inviteableVacancies = useMemo(() => {
    const shifts = normalizeVacanciesResponse(myShiftsData)
    return shifts.filter(
      shift =>
        getOwnerShiftListingStatus(shift) === 'open' || getOwnerShiftListingStatus(shift) === 'urgent'
    )
  }, [myShiftsData])

  const [inviteToShift] = useInviteToShiftMutation()

  const handleLoadMore = useCallback(() => {
    if (isLoading || isFetching || !hasMore) return
    setVisibleCount(prev => prev + EMPLOYEES_PER_PAGE)
  }, [hasMore, isFetching, isLoading])

  const handleResetFilters = useCallback(() => {
    const next = { ...defaultFilters, city: '' }
    setAppliedFilters(next)
    setDraftFilters(next)
    setVisibleCount(EMPLOYEES_PER_PAGE)
  }, [defaultFilters])

  const handleRemoveFilter = useCallback(
    (filterId: string) => {
      const next = removeEmployeeCatalogFilter(appliedFilters, filterId)
      setAppliedFilters(next)
      setDraftFilters(next)
      setVisibleCount(EMPLOYEES_PER_PAGE)
    },
    [appliedFilters]
  )

  const handleResetDraftFilters = useCallback(() => {
    setDraftFilters({ ...defaultFilters, city: '' })
  }, [defaultFilters])

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(draftFilters)
    setVisibleCount(EMPLOYEES_PER_PAGE)
    setIsFiltersOpen(false)
  }, [draftFilters])

  const handleOpenFilters = useCallback(() => {
    setDraftFilters(appliedFilters)
    setIsFiltersOpen(true)
  }, [appliedFilters])

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

  const handleCatalogOpenChange = useCallback((open: boolean) => {
    setIsCatalogOpen(open)
    if (!open) {
      setIsFiltersOpen(false)
      handleCloseInvite()
      setSelectedProfileId(null)
    }
  }, [handleCloseInvite])

  return {
    isCatalogOpen,
    setIsCatalogOpen: handleCatalogOpenChange,
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
