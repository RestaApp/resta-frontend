import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Shift } from '@/shared/shifts/types'
import { FeedCard } from './ShiftCard'

vi.mock('@/shared/shifts/useCurrentUserId', () => ({
  useCurrentUserId: () => null,
}))

const shift: Shift = {
  id: 1,
  title: 'Нужен повар',
  restaurant: 'Ресторан Элит',
  rating: 0,
  position: 'chef',
  date: '',
  time: '',
  pay: 180,
  currency: 'BYN',
  payPeriod: 'shift',
  shiftType: 'replacement',
}

describe('FeedCard', () => {
  it('показывает заведение, когда у смены есть свой заголовок', () => {
    render(<FeedCard shift={shift} onOpenDetails={vi.fn()} />)

    expect(screen.getByText(/Ресторан Элит/)).toBeInTheDocument()
  })

  it('показывает заведение в вакансии', () => {
    render(<FeedCard shift={{ ...shift, shiftType: 'vacancy' }} onOpenDetails={vi.fn()} />)

    expect(screen.getByText(/Ресторан Элит/)).toBeInTheDocument()
  })
})
