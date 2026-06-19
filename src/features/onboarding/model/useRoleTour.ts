import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getLocalStorageItem, setLocalStorageItem } from '@/shared/utils/localStorage'
import { STORAGE_KEYS } from '@/shared/constants/storage'
import { APP_EVENTS, onAppEvent } from '@/shared/utils/appEvents'
import type { Tab } from '@/shared/types/navigation.types'
import type { UiRole } from '@/shared/types/roles.types'
import { getRoleTourSteps } from './roleTourContent'

const tourSeenKey = (role: UiRole) => `${STORAGE_KEYS.ROLE_TOUR_SEEN_PREFIX}${role}`

export const isRoleTourSeen = (role: UiRole): boolean =>
  getLocalStorageItem(tourSeenKey(role)) === '1'
export const markRoleTourSeen = (role: UiRole): void => setLocalStorageItem(tourSeenKey(role), '1')

interface UseRoleTourParams {
  role: UiRole
  /** Переключение вкладки — чтобы показать экран подсвечиваемой вкладки. */
  onTabChange: (tab: Tab) => void
}

/**
 * Стейт-машина coach-marks тура по вкладкам роли. Авто-старт один раз
 * (флаг localStorage), повтор — по событию START_ROLE_TOUR.
 */
export const useRoleTour = ({ role, onTabChange }: UseRoleTourParams) => {
  const steps = useMemo(() => getRoleTourSteps(role), [role])
  const [stepIndex, setStepIndex] = useState<number | null>(null)
  const onTabChangeRef = useRef(onTabChange)
  const autoStartedRef = useRef(false)

  useEffect(() => {
    onTabChangeRef.current = onTabChange
  }, [onTabChange])

  const goToStep = useCallback(
    (index: number) => {
      const step = steps[index]
      if (!step) return
      setStepIndex(index)
      onTabChangeRef.current(step.tabId)
    },
    [steps]
  )

  const start = useCallback(() => {
    if (steps.length === 0) return
    // Тур охватывает вкладку «Заявки», поэтому гасим старый точечный коучмарк
    // «Создать вакансию», чтобы он не всплыл одновременно.
    setLocalStorageItem(STORAGE_KEYS.ACTIVITY_ADD_SHIFT_ONBOARDING_SHOWN, '1')
    goToStep(0)
  }, [goToStep, steps.length])

  const finish = useCallback(() => {
    setStepIndex(null)
    markRoleTourSeen(role)
  }, [role])

  const next = useCallback(() => {
    setStepIndex(prev => {
      if (prev === null) return null
      const nextIndex = prev + 1
      if (nextIndex >= steps.length) {
        markRoleTourSeen(role)
        return null
      }
      const step = steps[nextIndex]
      if (step) onTabChangeRef.current(step.tabId)
      return nextIndex
    })
  }, [role, steps])

  // Авто-старт один раз на mount, если ещё не видели. Флаг ставим ВНУТРИ rAF —
  // иначе StrictMode (cleanup отменяет rAF на первом проходе) заблокирует старт.
  useEffect(() => {
    if (isRoleTourSeen(role)) return
    const raf = requestAnimationFrame(() => {
      if (autoStartedRef.current) return
      autoStartedRef.current = true
      start()
    })
    return () => cancelAnimationFrame(raf)
  }, [role, start])

  // Повторный запуск из профиля.
  useEffect(() => onAppEvent(APP_EVENTS.START_ROLE_TOUR, () => start()), [start])

  const activeStep = stepIndex != null ? (steps[stepIndex] ?? null) : null

  return {
    steps,
    stepIndex,
    activeStep,
    isActive: stepIndex != null,
    isLast: stepIndex != null && stepIndex === steps.length - 1,
    next,
    finish,
  }
}
