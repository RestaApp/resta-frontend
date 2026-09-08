import { useCallback, useMemo } from 'react'
import { useGetAppliedShiftsQuery, FULL_LIST_PER_PAGE } from '@/services/api/shiftsApi'
import { selectUserData } from '@/store/slices/userSlice'
import { useAppSelector } from '@/store/hooks'
import { mapRoleFromApi } from '@/shared/utils/roles'
import type { VacanciesResponse } from '@/services/api/shiftsApi'
import { isActiveApplicationStatus } from '@/shared/shifts/applicationStatus'

export interface UseAppliedShiftsReturn {
  appliedShifts: number[]
  appliedShiftsSet: Set<number>
  appliedApplicationsMap: Record<number, number | undefined>
  appliedStatusMap: Record<number, string | undefined>
  getApplicationId: (shiftId: number) => number | undefined
  getApplicationStatus: (shiftId: number) => string | undefined
}

// Источник истины по откликам — серверный ответ getAppliedShifts. Статус заявки
// приходит в my_application и живёт прямо на смене (см. vacancyToShift). После
// apply/cancel/accept/reject этот список целиком инвалидируется тегом AppliedShift
// (page 1, per_page=100 — без накопительного merge), поэтому id, application id и
// статус здесь всегда актуальны сразу после ответа. Лента getVacancies —
// накопительная (infinite merge), её ранние страницы инвалидация освежает не
// всегда, так что статус заявки лучше брать отсюда. Оптимистичных оверрайдов нет.
export const useAppliedShifts = (): UseAppliedShiftsReturn => {
  const userData = useAppSelector(selectUserData)
  const apiRole = mapRoleFromApi(userData?.role)
  const shouldSkipAppliedShifts = apiRole === 'restaurant' || apiRole === 'supplier'

  const { data } = useGetAppliedShiftsQuery(
    { per_page: FULL_LIST_PER_PAGE },
    {
      skip: shouldSkipAppliedShifts,
    }
  )

  const serverItems = useMemo(() => {
    const resp: VacanciesResponse | undefined = data
    return resp?.data ?? []
  }, [data])

  const appliedShifts = useMemo(
    () =>
      serverItems
        .filter(vacancy => isActiveApplicationStatus(vacancy.my_application?.status))
        .map(vacancy => vacancy.id),
    [serverItems]
  )

  const appliedShiftsSet = useMemo(() => new Set(appliedShifts), [appliedShifts])

  const appliedApplicationsMap = useMemo(() => {
    const map: Record<number, number | undefined> = {}
    for (const vacancy of serverItems) {
      map[vacancy.id] = vacancy.my_application?.id
    }
    return map
  }, [serverItems])

  const appliedStatusMap = useMemo(() => {
    const map: Record<number, string | undefined> = {}
    for (const vacancy of serverItems) {
      map[vacancy.id] = vacancy.my_application?.status
    }
    return map
  }, [serverItems])

  const getApplicationId = useCallback(
    (shiftId: number) => appliedApplicationsMap[shiftId],
    [appliedApplicationsMap]
  )

  const getApplicationStatus = useCallback(
    (shiftId: number) => appliedStatusMap[shiftId],
    [appliedStatusMap]
  )

  return {
    appliedShifts,
    appliedShiftsSet,
    appliedApplicationsMap,
    appliedStatusMap,
    getApplicationId,
    getApplicationStatus,
  }
}
