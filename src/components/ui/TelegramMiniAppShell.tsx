import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'
import { useTelegramFullscreenOffset } from '@/app/contexts/telegram/useTelegramFullscreenOffset'
import { useTelegramHapticFeedback } from '@/app/contexts/telegram/useTelegramHapticFeedback'
import { isIosDevice } from '@/app/contexts/telegram/utils'

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
  const hasNativeBounce = isIosDevice()

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
      {/* Резинка на краях скролла. iOS: нативная — `contain` оставляет её, но не
          отдаёт жест наружу (Telegram закрывает Mini App свайпом вниз). Остальные
          платформы: нативной нет, `none` гасит системные эффекты, а резинку
          воспроизводит `PageOverscroll`. */}
      <div
        data-app-scroll-root
        className={cn(
          'min-h-0 flex-1 overflow-y-auto',
          hasNativeBounce ? 'overscroll-y-contain' : 'overscroll-y-none'
        )}
      >
        {/* iOS не пружинит контейнер, которому нечего прокручивать: +1px делает
            прокручиваемым и короткий экран, иначе его нельзя потянуть для обновления. */}
        {hasNativeBounce ? <div className="min-h-[calc(100%+1px)]">{children}</div> : children}
      </div>
    </div>
  )
}
