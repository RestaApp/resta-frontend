import type { HTMLAttributes, ReactNode } from 'react'
import { BOTTOM_NAV_HEIGHT_PX } from '@/shared/ui/layout'
import { Z_INDEX } from '@/shared/ui/zIndex'
import { cn } from '@/shared/utils/cn'

interface BottomActionBarProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  mode?: 'fixed' | 'static'
  aboveBottomNav?: boolean
  hideFade?: boolean
  transparent?: boolean
  withBorder?: boolean
  contentClassName?: string
}

/**
 * Единая нижняя CTA-зона: та же логика размещения, что у BottomNav.
 * Контейнер не отвечает за отступ контента: его задают layout страницы / DrawerBody.
 */
export const BottomActionBar = ({
  children,
  mode = 'static',
  aboveBottomNav = false,
  hideFade = true,
  transparent = false,
  withBorder = false,
  className,
  contentClassName,
  style,
  ...props
}: BottomActionBarProps) => {
  const isFixed = mode === 'fixed'

  return (
    <div
      className={cn(
        isFixed ? 'fixed left-0 right-0' : 'shrink-0',
        isFixed && !aboveBottomNav && 'bottom-0',
        'px-2.5 pt-3 pb-safe-nav',
        !transparent && 'bg-background/92 backdrop-blur-xl',
        withBorder && 'border-t border-border/50',
        className
      )}
      style={{
        ...style,
        ...(isFixed ? { zIndex: Z_INDEX.stickyHeader } : undefined),
        ...(isFixed && aboveBottomNav ? { bottom: BOTTOM_NAV_HEIGHT_PX } : undefined),
      }}
      {...props}
    >
      {!hideFade ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-background to-transparent"
        />
      ) : null}
      <div className={cn('ui-app-frame', contentClassName)}>{children}</div>
    </div>
  )
}
