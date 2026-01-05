/**
 * Хук для работы с поданными заявками
 */

import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { useGetAppliedShiftsQuery } from '@/services/api/shiftsApi'

export interface UseAppliedShiftsReturn {
  appliedShifts: number[]
  appliedShiftsSet: Set<number>
  markApplied: (id: number) => void
  unmarkApplied: (id: number) => void
  setAppliedShifts: Dispatch<SetStateAction<number[]>>
}

export const useAppliedShifts = (): UseAppliedShiftsReturn => {
  const [appliedShifts, setAppliedShifts] = useState<number[]>([])
  const { data: appliedShiftsResponse } = useGetAppliedShiftsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })

  useEffect(() => {
    if (appliedShiftsResponse?.data) {
      const appliedIds = appliedShiftsResponse.data.map(vacancy => vacancy.id)
      setAppliedShifts(appliedIds)
    }
  }, [appliedShiftsResponse])

  const appliedShiftsSet = useMemo(() => new Set(appliedShifts), [appliedShifts])

  const markApplied = useCallback((id: number) => {
    setAppliedShifts(prev => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  const unmarkApplied = useCallback((id: number) => {
    setAppliedShifts(prev => prev.filter(shiftId => shiftId !== id))
  }, [])

  return {
    appliedShifts,
    appliedShiftsSet,
    markApplied,
    unmarkApplied,
    setAppliedShifts,
  }
}
