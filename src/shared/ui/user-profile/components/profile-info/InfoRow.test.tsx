import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InfoRow } from './InfoRow'

describe('InfoRow', () => {
  it('оставляет подпись слева от первой строки и даёт тексту всю ширину ниже', () => {
    render(
      <InfoRow label="Описание" multiline>
        Длинный многострочный текст о заведении
      </InfoRow>
    )

    expect(screen.getByText('Описание').parentElement).toHaveClass('flow-root')
    expect(screen.getByText('Описание')).toHaveClass('float-left', 'top-1')
    expect(screen.getByText(/Длинный/)).toHaveClass('block', 'whitespace-pre-wrap', 'text-justify')
    expect(screen.getByText(/Длинный/)).not.toHaveClass('truncate')
  })

  it('сохраняет обычную строку для короткого значения', () => {
    render(<InfoRow label="Город">Минск</InfoRow>)

    expect(screen.getByText('Город')).not.toHaveClass('float-left')
    expect(screen.getByText('Минск')).toHaveClass('truncate')
  })
})
