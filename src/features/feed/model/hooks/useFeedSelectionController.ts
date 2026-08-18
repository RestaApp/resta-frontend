import { useCallback, useMemo } from 'react'
import { vacancyToShift } from '@/shared/shifts/mapping'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { Shift } from '@/shared/shifts/types'
import type { UseVacanciesInfiniteListReturn } from '../hooks/useVacanciesInfiniteList'

interface UseFeedSelectionControllerParams {
  activeList: UseVacanciesInfiniteListReturn
  hotVacancies: VacancyApiItem[]
  selectedShiftId: number | null
  applyCoverTargetShiftId: number | null
  applicationSuccessShiftId: number | null
  appliedShiftsSet: Set<number>
  appliedApplicationsMap: Record<number, number | undefined>
  appliedStatusMap: Record<number, string | undefined>
  getApplicationId: (id: number) => number | undefined
}

export const useFeedSelectionController = ({
  activeList,
  hotVacancies,
  selectedShiftId,
  applyCoverTargetShiftId,
  applicationSuccessShiftId,
  appliedShiftsSet,
  appliedApplicationsMap,
  appliedStatusMap,
  getApplicationId,
}: UseFeedSelectionControllerParams) => {
  const hotVacanciesById = useMemo(() => {
    const map = new Map<number, VacancyApiItem>()
    for (const vacancy of hotVacancies) {
      map.set(vacancy.id, vacancy)
    }
    return map
  }, [hotVacancies])

  const shiftsById = useMemo(() => {
    const map = new Map<number, Shift>()
    for (const shift of activeList.items) {
      map.set(shift.id, shift)
    }
    return map
  }, [activeList.items])

  const resolveVacancy = useCallback(
    (id: number | null) => {
      if (!id) return null
      const vacancy = activeList.vacanciesMap.get(id) || hotVacanciesById.get(id) || null
      const applicationStatus = appliedStatusMap[id]
      const applicationId = appliedApplicationsMap[id]
      if (!vacancy || !applicationStatus || !applicationId) return vacancy

      return {
        ...vacancy,
        my_application: {
          ...vacancy.my_application,
          id: applicationId,
          status: applicationStatus,
        },
      }
    },
    [activeList.vacanciesMap, appliedApplicationsMap, appliedStatusMap, hotVacanciesById]
  )

  const resolveShift = useCallback(
    (id: number | null) => {
      if (!id) return null
      const fromItems = shiftsById.get(id)
      if (fromItems) {
        return {
          ...fromItems,
          applicationId: appliedApplicationsMap[id] ?? fromItems.applicationId,
          applicationStatus: appliedStatusMap[id] ?? fromItems.applicationStatus,
        }
      }
      const vacancy = resolveVacancy(id)
      return vacancy ? vacancyToShift(vacancy) : null
    },
    [appliedApplicationsMap, appliedStatusMap, resolveVacancy, shiftsById]
  )

  const selectedVacancy = useMemo(
    () => resolveVacancy(selectedShiftId),
    [resolveVacancy, selectedShiftId]
  )

  const selectedShift = useMemo(
    () => resolveShift(selectedShiftId),
    [resolveShift, selectedShiftId]
  )

  const applyCoverShift = useMemo(
    () => resolveShift(applyCoverTargetShiftId),
    [applyCoverTargetShiftId, resolveShift]
  )

  const applicationSuccessShift = useMemo(() => {
    const resolved = resolveShift(applicationSuccessShiftId)
    return resolved ?? selectedShift
  }, [applicationSuccessShiftId, resolveShift, selectedShift])

  const isApplied = useCallback((id: number) => appliedShiftsSet.has(id), [appliedShiftsSet])

  const getApplicationIdStable = useCallback(
    (id: number) => appliedApplicationsMap[id] ?? getApplicationId(id),
    [appliedApplicationsMap, getApplicationId]
  )

  // appliedStatusMap (из getAppliedShifts) — приоритетный источник: он целиком
  // рефетчится после apply/cancel/accept/reject, тогда как my_application в ленте
  // getVacancies на ранних (накопленных) страницах может остаться устаревшим.
  const getApplicationStatus = useCallback(
    (id: number) =>
      appliedStatusMap[id] ??
      activeList.vacanciesMap.get(id)?.my_application?.status ??
      hotVacanciesById.get(id)?.my_application?.status ??
      null,
    [appliedStatusMap, activeList.vacanciesMap, hotVacanciesById]
  )

  return {
    selectedVacancy,
    selectedShift,
    applyCoverShift,
    applicationSuccessShift,
    isApplied,
    getApplicationId: getApplicationIdStable,
    getApplicationStatus,
  }
}
