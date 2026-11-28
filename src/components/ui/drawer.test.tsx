import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Drawer } from './drawer'

vi.mock('@/app/contexts/telegram/useTelegramFullscreenOffset', () => ({
  useTelegramFullscreenOffset: () => ({ shouldApply: false }),
}))
vi.mock('@/shared/utils/telegram', () => ({ setupTelegramBackButton: () => () => undefined }))

const renderDrawer = (props: { open: boolean; instantClose?: boolean }) => (
  <Drawer onOpenChange={() => undefined} {...props}>
    <p>Содержимое</p>
  </Drawer>
)

describe('Drawer — закрытие', () => {
  it('обычное закрытие уходит с анимацией: содержимое ещё на экране', () => {
    const { rerender } = render(renderDrawer({ open: true }))

    rerender(renderDrawer({ open: false }))

    expect(screen.getByText('Содержимое')).toBeInTheDocument()
  })

  it('instantClose убирает шторку сразу, без анимации ухода', async () => {
    const { rerender } = render(renderDrawer({ open: true }))

    rerender(renderDrawer({ open: false, instantClose: true }))

    // Обычный уход длится сотни миллисекунд; мгновенный укладывается в пару кадров.
    await waitFor(() => expect(screen.queryByText('Содержимое')).not.toBeInTheDocument(), {
      timeout: 120,
    })
  })
})
