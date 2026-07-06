import { useCallback, useMemo } from 'react'
import { useGetAppliedShiftsQuery, FULL_LIST_PER_PAGE } from '@/services/api/shiftsApi'
import { selectUserData } from '@/store/slices/userSlice'
import { useAppSelector } from '@/store/hooks'
import { mapRoleFromApi } from '@/shared/utils/roles'
import type { VacanciesResponse } from '@/services/api/shiftsApi'

export interface UseAppliedShiftsReturn {
  appliedShifts: number[]
  appliedShiftsSet: Set<number>
  appliedApplicationsMap: Record<number, number | undefined>
  getApplicationId: (shiftId: number) => number | undefined
}

// Источник истины по откликам — серверный ответ getAppliedShifts. Статус заявки
// приходит в my_application и живёт прямо на смене (см. vacancyToShift), поэтому
// здесь только id откликнутых смен и id заявок. После apply/cancel список
// обновляется инвалидацией тега AppliedShift — оптимистичных оверрайдов нет.
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

  const appliedShifts = useMemo(() => serverItems.map(vacancy => vacancy.id), [serverItems])

  const appliedShiftsSet = useMemo(() => new Set(appliedShifts), [appliedShifts])

  const appliedApplicationsMap = useMemo(() => {
    const map: Record<number, number | undefined> = {}
    for (const vacancy of serverItems) {
      map[vacancy.id] = vacancy.my_application?.id
    }
    return map
  }, [serverItems])

  const getApplicationId = useCallback(
    (shiftId: number) => appliedApplicationsMap[shiftId],
    [appliedApplicationsMap]
  )

  return {
    appliedShifts,
    appliedShiftsSet,
    appliedApplicationsMap,
    getApplicationId,
  }
}
