import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { TFunction } from 'i18next'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { Shift } from '@/shared/shifts/types'
import { useShiftDetailsScreenController } from './useShiftDetailsScreenController'

vi.mock('@/shared/shifts/useCurrentUserId', () => ({ useCurrentUserId: () => 1 }))

const shift: Shift = {
  id: 42,
  restaurant: 'Тест',
  rating: 0,
  position: 'chef',
  date: '',
  time: '',
  pay: 120,
  currency: 'BYN',
  payPeriod: 'month',
  applicationId: 7,
  applicationStatus: 'pending',
}

// Кэш ленты (накопленные страницы) с устаревшим статусом заявки.
const vacancyData = {
  id: 42,
  my_application: { id: 7, status: 'pending' },
} as unknown as VacancyApiItem

const renderController = (applicationStatus?: string | null) =>
  renderHook(() =>
    useShiftDetailsScreenController({
      shift,
      vacancyData,
      applicationId: 7,
      applicationStatus,
      onClose: vi.fn(),
      onApply: vi.fn(async () => undefined),
      onCancel: vi.fn(async () => undefined),
      t: ((key: string) => key) as unknown as TFunction,
    })
  )

describe('useShiftDetailsScreenController · статус отклика', () => {
  it('свежий applicationStatus (getAppliedShifts) приоритетнее my_application из кэша ленты', () => {
    const { result } = renderController('rejected')

    expect(result.current.isRejected).toBe(true)
    expect(result.current.isAccepted).toBe(false)
  })

  it('без свежего статуса берёт my_application из vacancyData', () => {
    const { result } = renderController(undefined)

    expect(result.current.isRejected).toBe(false)
    expect(result.current.isAccepted).toBe(false)
  })

  it('handleCancel не вызывает onCancel для отклонённой заявки', async () => {
    const onCancel = vi.fn(async () => undefined)
    const { result } = renderHook(() =>
      useShiftDetailsScreenController({
        shift,
        vacancyData,
        applicationStatus: 'rejected',
        onClose: vi.fn(),
        onApply: vi.fn(async () => undefined),
        onCancel,
        t: ((key: string) => key) as unknown as TFunction,
      })
    )

    await result.current.handleCancel()

    expect(onCancel).not.toHaveBeenCalled()
  })
})
