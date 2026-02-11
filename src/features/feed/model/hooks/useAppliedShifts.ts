import { useCallback, useMemo, useState } from 'react'
import { useGetAppliedShiftsQuery } from '@/services/api/shiftsApi'
import type { VacanciesResponse } from '@/services/api/shiftsApi'

export interface UseAppliedShiftsReturn {
  appliedShifts: number[]
  appliedShiftsSet: Set<number>
  appliedApplicationsMap: Record<number, number | undefined>
  markApplied: (shiftId: number, applicationId?: number) => void
  unmarkApplied: (shiftId: number) => void
  getApplicationId: (shiftId: number) => number | undefined
}

export const useAppliedShifts = (): UseAppliedShiftsReturn => {
  const { data } = useGetAppliedShiftsQuery(undefined, { refetchOnMountOrArgChange: true })

  const serverItems = useMemo(() => {
    const resp: VacanciesResponse | undefined = data
    return resp?.data ?? []
  }, [data])

  const serverAppliedIds = useMemo(() => serverItems.map(v => v.id), [serverItems])

  const serverApplicationsMap = useMemo(() => {
    const map: Record<number, number | undefined> = {}
    for (const v of serverItems) {
      map[v.id] = v.my_application?.id
    }
    return map
  }, [serverItems])

  const [locallyApplied, setLocallyApplied] = useState<Record<number, true>>({})
  const [locallyUnapplied, setLocallyUnapplied] = useState<Record<number, true>>({})
  const [applicationIdOverrides, setApplicationIdOverrides] = useState<
    Record<number, number | undefined>
  >({})

  const appliedShiftsSet = useMemo(() => {
    const set = new Set<number>()
    for (const id of serverAppliedIds) {
      if (!locallyUnapplied[id]) set.add(id)
    }
    for (const idStr of Object.keys(locallyApplied)) {
      set.add(Number(idStr))
    }
    return set
  }, [serverAppliedIds, locallyApplied, locallyUnapplied])

  const appliedShifts = useMemo(() => Array.from(appliedShiftsSet), [appliedShiftsSet])

  const appliedApplicationsMap = useMemo(() => {
    const next: Record<number, number | undefined> = { ...serverApplicationsMap }
    for (const idStr of Object.keys(locallyUnapplied)) {
      delete next[Number(idStr)]
    }
    for (const [idStr, appId] of Object.entries(applicationIdOverrides)) {
      next[Number(idStr)] = appId
    }
    return next
  }, [applicationIdOverrides, locallyUnapplied, serverApplicationsMap])

  const markApplied = useCallback((shiftId: number, applicationId?: number) => {
    setLocallyApplied(prev => ({ ...prev, [shiftId]: true }))
    setLocallyUnapplied(prev => {
      if (!prev[shiftId]) return prev
      const next = { ...prev }
      delete next[shiftId]
      return next
    })
    if (applicationId !== undefined) {
      setApplicationIdOverrides(prev => ({ ...prev, [shiftId]: applicationId }))
    }
  }, [])

  const unmarkApplied = useCallback((shiftId: number) => {
    setLocallyUnapplied(prev => ({ ...prev, [shiftId]: true }))
    setLocallyApplied(prev => {
      if (!prev[shiftId]) return prev
      const next = { ...prev }
      delete next[shiftId]
      return next
    })
    setApplicationIdOverrides(prev => {
      if (!(shiftId in prev)) return prev
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
  }
}
