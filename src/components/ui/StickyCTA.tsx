import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { BOTTOM_NAV_HEIGHT_PX } from '@/shared/ui/layout'
import { Z_INDEX } from '@/shared/ui/zIndex'

interface StickyCTAProps {
  children: ReactNode
  /**
   * Размещать поверх BottomNav (`true`) или независимо снизу экрана (`false`).
   * Когда `true`, добавляется отступ снизу под высоту BottomNav.
   */
  aboveBottomNav?: boolean
  /** Скрыть градиент-fade перед CTA (для случаев, когда снизу уже непрозрачный фон). */
  hideFade?: boolean
  /** Отключить полупрозрачный фон (для встроенного на белой плашке). */
  transparent?: boolean
  className?: string
}

/**
 * Прилипший снизу CTA-контейнер.
 *
 * Обязанности:
 *  • держит CTA в безопасной зоне (`pb-safe-cta`);
 *  • не перекрывает BottomNav, когда тот есть (`aboveBottomNav`);
 *  • не сидит выше overlay/drawer (`Z_INDEX.stickyHeader`).
 *
 * SRP: позиционирование и safe-area. Бизнес-логика CTA — у консьюмера.
 */
export const StickyCTA = ({
  children,
  aboveBottomNav = false,
  hideFade = false,
  transparent = false,
  className,
}: StickyCTAProps) => (
  <div
    className={cn(
      'fixed left-0 right-0 ui-density-page pt-3 pb-safe-cta',
      !transparent && 'bg-background/92 backdrop-blur-xl',
      !aboveBottomNav && 'bottom-0',
      className
    )}
    style={{
      zIndex: Z_INDEX.stickyHeader,
      ...(aboveBottomNav ? { bottom: BOTTOM_NAV_HEIGHT_PX } : undefined),
    }}
  >
    {!hideFade ? (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-background to-transparent"
      />
    ) : null}
    <div className="ui-app-frame">{children}</div>
  </div>
)
