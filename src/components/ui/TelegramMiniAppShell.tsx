import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { useTelegram } from '@/contexts/TelegramContext'

interface TelegramMiniAppShellProps {
  children: ReactNode
  className?: string
}

/**
 * Внешняя оболочка приложения внутри Telegram WebView.
 *
 * Обязанности:
 *  • базовый фон (`bg-background`) и минимальная высота (`100dvh`);
 *  • отступ сверху, когда Telegram включает fullscreen-режим (статусбар поверх).
 *
 * Всё остальное (header, safe-area снизу, sticky CTA) обслуживается через
 * `PageShell` / `StickyCTA`. Этот компонент НЕ должен знать о ролях, табах
 * или экранной навигации.
 */
export const TelegramMiniAppShell = ({ children, className }: TelegramMiniAppShellProps) => {
  const { isFullscreen } = useTelegram()
  return (
    <div
      className={cn('bg-background min-h-[100dvh]', isFullscreen ? 'mt-[80px]' : 'mt-0', className)}
    >
      {children}
    </div>
  )
}
