import type { ReactNode } from 'react'
import { Drawer, DrawerCloseButton, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { DRAWER_HEADER_CLASS, DRAWER_SCROLL_BODY_CLASS } from '@/components/ui/ui-patterns'

interface DetailsScreenFrameProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  closeAriaLabel: string
  title: ReactNode
  headerMeta?: ReactNode
  children: ReactNode
  footer?: ReactNode
  variant?: 'drawer' | 'page'
}

export function DetailsScreenFrame({
  open,
  onOpenChange,
  onClose,
  closeAriaLabel,
  title,
  headerMeta,
  children,
  footer,
  variant = 'drawer',
}: DetailsScreenFrameProps) {
  if (variant === 'page') {
    if (!open) return null
    return (
      <section className="fixed inset-0 z-50 flex flex-col bg-background">
        <div
          className={`flex-1 min-h-0 overflow-y-auto ${DRAWER_SCROLL_BODY_CLASS} bg-background pb-24 pt-5`}
        >
          {children}
        </div>

        {footer}
      </section>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <div className="flex min-h-0 flex-col rounded-t-2xl bg-background">
        <DrawerHeader className={`${DRAWER_HEADER_CLASS} shrink-0 pb-4 pt-1`}>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <DrawerTitle className="break-words">{title}</DrawerTitle>
            </div>
            <DrawerCloseButton onClick={onClose} ariaLabel={closeAriaLabel} />
          </div>
          {headerMeta ? (
            <div className="flex items-center gap-2 flex-wrap mt-3">{headerMeta}</div>
          ) : null}
        </DrawerHeader>

        <div className={`${DRAWER_SCROLL_BODY_CLASS} ui-density-stack bg-background pb-5`}>
          {children}
        </div>

        {footer}
      </div>
    </Drawer>
  )
}
