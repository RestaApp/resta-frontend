import { useCallback, useState } from 'react'
import { useShiftApplication } from '@/shared/shifts/useShiftApplication'
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
  const { appliedShiftsSet, appliedApplicationsMap, getApplicationId } = useAppliedShifts()

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

  // После успешного apply/cancel список откликов и смена обновятся сами через
  // инвалидацию тегов RTK Query (AppliedShift/Shift) — статус берём из ответа.
  const handleApply = useCallback(
    async (shiftId: number, message?: string) => {
      setLoading(shiftId, true)
      try {
        await apply(shiftId, message)
      } finally {
        setLoading(shiftId, false)
      }
    },
    [apply, setLoading]
  )

  const handleCancel = useCallback(
    async (applicationId: number | null | undefined, shiftId: number) => {
      setLoading(shiftId, true)
      try {
        await cancel(applicationId)
      } finally {
        setLoading(shiftId, false)
      }
    },
    [cancel, setLoading]
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
