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
}: DetailsScreenFrameProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <div
        className="flex flex-col rounded-t-2xl bg-background min-h-0 shrink-0"
        style={{ height: 'calc(85vh - 52px)' }}
      >
        <DrawerHeader className={`${DRAWER_HEADER_CLASS} shrink-0 pb-4 pt-1`}>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <DrawerTitle className="text-xl font-semibold break-words text-foreground">
                {title}
              </DrawerTitle>
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
