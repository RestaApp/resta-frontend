import { useTelegram } from '@/app/contexts/TelegramContext'
import { isIosDevice } from './utils'

const TELEGRAM_VIEWPORT_HEIGHT = 'var(--tg-viewport-stable-height, 100dvh)'

const TELEGRAM_FULLSCREEN_TOP_OFFSET_CLASS = 'top-20'
const TELEGRAM_FULLSCREEN_PADDING_TOP_CLASS = 'pt-20'

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
    shellTopOffsetClassName: shouldApply ? TELEGRAM_FULLSCREEN_PADDING_TOP_CLASS : undefined,
    viewportHeight: TELEGRAM_VIEWPORT_HEIGHT,
  }
}
