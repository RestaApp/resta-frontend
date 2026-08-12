import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { VenueListingsDrawer } from './VenueListingsDrawer'

vi.mock('@/components/ui/drawer', () => ({
  Drawer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DrawerBody: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DrawerFrame: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/drawer-title-bar', () => ({
  DrawerTitleBar: ({ title }: { title: string }) => <div>{title}</div>,
}))

vi.mock('@/components/ui/shift-skeleton', () => ({
  FeedCardSkeletonList: () => null,
}))

vi.mock('@/components/ui/states', () => ({
  ErrorState: () => null,
}))

vi.mock('@/components/ui/shift-card/ShiftCard', () => ({
  FeedCard: ({
    shift,
    onOpenDetails,
  }: {
    shift: { id: number }
    onOpenDetails: (id: number) => void
  }) => (
    <button type="button" onClick={() => onOpenDetails(shift.id)}>
      vacancy-{shift.id}
    </button>
  ),
}))

vi.mock('@/services/api/shiftsApi', () => ({
  useGetVacanciesQuery: () => ({ data: {}, isLoading: false, isError: false }),
}))

vi.mock('@/shared/shifts/normalizeShiftsResponse', () => ({
  normalizeVacanciesResponse: () => [{ user: { id: 11 } }],
}))

vi.mock('@/shared/shifts/mapping', () => ({
  mapVacancyToCardShift: () => ({ id: 42 }),
}))

vi.mock('@/shared/ui/shift-details-screen/ShiftDetailOverlay', () => ({
  ShiftDetailOverlay: ({
    id,
    origin,
    onClose,
  }: {
    id: number
    origin?: string
    onClose: () => void
  }) => (
    <div data-testid="vacancy-details">
      details-{id}
      <span>origin-{origin}</span>
      <button type="button" onClick={onClose}>
        close-details
      </button>
    </div>
  ),
}))

describe('VenueListingsDrawer', () => {
  it('открывает вакансию один раз и возвращает к списку без записей в history', () => {
    const pushState = vi.spyOn(window.history, 'pushState')

    render(<VenueListingsDrawer userId={11} venueName="Resta" open onClose={vi.fn()} />)

    const vacancy = screen.getByRole('button', { name: 'vacancy-42' })
    fireEvent.click(vacancy)
    fireEvent.click(vacancy)
    fireEvent.click(vacancy)

    expect(screen.getAllByTestId('vacancy-details')).toHaveLength(1)
    expect(screen.getByText('details-42')).toBeInTheDocument()
    expect(screen.getByText('origin-venue-listings')).toBeInTheDocument()
    expect(pushState).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'close-details' }))

    expect(screen.queryByTestId('vacancy-details')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'vacancy-42' })).toBeInTheDocument()
  })
})
