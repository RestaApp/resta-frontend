import type { ReactNode } from 'react'
import { BottomActionBar } from '@/components/ui/bottom-action-bar'

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
 *  • держит CTA в безопасной зоне по той же логике, что BottomNav;
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
  <BottomActionBar
    mode="fixed"
    aboveBottomNav={aboveBottomNav}
    hideFade={hideFade}
    transparent={transparent}
    className={className}
  >
    {children}
  </BottomActionBar>
)
