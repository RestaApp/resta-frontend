import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LegalRegistrationOverlay } from './LegalRegistrationOverlay'

vi.mock('@/app/contexts/telegram/useTelegramFullscreenOffset', () => ({
  useTelegramFullscreenOffset: () => ({ topClassName: 'top-20' }),
}))

describe('LegalRegistrationOverlay', () => {
  it('создаёт отдельную прокрутку и учитывает верхнюю панель Telegram', () => {
    render(
      <LegalRegistrationOverlay>
        <div>Политика</div>
      </LegalRegistrationOverlay>
    )

    const overlay = screen.getByText('Политика').parentElement
    expect(overlay).toHaveAttribute('data-legal-scroll-root')
    expect(overlay).toHaveClass('overflow-y-auto', 'overscroll-y-contain', 'top-20')
    expect(overlay).not.toHaveClass('inset-0')
  })
})
