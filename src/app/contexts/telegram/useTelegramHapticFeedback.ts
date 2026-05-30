import { useEffect, useRef } from 'react'
import { triggerHapticFeedback, type HapticFeedbackPattern } from '@/shared/utils/haptics'

type HapticDatasetValue = HapticFeedbackPattern | 'none'

const INTERACTIVE_SELECTOR = [
  '[data-haptic]',
  'button',
  'a[href]',
  '[role="button"]',
  '[role="tab"]',
  '[role="option"]',
  '[role="switch"]',
].join(',')

const TEXT_INPUT_SELECTOR = 'input, textarea, select, [contenteditable="true"]'

const isHapticDatasetValue = (value: string | undefined): value is HapticDatasetValue =>
  value === 'none' ||
  value === 'selection' ||
  value === 'light' ||
  value === 'medium' ||
  value === 'heavy' ||
  value === 'rigid' ||
  value === 'soft' ||
  value === 'success' ||
  value === 'warning' ||
  value === 'error'

const isDisabledElement = (element: HTMLElement): boolean => {
  if (element.getAttribute('aria-disabled') === 'true') return true
  if (element instanceof HTMLButtonElement || element instanceof HTMLInputElement) {
    return element.disabled
  }
  return false
}

const isNativeKeyboardInteractive = (element: HTMLElement): boolean =>
  element instanceof HTMLButtonElement ||
  element instanceof HTMLAnchorElement ||
  element instanceof HTMLInputElement

const resolveHapticPattern = (element: HTMLElement): HapticDatasetValue => {
  const explicit = element.dataset.haptic
  if (isHapticDatasetValue(explicit)) return explicit

  const role = element.getAttribute('role')
  if (role === 'tab' || role === 'option' || role === 'switch') return 'selection'
  if (element.getAttribute('aria-pressed') != null) return 'selection'

  return 'light'
}

/**
 * Единый слой haptic feedback для Telegram Mini App.
 * Любой интерактив получает лёгкий отклик, а `data-haptic` задаёт нужную силу.
 */
export const useTelegramHapticFeedback = () => {
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const triggerForTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return

      const textInput = target.closest(TEXT_INPUT_SELECTOR)
      const interactive = target.closest(INTERACTIVE_SELECTOR)
      if (!(interactive instanceof HTMLElement)) return
      if (textInput && !textInput.closest('button,[role="button"]')) return
      if (isDisabledElement(interactive)) return

      const pattern = resolveHapticPattern(interactive)
      if (pattern === 'none') return

      triggerHapticFeedback(pattern)
    }

    const handleClick = (event: MouseEvent) => {
      triggerForTarget(event.target)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      const target = event.target
      if (!(target instanceof HTMLElement)) return

      const interactive = target.closest(INTERACTIVE_SELECTOR)
      if (!(interactive instanceof HTMLElement)) return
      if (isNativeKeyboardInteractive(interactive)) return

      triggerForTarget(target)
    }

    root.addEventListener('click', handleClick)
    root.addEventListener('keydown', handleKeyDown)
    return () => {
      root.removeEventListener('click', handleClick)
      root.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return rootRef
}
