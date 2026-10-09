import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useShiftApplication } from './useShiftApplication'

const showToast = vi.fn()
const applyToShift = vi.fn()
const cancelApplication = vi.fn()

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('@/shared/lib/hooks/useToast', () => ({
  useToast: () => ({ showToast }),
}))

vi.mock('@/services/api/shiftsApi', () => ({
  useApplyToShiftMutation: () => [applyToShift, { isLoading: false }],
  useCancelApplicationMutation: () => [cancelApplication, { isLoading: false }],
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

  it('переводит код too_late_accepted при отказе от принятой смены', async () => {
    cancelApplication.mockReturnValue({
      unwrap: () =>
        Promise.reject({
          status: 422,
          data: {
            success: false,
            errors: ['Cannot cancel accepted application'],
            code: 'too_late_accepted',
          },
        }),
    })
    const { result } = renderHook(() => useShiftApplication())

    await act(async () => {
      await expect(result.current.cancel(7, 42)).rejects.toMatchObject({ kind: 'generic' })
    })

    expect(showToast).toHaveBeenCalledWith('shift.cancelTooLateAccepted', 'error')
  })

  it('показывает текст бэка для прочих ошибок отмены', async () => {
    cancelApplication.mockReturnValue({
      unwrap: () =>
        Promise.reject({ status: 422, data: { success: false, errors: ['Already processed'] } }),
    })
    const { result } = renderHook(() => useShiftApplication())

    await act(async () => {
      await expect(result.current.cancel(7, 42)).rejects.toMatchObject({ kind: 'generic' })
    })

    expect(showToast).toHaveBeenCalledWith('Already processed', 'error')
  })
})
