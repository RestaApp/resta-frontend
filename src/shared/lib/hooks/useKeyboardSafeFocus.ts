import { useEffect, type RefObject } from 'react'

/** Доля высоты окна под клавиатуру, пока её настоящая высота не измерена. */
const ASSUMED_KEYBOARD_RATIO = 0.5
/** Меньшее сжатие окна — не клавиатура (панель браузера, поворот). */
const MIN_KEYBOARD_HEIGHT = 120
/** Зазор между полем и верхним краем клавиатуры. */
const SAFE_MARGIN = 16

const TEXT_INPUT_TYPES = new Set(['text', 'search', 'email', 'tel', 'url', 'number', 'password'])

/** Высота клавиатуры, измеренная при прошлом показе; 0 — ещё не измеряли. */
let measuredKeyboardHeight = 0

/** Поле, фокус на котором открывает экранную клавиатуру. */
const opensKeyboard = (target: EventTarget | null): target is HTMLElement => {
  if (target instanceof HTMLTextAreaElement) return !target.readOnly && !target.disabled
  if (target instanceof HTMLInputElement) {
    return TEXT_INPUT_TYPES.has(target.type) && !target.readOnly && !target.disabled
  }
  return target instanceof HTMLElement && target.isContentEditable
}

const getVisibleHeight = () =>
  Math.min(window.innerHeight, window.visualViewport?.height ?? window.innerHeight)

/**
 * Держит поле ввода в зоне, которую не закроет экранная клавиатура.
 *
 * Если поле при нажатии стоит там, куда выедет клавиатура, iOS сама сдвигает
 * всё окно WebView, чтобы его показать, — экран дёргается целиком. Поэтому в
 * момент фокуса, до появления клавиатуры, поле заранее прокручивается выше:
 * системе нечего сдвигать. Если прокрутить некуда, контейнеру на время фокуса
 * добавляется нижний отступ.
 *
 * Только для сенсорных устройств: на компьютере экранной клавиатуры нет.
 */
export const useKeyboardSafeFocus = (containerRef: RefObject<HTMLElement | null>): void => {
  useEffect(() => {
    const container = containerRef.current
    if (!container || !window.matchMedia?.('(pointer: coarse)').matches) return

    let originalPaddingBottom: string | null = null
    let heightAtFocus = 0

    const restorePadding = () => {
      if (originalPaddingBottom === null) return
      container.style.paddingBottom = originalPaddingBottom
      originalPaddingBottom = null
    }

    const handleFocusIn = (event: FocusEvent) => {
      const field = event.target
      if (!opensKeyboard(field)) return

      heightAtFocus = getVisibleHeight()
      const keyboardHeight = measuredKeyboardHeight || heightAtFocus * ASSUMED_KEYBOARD_RATIO
      // Нижняя граница контейнера после того, как окно сожмётся под клавиатуру.
      const safeBottom = container.getBoundingClientRect().bottom - keyboardHeight - SAFE_MARGIN
      const overflow = field.getBoundingClientRect().bottom - safeBottom
      if (overflow <= 0) return

      const scrollRoom = container.scrollHeight - container.clientHeight - container.scrollTop
      if (scrollRoom < overflow) {
        originalPaddingBottom ??= container.style.paddingBottom
        const padding = parseFloat(getComputedStyle(container).paddingBottom) || 0
        container.style.paddingBottom = `${padding + overflow - scrollRoom}px`
      }
      container.scrollTop += overflow
    }

    const handleFocusOut = (event: FocusEvent) => {
      // Фокус перешёл на соседнее поле ввода — отступ ещё нужен.
      if (opensKeyboard(event.relatedTarget) && container.contains(event.relatedTarget)) return
      restorePadding()
    }

    // Запоминаем настоящую высоту клавиатуры для следующих нажатий.
    const handleResize = () => {
      if (!opensKeyboard(document.activeElement)) return
      const shrunkBy = heightAtFocus - getVisibleHeight()
      if (shrunkBy >= MIN_KEYBOARD_HEIGHT) measuredKeyboardHeight = shrunkBy
    }

    container.addEventListener('focusin', handleFocusIn)
    container.addEventListener('focusout', handleFocusOut)
    window.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('resize', handleResize)

    return () => {
      container.removeEventListener('focusin', handleFocusIn)
      container.removeEventListener('focusout', handleFocusOut)
      window.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('resize', handleResize)
      restorePadding()
    }
  }, [containerRef])
}
