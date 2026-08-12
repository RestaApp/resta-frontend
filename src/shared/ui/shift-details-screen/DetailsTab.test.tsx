import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import i18n from '@/shared/i18n/config'
import type { Shift } from '@/shared/shifts/types'
import { DetailsTab } from './DetailsTab'

const longTitle = 'Очень длинное название вакансии для проверки мобильной вёрстки'
const longVenueName = 'Ресторан с очень длинным названием и дополнительным описанием'

const shift: Shift = {
  id: 1,
  title: longTitle,
  restaurant: longVenueName,
  rating: 0,
  position: 'chef',
  date: '24 июля',
  time: '21:30–22:30',
  pay: 5454,
  currency: 'BYN',
  payPeriod: 'shift',
  shiftType: 'replacement',
}

describe('DetailsTab', () => {
  it('показывает крупную сумму рядом с длинным заголовком', () => {
    render(
      <DetailsTab
        shift={shift}
        vacancyTitle={longTitle}
        positionLabel="Повар"
        showPositionLine
        shiftDate={shift.date}
        shiftTime={shift.time}
        duration="1"
        locationPoints={[]}
        pay={shift.pay}
        currency={shift.currency}
        hourlyRate="5454"
        description=""
        requirements=""
        t={i18n.t}
      />
    )

    expect(screen.getByRole('heading', { name: longTitle })).not.toHaveClass('line-clamp-2')
    expect(screen.getByText('Повар')).toHaveClass('whitespace-normal')
    expect(screen.getByText('5 454')).toHaveClass('price-xl')
  })

  it('показывает длинное название заведения перед датой', () => {
    render(
      <DetailsTab
        shift={shift}
        vacancyTitle={longTitle}
        positionLabel="Повар"
        shiftDate={shift.date}
        shiftTime={shift.time}
        locationPoints={[]}
        pay={shift.pay}
        currency={shift.currency}
        hourlyRate={null}
        description=""
        requirements=""
        t={i18n.t}
      />
    )

    const venue = screen.getByText(longVenueName)
    const schedule = screen.getByText('24 июля • 21:30–22:30')

    expect(venue).toHaveClass('line-clamp-2')
    expect(venue.compareDocumentPosition(schedule) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
