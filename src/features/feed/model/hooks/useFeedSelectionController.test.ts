import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFeedSelectionController } from './useFeedSelectionController'
import type { VacancyApiItem } from '@/services/api/shiftsApi'
import type { Shift } from '@/shared/shifts/types'
import type { UseVacanciesInfiniteListReturn } from './useVacanciesInfiniteList'

const makeShift = (applicationStatus: Shift['applicationStatus']): Shift => ({
  id: 42,
  title: 'Повар тестовый',
  restaurant: 'Тест',
  rating: 0,
  position: 'chef',
  date: '',
  time: '',
  pay: 120,
  currency: 'BYN',
  payPeriod: 'month',
  applicationId: 7,
  applicationStatus,
})

const makeVacancy = (status: string): VacancyApiItem => ({
  id: 42,
  title: 'Повар тестовый',
  payment: 120,
  position: 'chef',
  user: {
    id: 9,
    name: 'Тест',
  },
  my_application: {
    id: 7,
    status,
  },
})

const makeActiveList = (shift: Shift, vacancy: VacancyApiItem): UseVacanciesInfiniteListReturn => ({
  items: [shift],
  vacanciesMap: new Map([[vacancy.id, vacancy]]),
  hasMore: false,
  isInitialLoading: false,
  isFetching: false,
  error: null,
  totalCount: 1,
  loadMore: vi.fn(),
  refresh: vi.fn(async () => undefined),
})

const renderController = (
  shift: Shift,
  vacancy: VacancyApiItem,
  appliedStatusMap: Record<number, string | undefined> = {}
) =>
  renderHook(() =>
    useFeedSelectionController({
      activeList: makeActiveList(shift, vacancy),
      hotVacancies: [],
      selectedShiftId: 42,
      applyCoverTargetShiftId: null,
      applicationSuccessShiftId: null,
      appliedShiftsSet: new Set([42]),
      appliedApplicationsMap: { 42: 7 },
      appliedStatusMap,
      getApplicationId: () => 7,
    })
  )

describe('useFeedSelectionController', () => {
  it('getApplicationStatus берёт статус заявки из вакансии (my_application)', () => {
    const { result } = renderController(makeShift('accepted'), makeVacancy('accepted'))

    expect(result.current.getApplicationStatus(42)).toBe('accepted')
  })

  it('selectedShift несёт applicationStatus смены из ленты', () => {
    const { result } = renderController(makeShift('rejected'), makeVacancy('rejected'))

    expect(result.current.selectedShift?.applicationStatus).toBe('rejected')
  })

  it('подставляет свежий rejected в детали, сохраняя название и заведение', () => {
    // Лента (накопительная) отдаёт устаревший 'pending', но getAppliedShifts уже
    // знает про 'rejected' — приоритет за свежим источником.
    const { result } = renderController(makeShift('pending'), makeVacancy('pending'), {
      42: 'rejected',
    })

    expect(result.current.getApplicationStatus(42)).toBe('rejected')
    expect(result.current.selectedShift).toMatchObject({
      applicationStatus: 'rejected',
      title: 'Повар тестовый',
      restaurant: 'Тест',
    })
    expect(result.current.selectedVacancy).toMatchObject({
      title: 'Повар тестовый',
      user: { name: 'Тест' },
      my_application: { id: 7, status: 'rejected' },
    })
  })
})
