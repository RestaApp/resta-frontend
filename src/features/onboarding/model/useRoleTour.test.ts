import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act, waitFor, cleanup } from '@testing-library/react'
import { useRoleTour, isRoleTourSeen, markRoleTourSeen } from './useRoleTour'
import { APP_EVENTS, emitAppEvent } from '@/shared/utils/appEvents'
import type { Tab } from '@/shared/types/navigation.types'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('useRoleTour', () => {
  it('авто-старт, next/prev переключают шаги и вкладки, finish помечает seen', async () => {
    const onTabChange = vi.fn<(tab: Tab) => void>()
    const { result } = renderHook(() => useRoleTour({ role: 'chef', onTabChange }))

    // авто-старт через rAF
    await waitFor(() => expect(result.current.isActive).toBe(true))
    expect(result.current.stepIndex).toBe(0)
    expect(result.current.canGoBack).toBe(false)
    expect(onTabChange).toHaveBeenLastCalledWith('feed')

    act(() => result.current.next())
    expect(result.current.stepIndex).toBe(1)
    expect(result.current.canGoBack).toBe(true)
    expect(onTabChange).toHaveBeenLastCalledWith('activity')

    act(() => result.current.prev())
    expect(result.current.stepIndex).toBe(0)
    expect(onTabChange).toHaveBeenLastCalledWith('feed')

    // 0 → 1 → 2 → 3 (последний у employee — profile)
    act(() => result.current.next())
    act(() => result.current.next())
    act(() => result.current.next())
    expect(result.current.stepIndex).toBe(3)
    expect(result.current.isLast).toBe(true)
    expect(onTabChange).toHaveBeenLastCalledWith('profile')

    // next за последним шагом → завершение + флаг seen
    act(() => result.current.next())
    expect(result.current.isActive).toBe(false)
    expect(isRoleTourSeen('chef')).toBe(true)
  })

  it('finish из середины завершает тур и помечает seen', async () => {
    const { result } = renderHook(() => useRoleTour({ role: 'venue', onTabChange: vi.fn() }))
    await waitFor(() => expect(result.current.isActive).toBe(true))

    act(() => result.current.next())
    act(() => result.current.finish())
    expect(result.current.isActive).toBe(false)
    expect(isRoleTourSeen('venue')).toBe(true)
  })

  it('не стартует автоматически, если роль уже видела тур', async () => {
    markRoleTourSeen('venue')
    const { result } = renderHook(() => useRoleTour({ role: 'venue', onTabChange: vi.fn() }))
    await sleep(60)
    expect(result.current.isActive).toBe(false)
  })

  it('START_ROLE_TOUR запускает тур повторно', async () => {
    markRoleTourSeen('supplier')
    const { result } = renderHook(() => useRoleTour({ role: 'supplier', onTabChange: vi.fn() }))
    await sleep(40)
    expect(result.current.isActive).toBe(false)

    act(() => emitAppEvent(APP_EVENTS.START_ROLE_TOUR))
    await waitFor(() => expect(result.current.isActive).toBe(true))
    expect(result.current.stepIndex).toBe(0)
  })
})
