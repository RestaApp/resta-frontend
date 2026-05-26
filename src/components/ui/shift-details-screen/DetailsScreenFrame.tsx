import { useEffect, type ReactNode } from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerFrame,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { DRAWER_SCROLL_BODY_CLASS } from '@/components/ui/ui-patterns'
import { setupTelegramBackButton } from '@/utils/telegram'

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
  useEffect(() => {
    if (!open || variant !== 'page') return
    return setupTelegramBackButton(onClose)
  }, [onClose, open, variant])

  if (variant === 'page') {
    if (!open) return null
    return (
      <section className="fixed inset-0 z-50 flex flex-col bg-background">
        <div
          className={`flex-1 min-h-0 overflow-y-auto ${DRAWER_SCROLL_BODY_CLASS} bg-background pb-24`}
        >
          {children}
        </div>

        {footer}
      </section>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerFrame>
        <DrawerHeader className="shrink-0">
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

        <DrawerBody className="ui-density-stack pb-5">{children}</DrawerBody>

        {footer}
      </DrawerFrame>
    </Drawer>
  )
}
