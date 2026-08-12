import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useShiftApplication } from './useShiftApplication'

const showToast = vi.fn()
const applyToShift = vi.fn()

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('@/shared/lib/hooks/useToast', () => ({
  useToast: () => ({ showToast }),
}))

vi.mock('@/services/api/shiftsApi', () => ({
  useApplyToShiftMutation: () => [applyToShift, { isLoading: false }],
  useCancelApplicationMutation: () => [vi.fn(), { isLoading: false }],
}))

describe('useShiftApplication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    applyToShift.mockReturnValue({
      unwrap: () => Promise.resolve({ message: 'Заявка отправлена' }),
    })
  })

  it('не показывает success toast, когда результат подтверждается отдельным экраном', async () => {
    const { result } = renderHook(() => useShiftApplication({ showApplySuccessToast: false }))

    await act(async () => {
      await result.current.apply(42)
    })

    expect(showToast).not.toHaveBeenCalled()
  })

  it('по умолчанию сохраняет success toast для flow без отдельного экрана', async () => {
    const { result } = renderHook(() => useShiftApplication())

    await act(async () => {
      await result.current.apply(42)
    })

    expect(showToast).toHaveBeenCalledWith('Заявка отправлена', 'success')
  })
})
