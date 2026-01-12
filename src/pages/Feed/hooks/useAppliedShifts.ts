/**
 * Хук для работы с поданными заявками
 */

import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { useGetAppliedShiftsQuery } from '@/services/api/shiftsApi'

export interface UseAppliedShiftsReturn {
  appliedShifts: number[]
  appliedShiftsSet: Set<number>
  appliedApplicationsMap: Record<number, number | undefined>
  markApplied: (id: number, applicationId?: number) => void
  unmarkApplied: (id: number) => void
  getApplicationId: (id: number) => number | undefined
  setAppliedShifts: Dispatch<SetStateAction<number[]>>
}

export const useAppliedShifts = (): UseAppliedShiftsReturn => {
  const [appliedShifts, setAppliedShifts] = useState<number[]>([])
  const [appliedApplicationsMap, setAppliedApplicationsMap] = useState<Record<number, number | undefined>>({})
  const { data: appliedShiftsResponse } = useGetAppliedShiftsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })

  useEffect(() => {
    if (appliedShiftsResponse?.data) {
      const appliedIds = appliedShiftsResponse.data.map(vacancy => vacancy.id)
      setAppliedShifts(appliedIds)
      const map: Record<number, number | undefined> = {}
      appliedShiftsResponse.data.forEach(vacancy => {
        map[vacancy.id] = (vacancy as any).my_application?.id
      })
      setAppliedApplicationsMap(map)
    }
  }, [appliedShiftsResponse])

  const appliedShiftsSet = useMemo(() => new Set(appliedShifts), [appliedShifts])

  const markApplied = useCallback((id: number, applicationId?: number) => {
    setAppliedShifts(prev => (prev.includes(id) ? prev : [...prev, id]))
    if (applicationId !== undefined) {
      setAppliedApplicationsMap(prev => ({ ...prev, [id]: applicationId }))
    }
  }, [])

  const unmarkApplied = useCallback((id: number) => {
    setAppliedShifts(prev => prev.filter(shiftId => shiftId !== id))
    setAppliedApplicationsMap(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const getApplicationId = useCallback((id: number) => appliedApplicationsMap[id], [appliedApplicationsMap])

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
