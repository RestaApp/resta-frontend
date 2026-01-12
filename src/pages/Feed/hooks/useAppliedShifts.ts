import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { useGetAppliedShiftsQuery } from '@/services/api/shiftsApi'
import type { VacanciesResponse } from '@/services/api/shiftsApi'

export interface UseAppliedShiftsReturn {
  appliedShifts: number[]
  appliedShiftsSet: Set<number>
  appliedApplicationsMap: Record<number, number | undefined>
  markApplied: (shiftId: number, applicationId?: number) => void
  unmarkApplied: (shiftId: number) => void
  getApplicationId: (shiftId: number) => number | undefined
  setAppliedShifts: Dispatch<SetStateAction<number[]>>
}

export const useAppliedShifts = (): UseAppliedShiftsReturn => {
  const [appliedShifts, setAppliedShifts] = useState<number[]>([])
  const [appliedApplicationsMap, setAppliedApplicationsMap] = useState<Record<number, number | undefined>>({})

  const { data } = useGetAppliedShiftsQuery(undefined, { refetchOnMountOrArgChange: true })

  useEffect(() => {
    const resp: VacanciesResponse | undefined = data
    if (!resp?.data?.length) return

    const ids = resp.data.map(v => v.id)
    setAppliedShifts(ids)

    const map: Record<number, number | undefined> = {}
    for (const v of resp.data) {
      map[v.id] = v.my_application?.id
    }
    setAppliedApplicationsMap(map)
  }, [data])

  const appliedShiftsSet = useMemo(() => new Set(appliedShifts), [appliedShifts])

  const markApplied = useCallback((shiftId: number, applicationId?: number) => {
    setAppliedShifts(prev => (prev.includes(shiftId) ? prev : [...prev, shiftId]))
    if (applicationId !== undefined) {
      setAppliedApplicationsMap(prev => ({ ...prev, [shiftId]: applicationId }))
    }
  }, [])

  const unmarkApplied = useCallback((shiftId: number) => {
    setAppliedShifts(prev => prev.filter(id => id !== shiftId))
    setAppliedApplicationsMap(prev => {
      const next = { ...prev }
      delete next[shiftId]
      return next
    })
  }, [])

  const getApplicationId = useCallback(
    (shiftId: number) => appliedApplicationsMap[shiftId],
    [appliedApplicationsMap]
  )

  return {
    appliedShifts,
    appliedShiftsSet,
    appliedApplicationsMap,
    markApplied,
    unmarkApplied,
    getApplicationId,
    setAppliedShifts,
  }
}
