import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'
import { useTelegramFullscreenOffset } from '@/app/contexts/telegram/useTelegramFullscreenOffset'
import { useTelegramHapticFeedback } from '@/app/contexts/telegram/useTelegramHapticFeedback'

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
  const hapticRootRef = useTelegramHapticFeedback()

  return (
    <div
      ref={hapticRootRef}
      className={cn(
        'bg-background box-border flex flex-col overflow-hidden',
        fullscreenOffset.shellTopOffsetClassName,
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
