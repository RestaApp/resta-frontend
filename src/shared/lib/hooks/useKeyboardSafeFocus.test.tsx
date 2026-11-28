import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { useKeyboardSafeFocus } from './useKeyboardSafeFocus'

/** Окно 800px; форма занимает 100–700px. */
const WINDOW_HEIGHT = 800
const FORM_RECT = { top: 100, bottom: 700 }

const Form = () => {
  const ref = useRef<HTMLDivElement>(null)
  useKeyboardSafeFocus(ref)
  return (
    <div ref={ref} data-testid="form">
      <input aria-label="Верхнее" />
      <input aria-label="Нижнее" />
      <input aria-label="Флажок" type="checkbox" />
    </div>
  )
}

interface Layout {
  isTouch?: boolean
  /** Сколько формы ещё можно прокрутить вниз. */
  scrollRoom?: number
}

const renderForm = ({ isTouch = true, scrollRoom = 1000 }: Layout = {}) => {
  vi.stubGlobal('matchMedia', () => ({ matches: isTouch }))
  vi.stubGlobal('innerHeight', WINDOW_HEIGHT)
  render(<Form />)

  const form = screen.getByTestId('form')
  form.getBoundingClientRect = () => FORM_RECT as DOMRect
  Object.defineProperty(form, 'clientHeight', { value: 600 })
  Object.defineProperty(form, 'scrollHeight', { value: 600 + scrollRoom })

  const placeField = (label: string, bottom: number) => {
    const field = screen.getByLabelText(label)
    field.getBoundingClientRect = () => ({ top: bottom - 48, bottom }) as DOMRect
    return field
  }

  return {
    form,
    top: placeField('Верхнее', 200),
    bottom: placeField('Нижнее', 600),
    checkbox: placeField('Флажок', 650),
  }
}

// Клавиатура ещё не измерена: под неё отводится половина окна (400px).
// Граница безопасной зоны: низ формы 700 − 400 − зазор 16 = 284px.
describe('useKeyboardSafeFocus', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('поднимает поле, которое закрыла бы клавиатура', () => {
    const { form, bottom } = renderForm()

    fireEvent.focusIn(bottom)

    // Низ поля 600 → к границе 284: прокрутка на 316px.
    expect(form.scrollTop).toBe(316)
    expect(form.style.paddingBottom).toBe('')
  })

  it('не трогает поле, которое клавиатура не закроет', () => {
    const { form, top } = renderForm()

    fireEvent.focusIn(top)

    expect(form.scrollTop).toBe(0)
  })

  it('добавляет нижний отступ, когда прокручивать некуда, и убирает его после ввода', () => {
    const { form, bottom } = renderForm({ scrollRoom: 100 })

    fireEvent.focusIn(bottom)
    // Нужно 316px, доступно 100px — недостающие 216px даёт отступ.
    expect(form.style.paddingBottom).toBe('216px')

    fireEvent.focusOut(bottom)
    expect(form.style.paddingBottom).toBe('')
  })

  it('сохраняет отступ, когда фокус переходит на соседнее поле ввода', () => {
    const { form, top, bottom } = renderForm({ scrollRoom: 100 })

    fireEvent.focusIn(bottom)
    fireEvent.focusOut(bottom, { relatedTarget: top })

    expect(form.style.paddingBottom).toBe('216px')
  })

  it('не реагирует на элементы, которые не открывают клавиатуру', () => {
    const { form, checkbox } = renderForm()

    fireEvent.focusIn(checkbox)

    expect(form.scrollTop).toBe(0)
  })

  it('выключен на устройствах без сенсорного ввода', () => {
    const { form, bottom } = renderForm({ isTouch: false })

    fireEvent.focusIn(bottom)

    expect(form.scrollTop).toBe(0)
  })
})
