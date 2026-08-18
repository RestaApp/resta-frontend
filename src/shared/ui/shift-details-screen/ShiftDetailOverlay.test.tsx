import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ShiftDetailOverlay } from './ShiftDetailOverlay'

vi.mock('@/services/api/shiftsApi', () => ({
  useGetShiftByIdQuery: () => ({
    data: { my_application: { id: 7, status: 'rejected' } },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}))

vi.mock('@/shared/shifts/mapping', () => ({
  vacancyToShift: () => ({ id: 42 }),
}))

vi.mock('@/shared/shifts/useShiftApplication', () => ({
  useShiftApplication: () => ({ apply: vi.fn(), cancel: vi.fn() }),
}))

vi.mock('./ShiftDetailsScreen', () => ({
  ShiftDetailsScreen: ({
    allowOwnerProfileNavigation,
    isApplied,
  }: {
    allowOwnerProfileNavigation?: boolean
    isApplied: boolean
  }) => (
    <>
      <div data-testid="owner-profile-navigation">
        {allowOwnerProfileNavigation ? 'enabled' : 'disabled'}
      </div>
      <div data-testid="is-applied">{isApplied ? 'active' : 'inactive'}</div>
    </>
  ),
}))

describe('ShiftDetailOverlay', () => {
  it('запрещает повторный вход в профиль заведения для вакансии из списка заведения', () => {
    render(<ShiftDetailOverlay id={42} origin="venue-listings" onClose={vi.fn()} />)

    expect(screen.getByTestId('owner-profile-navigation')).toHaveTextContent('disabled')
  })

  it('оставляет переход в профиль для обычного открытия вакансии', () => {
    render(<ShiftDetailOverlay id={42} onClose={vi.fn()} />)

    expect(screen.getByTestId('owner-profile-navigation')).toHaveTextContent('enabled')
  })

  it('не считает rejected активным откликом', () => {
    render(<ShiftDetailOverlay id={42} onClose={vi.fn()} />)

    expect(screen.getByTestId('is-applied')).toHaveTextContent('inactive')
  })
})
