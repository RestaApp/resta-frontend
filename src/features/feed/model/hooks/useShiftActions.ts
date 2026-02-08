import { useCallback, useState } from 'react'
import { useShiftApplication } from './useShiftApplication'
import { useAppliedShifts } from './useAppliedShifts'

interface UseShiftActionsReturn {
  appliedShiftsSet: Set<number>
  appliedApplicationsMap: Record<number, number | undefined>
  getApplicationId: (id: number) => number | undefined
  handleApply: (shiftId: number, message?: string) => Promise<void>
  handleCancel: (applicationId: number | null | undefined, shiftId: number) => Promise<void>
  isShiftLoading: (shiftId: number) => boolean
}

export const useShiftActions = (): UseShiftActionsReturn => {
  const { appliedShiftsSet, appliedApplicationsMap, markApplied, unmarkApplied, getApplicationId } = useAppliedShifts()

  const { apply, cancel } = useShiftApplication()

  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set())

  const setLoading = useCallback((id: number, on: boolean) => {
    setLoadingIds(prev => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const handleApply = useCallback(
    async (shiftId: number, message?: string) => {
      setLoading(shiftId, true)
      try {
        const res = await apply(shiftId, message)
        const appId = res?.data?.application_id ?? res?.data?.id
        markApplied(shiftId, appId)
      } finally {
        setLoading(shiftId, false)
      }
    },
    [apply, markApplied, setLoading]
  )

  const handleCancel = useCallback(
    async (applicationId: number | null | undefined, shiftId: number) => {
      setLoading(shiftId, true)
      try {
        await cancel(applicationId)
        unmarkApplied(shiftId)
      } finally {
        setLoading(shiftId, false)
      }
    },
    [cancel, unmarkApplied, setLoading]
  )

  const isShiftLoading = useCallback((shiftId: number) => loadingIds.has(shiftId), [loadingIds])

  return {
    appliedShiftsSet,
    appliedApplicationsMap,
    getApplicationId,
    handleApply,
    handleCancel,
    isShiftLoading,
  }
}
