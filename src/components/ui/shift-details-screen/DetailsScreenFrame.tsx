import type { ReactNode } from 'react'
import { Drawer, DrawerCloseButton, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'

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
        <DrawerHeader className="pb-4 pt-1 border-b border-border shrink-0">
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

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-5 pt-4 space-y-5 bg-background">
          {children}
        </div>

        {footer}
      </div>
    </Drawer>
  )
}
