import { useCallback, useState } from 'react'
import { useShiftApplication } from './useShiftApplication'
import { useAppliedShifts } from './useAppliedShifts'

interface UseShiftActionsReturn {
  appliedShifts: number[]
  appliedShiftsSet: Set<number>
  handleApply: (shiftId: number) => Promise<void>
  handleCancel: (shiftId: number) => Promise<void>
  isShiftLoading: (shiftId: number) => boolean
}

export const useShiftActions = (): UseShiftActionsReturn => {
  const { appliedShifts, appliedShiftsSet, markApplied, unmarkApplied } = useAppliedShifts()
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
        await apply(shiftId)
        markApplied(shiftId)
      } catch {
        // Ошибка уже обработана в хуке
      } finally {
        setShiftLoading(shiftId, false)
      }
    },
    [apply, markApplied, setShiftLoading]
  )

  const handleCancel = useCallback(
    async (shiftId: number) => {
      setShiftLoading(shiftId, true)
      try {
        await cancel(shiftId)
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
    handleApply,
    handleCancel,
    isShiftLoading,
  }
}
