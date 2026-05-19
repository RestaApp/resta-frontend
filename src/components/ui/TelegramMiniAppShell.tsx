import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { useTelegram } from '@/contexts/TelegramContext'

interface TelegramMiniAppShellProps {
  children: ReactNode
  className?: string
}

const FULLSCREEN_TOP_OFFSET_PX = 80

/**
 * Внешняя оболочка Telegram WebView.
 *
 * Единственный scroll-root приложения (`data-app-scroll-root`): страницы и онбординг
 * не задают overflow сами — контент растёт по высоте, прокрутка здесь.
 * `useTelegramScrollLock` блокирует body в fullscreen, поэтому без этого слоя
 * скролл в Mini App пропадает.
 */
export const TelegramMiniAppShell = ({ children, className }: TelegramMiniAppShellProps) => {
  const { isFullscreen } = useTelegram()

  return (
    <div
      className={cn('bg-background flex flex-col overflow-hidden', isFullscreen && 'mt-[80px]', className)}
      style={{
        height: isFullscreen
          ? `calc(var(--tg-viewport-stable-height, 100dvh) - ${FULLSCREEN_TOP_OFFSET_PX}px)`
          : 'var(--tg-viewport-stable-height, 100dvh)',
      }}
    >
      <div data-app-scroll-root className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        {children}
      </div>
    </div>
  )
}
