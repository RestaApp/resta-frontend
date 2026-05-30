import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface PageShellProps {
  /** Слот шапки. Обычно `<PageHeader ... />`. */
  header?: ReactNode
  /** Слот sticky-CTA снизу. Обычно `<StickyCTA><Button>…</Button></StickyCTA>`. */
  stickyCTA?: ReactNode
  /** Слот нижней навигации. Обычно `<BottomNav ... />`. */
  bottomNav?: ReactNode
  /** Основной контент страницы. */
  children: ReactNode
  /** Дополнительные классы на `<main>`. */
  contentClassName?: string
  /** Корневой className. */
  className?: string
}

/**
 * Универсальный mobile-first контейнер страницы (BOARD-04…08 в Resta Production).
 *
 * Layout:
 *   ┌───────────────────────────┐
 *   │ header                    │
 *   ├───────────────────────────┤
 *   │ main (scroll)             │
 *   │                           │
 *   │                           │
 *   ├───────────────────────────┤
 *   │ stickyCTA                 │
 *   │ bottomNav                 │
 *   └───────────────────────────┘
 *
 * Обязанности:
 *  • single source of truth для отступов под sticky CTA / BottomNav;
 *  • safe-area снизу (`pb-safe` когда нет CTA/nav, иначе достаточно слотов);
 *  • НЕ держит состояния, не знает о ролях, табах, бизнес-логике.
 */
export const PageShell = ({
  header,
  stickyCTA,
  bottomNav,
  children,
  contentClassName,
  className,
}: PageShellProps) => {
  // Нижний отступ под main (высота BottomNav ≈ BOTTOM_NAV_HEIGHT_PX из @/shared/ui/layout):
  //   • bottomNav + stickyCTA  → отступ под обе (примерно 88 + 80)
  //   • только bottomNav       → 96
  //   • только stickyCTA       → 96
  //   • ничего                 → safe-area
  const bottomPaddingClass = bottomNav
    ? stickyCTA
      ? 'pb-42'
      : 'pb-24'
    : stickyCTA
      ? 'pb-24'
      : 'pb-safe'

  return (
    <div className={cn('relative flex min-h-[100dvh] flex-col', className)}>
      {header}
      <main className={cn('ui-app-frame flex-1', bottomPaddingClass, contentClassName)}>
        {children}
      </main>
      {stickyCTA}
      {bottomNav}
    </div>
  )
}
