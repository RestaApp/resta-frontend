import { useTelegram } from '@/contexts/TelegramContext'
import { isIosDevice } from './utils'

const TELEGRAM_VIEWPORT_HEIGHT = 'var(--tg-viewport-stable-height, 100dvh)'

export const TELEGRAM_FULLSCREEN_TOP_OFFSET_PX = 80
export const TELEGRAM_FULLSCREEN_TOP_OFFSET_CLASS = 'top-20'
export const TELEGRAM_FULLSCREEN_MARGIN_TOP_CLASS = 'mt-20'

/**
 * Единая логика отступа под Telegram top-controls в iOS fullscreen.
 * Нужна для app shell и full-page fixed surfaces, которые обходят shell.
 */
export const useTelegramFullscreenOffset = () => {
  const { isFullscreen } = useTelegram()
  const shouldApply = isFullscreen && isIosDevice()

  return {
    shouldApply,
    topClassName: shouldApply ? TELEGRAM_FULLSCREEN_TOP_OFFSET_CLASS : 'top-0',
    marginTopClassName: shouldApply ? TELEGRAM_FULLSCREEN_MARGIN_TOP_CLASS : undefined,
    viewportHeight: shouldApply
      ? `calc(${TELEGRAM_VIEWPORT_HEIGHT} - ${TELEGRAM_FULLSCREEN_TOP_OFFSET_PX}px)`
      : TELEGRAM_VIEWPORT_HEIGHT,
  }
}
