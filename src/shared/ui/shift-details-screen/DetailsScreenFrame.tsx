import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerFrame,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { DRAWER_SCROLL_BODY_CLASS } from '@/components/ui/ui-patterns'
import { useTelegramFullscreenOffset } from '@/app/contexts/telegram/useTelegramFullscreenOffset'
import { BOTTOM_NAV_HEIGHT_CSS } from '@/shared/ui/layout'
import { Z_INDEX } from '@/shared/ui/zIndex'
import { cn } from '@/shared/utils/cn'
import { setupTelegramBackButton } from '@/shared/utils/telegram'

interface DetailsScreenFrameProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  closeAriaLabel?: string
  title?: ReactNode
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
  const fullscreenOffset = useTelegramFullscreenOffset()
  const onCloseRef = useRef(onClose)
  useLayoutEffect(() => {
    onCloseRef.current = onClose
  })
  const stableClose = useCallback(() => onCloseRef.current(), [])

  useEffect(() => {
    if (!open || variant !== 'page') return
    return setupTelegramBackButton(stableClose)
  }, [stableClose, open, variant])

  if (variant === 'page') {
    if (!open) return null
    const node = (
      <>
        <div
          aria-hidden="true"
          className="fixed bottom-0 left-0 right-0 bg-background"
          style={{ zIndex: Z_INDEX.detailPage, height: BOTTOM_NAV_HEIGHT_CSS }}
        />
        <section
          className={cn(
            'fixed left-0 right-0 flex flex-col bg-background',
            fullscreenOffset.topClassName
          )}
          style={{ zIndex: Z_INDEX.drawer, bottom: BOTTOM_NAV_HEIGHT_CSS }}
        >
          <div
            className={`flex-1 min-h-0 overflow-y-auto ${DRAWER_SCROLL_BODY_CLASS} bg-background pb-24`}
          >
            {children}
          </div>

          {footer}
        </section>
      </>
    )

    return typeof document !== 'undefined' ? createPortal(node, document.body) : node
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerFrame>
        <DrawerHeader className="shrink-0">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <DrawerTitle className="break-words">{title}</DrawerTitle>
              </div>
              <DrawerCloseButton onClick={onClose} ariaLabel={closeAriaLabel ?? ''} />
            </div>
            {headerMeta ? (
              <div className="flex flex-wrap items-center gap-2">{headerMeta}</div>
            ) : null}
          </div>
        </DrawerHeader>

        <DrawerBody className="ui-density-stack pb-5">{children}</DrawerBody>

        {footer}
      </DrawerFrame>
    </Drawer>
  )
}
