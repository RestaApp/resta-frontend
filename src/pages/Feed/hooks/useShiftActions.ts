import { useCallback, useState } from 'react'
import { useShiftApplication } from './useShiftApplication'
import { useAppliedShifts } from './useAppliedShifts'

interface UseShiftActionsReturn {
  appliedShifts: number[]
  appliedShiftsSet: Set<number>
  appliedApplicationsMap: Record<number, number | undefined>
  getApplicationId: (id: number) => number | undefined
  handleApply: (shiftId: number) => Promise<void>
  handleCancel: (applicationId: number | null | undefined, shiftId: number) => Promise<void>
  isShiftLoading: (shiftId: number) => boolean
}

export const useShiftActions = (): UseShiftActionsReturn => {
  const { appliedShifts, appliedShiftsSet, appliedApplicationsMap, markApplied, unmarkApplied, getApplicationId } = useAppliedShifts()
  const { apply, cancel } = useShiftApplication({
    onSuccess: () => {
      // Не закрываем детальный экран при отклике с карточки
    },
  })
  const [loadingShiftIds, setLoadingShiftIds] = useState<Set<number>>(new Set())

  const setShiftLoading = useCallback((shiftId: number, isLoading: boolean) => {
    setLoadingShiftIds(prev => {
      const next = new Set(prev)
      if (isLoading) {
        next.add(shiftId)
      } else {
        next.delete(shiftId)
      }
      return next
    })
  }, [])

  const handleApply = useCallback(
    async (shiftId: number) => {
      setShiftLoading(shiftId, true)
      try {
        const result = await apply(shiftId)
        const applicationId = result?.data?.application_id
        markApplied(shiftId, applicationId)
      } catch {
        // Ошибка уже обработана в хуке
      } finally {
        setShiftLoading(shiftId, false)
      }
    },
    [apply, markApplied, setShiftLoading]
  )

  const handleCancel = useCallback(
    async (applicationId: number | null | undefined, shiftId: number) => {
      setShiftLoading(shiftId, true)
      try {
        // API ожидает application id; если его нет — вызов может завершиться ошибкой
        await cancel(applicationId as number)
        unmarkApplied(shiftId)
      } catch {
        // Ошибка уже обработана в хуке
      } finally {
        setShiftLoading(shiftId, false)
      }
    },
    [cancel, unmarkApplied, setShiftLoading]
  )

  const isShiftLoading = useCallback(
    (shiftId: number) => loadingShiftIds.has(shiftId),
    [loadingShiftIds]
  )

  return {
    appliedShifts,
    appliedShiftsSet,
    appliedApplicationsMap,
    getApplicationId,
    handleApply,
    handleCancel,
    isShiftLoading,
  }
}
