import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InfoRow } from './InfoRow'

describe('InfoRow', () => {
  it('keeps a multiline address in its own right-aligned column', () => {
    render(
      <InfoRow label="Адрес" multiline multilineColumns>
        Длинный адрес
      </InfoRow>
    )
    expect(screen.getByText('Адрес').parentElement).toHaveClass('flex', 'items-start')
    expect(screen.getByText('Адрес').parentElement).not.toHaveClass('flex-col')
    expect(screen.getByText('Длинный адрес')).toHaveClass('text-right', 'whitespace-pre-wrap')
  })
  it('ставит длинный текст под подписью, на всю ширину', () => {
    render(
      <InfoRow label="Описание" multiline>
        Длинный многострочный текст о заведении
      </InfoRow>
    )

    expect(screen.getByText('Описание').parentElement).toHaveClass('flex', 'flex-col')
    expect(screen.getByText(/Длинный/)).toHaveClass('whitespace-pre-wrap', 'text-left')
    expect(screen.getByText(/Длинный/)).not.toHaveClass('truncate', 'text-right')
  })

  it('сохраняет обычную строку для короткого значения', () => {
    render(<InfoRow label="Город">Минск</InfoRow>)

    expect(screen.getByText('Город').parentElement).not.toHaveClass('flex-col')
    expect(screen.getByText('Минск')).toHaveClass('truncate')
  })
})
