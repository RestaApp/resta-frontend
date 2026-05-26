import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { useTelegramFullscreenOffset } from '@/contexts/telegram/useTelegramFullscreenOffset'

interface TelegramMiniAppShellProps {
  children: ReactNode
  className?: string
}

/**
 * Внешняя оболочка Telegram WebView.
 *
 * Единственный scroll-root приложения (`data-app-scroll-root`): страницы и онбординг
 * не задают overflow сами — контент растёт по высоте, прокрутка здесь.
 * `useTelegramScrollLock` блокирует body в fullscreen, поэтому без этого слоя
 * скролл в Mini App пропадает.
 */
export const TelegramMiniAppShell = ({ children, className }: TelegramMiniAppShellProps) => {
  const fullscreenOffset = useTelegramFullscreenOffset()

  return (
    <div
      className={cn(
        'bg-background flex flex-col overflow-hidden',
        fullscreenOffset.marginTopClassName,
        className
      )}
      style={{
        height: fullscreenOffset.viewportHeight,
      }}
    >
      <div data-app-scroll-root className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        {children}
      </div>
    </div>
  )
}
