import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { useRef, useState } from 'react'
import { useFocusTrap } from './useFocusTrap'

const originalOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent')

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get() {
      return this.parentElement
    },
  })
})

afterAll(() => {
  if (originalOffsetParent) {
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', originalOffsetParent)
    return
  }
  Reflect.deleteProperty(HTMLElement.prototype, 'offsetParent')
})

const FocusTrapHarness = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState('')
  const [isOpen, setIsOpen] = useState(true)

  useFocusTrap({
    active: isOpen,
    containerRef,
    // Намеренно передаём новый callback на каждом рендере: раньше это
    // перезапускало trap и выбивало фокус из активного input после ввода.
    onEscape: () => setIsOpen(false),
  })

  return (
    <div>
      <button type="button">outside</button>
      {isOpen ? (
        <div ref={containerRef}>
          <button type="button">close</button>
          <input value={value} onChange={event => setValue(event.target.value)} aria-label="name" />
        </div>
      ) : null}
    </div>
  )
}

describe('useFocusTrap', () => {
  it('does not steal focus from the active input on ordinary rerenders', async () => {
    render(<FocusTrapHarness />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'close' })).toHaveFocus()
    })

    const input = screen.getByRole('textbox', { name: 'name' })
    input.focus()
    expect(input).toHaveFocus()

    fireEvent.change(input, { target: { value: '1' } })

    expect(input).toHaveValue('1')
    expect(input).toHaveFocus()
  })
})
