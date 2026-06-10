import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  AnimatePresence,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from 'motion/react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { BottomActionBar } from '@/components/ui/bottom-action-bar'
import { MODAL_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { useReducedVisualEffects } from '@/shared/lib/hooks/useReducedVisualEffects'
import { OVERLAY_SCRIM_CLASS } from './ui-patterns'
import { cn } from '@/shared/utils/cn'
import { useBodyScrollLock } from '@/shared/lib/hooks/useBodyScrollLock'
import { Z_INDEX } from '@/shared/ui/zIndex'
import { setupTelegramBackButton } from '@/shared/utils/telegram'

export type DrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children?: React.ReactNode
  preventClose?: boolean
  overlayClassName?: string
  onTelegramBack?: () => void

  /**
   * Новый API: явный отступ снизу (например высота BottomNav)
   */
  bottomOffsetPx?: number
}

type OverlayProps = {
  className?: string
  reduceVisualEffects?: boolean
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

const DrawerOverlay = memo(({ className, reduceVisualEffects, onClick }: OverlayProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1, pointerEvents: 'auto' }}
    exit={{ opacity: 0, pointerEvents: 'none' }}
    transition={{ duration: 0.18 }}
    className={cn(
      'fixed inset-0',
      OVERLAY_SCRIM_CLASS,
      reduceVisualEffects ? 'backdrop-blur-none' : undefined,
      className
    )}
    onClick={onClick}
    aria-hidden="true"
  />
))
DrawerOverlay.displayName = 'DrawerOverlay'

type DrawerContentProps = {
  className?: string
  overlayClassName?: string
  children?: React.ReactNode
  onOpenChange: (open: boolean) => void
  preventClose?: boolean
  bottomOffsetPx: number
}

const DrawerContent = memo(function DrawerContent({
  className,
  overlayClassName,
  children,
  onOpenChange,
  preventClose,
  bottomOffsetPx,
}: DrawerContentProps) {
  const reduceMotion = useReducedMotion()
  const reduceVisualEffects = useReducedVisualEffects()
  const dragControls = useDragControls()
  const contentRef = useRef<HTMLDivElement | null>(null)
  const isClosingBySwipeRef = useRef(false)
  const y = useMotionValue(0)
  const [contentHeightPx, setContentHeightPx] = useState(600)

  useBodyScrollLock(true)

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return
      if (!preventClose) onOpenChange(false)
    },
    [preventClose, onOpenChange]
  )

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const measure = () => setContentHeightPx(el.getBoundingClientRect().height)
    measure()

    const cleanup: Array<() => void> = []

    window.addEventListener('resize', measure)
    cleanup.push(() => window.removeEventListener('resize', measure))

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(measure)
      ro.observe(el)
      cleanup.push(() => ro.disconnect())
    }

    return () => cleanup.forEach(fn => fn())
  }, [bottomOffsetPx])

  const closeThresholdPx = Math.min(
    72,
    Math.max(32, contentHeightPx > 0 ? contentHeightPx * 0.1 : 48)
  )
  const dragBottomPx = Math.max(0, contentHeightPx + bottomOffsetPx + 40)

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (preventClose) return
      if (isClosingBySwipeRef.current) return

      const shouldClose = info.offset.y >= closeThresholdPx || info.velocity.y > 300
      if (!shouldClose) return

      isClosingBySwipeRef.current = true
      animate(y, dragBottomPx, {
        duration: reduceMotion ? 0 : 0.22,
        ease: 'easeOut',
        onComplete: () => onOpenChange(false),
      })
    },
    [closeThresholdPx, dragBottomPx, onOpenChange, preventClose, reduceMotion, y]
  )

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: Z_INDEX.drawer }}>
      <DrawerOverlay
        className={overlayClassName}
        reduceVisualEffects={reduceVisualEffects}
        onClick={handleOverlayClick}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0, pointerEvents: 'auto' }}
        exit={{ y: '100%', pointerEvents: 'none' }}
        transition={
          reduceVisualEffects
            ? { duration: reduceMotion ? 0 : 0.22, ease: 'easeOut' }
            : { type: 'spring', damping: 25, stiffness: 200 }
        }
        drag={preventClose ? false : 'y'}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: dragBottomPx }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        className={cn(
          'fixed bottom-0 left-1/2 z-10 flex w-full max-w-2xl -translate-x-1/2 flex-col min-h-0 overflow-hidden overscroll-y-contain',
          'rounded-t-2xl border-t border-border bg-background shadow-[var(--shadow-modal)] dark:shadow-none',
          'dark:bg-card border-t-border',
          className
        )}
        style={{
          y,
          bottom: bottomOffsetPx,
          maxHeight: `min(80vh, calc(100vh - ${bottomOffsetPx}px - 20px))`,
        }}
        role="dialog"
        aria-modal="true"
        ref={contentRef}
      >
        <div
          className={cn(
            'flex shrink-0 justify-center bg-inherit pt-3 pb-2 touch-none select-none',
            preventClose ? undefined : 'cursor-grab active:cursor-grabbing'
          )}
          onPointerDown={e => {
            if (preventClose) return
            dragControls.start(e)
          }}
        >
          <div className="h-1.5 w-14 shrink-0 rounded-full bg-border" />
        </div>
        {children}
      </motion.div>
    </div>
  )
})

export const Drawer = ({
  open,
  onOpenChange,
  children,
  preventClose,
  bottomOffsetPx,
  overlayClassName,
  onTelegramBack,
}: DrawerProps) => {
  const resolvedBottomOffset = typeof bottomOffsetPx === 'number' ? bottomOffsetPx : 0
  const telegramBackRef = useRef(onTelegramBack)
  const onOpenChangeRef = useRef(onOpenChange)
  const preventCloseRef = useRef(preventClose)
  useLayoutEffect(() => {
    telegramBackRef.current = onTelegramBack
    onOpenChangeRef.current = onOpenChange
    preventCloseRef.current = preventClose
  })

  const stableTelegramBack = useCallback(() => {
    if (telegramBackRef.current) {
      telegramBackRef.current()
      return
    }
    if (!preventCloseRef.current) onOpenChangeRef.current(false)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventCloseRef.current) onOpenChangeRef.current(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    if (preventClose && !onTelegramBack) return
    return setupTelegramBackButton(stableTelegramBack)
  }, [stableTelegramBack, onTelegramBack, open, preventClose])

  const node = (
    <AnimatePresence>
      {open && (
        <DrawerContent
          onOpenChange={onOpenChange}
          preventClose={preventClose}
          bottomOffsetPx={resolvedBottomOffset}
          overlayClassName={overlayClassName}
        >
          {children}
        </DrawerContent>
      )}
    </AnimatePresence>
  )

  return typeof document !== 'undefined' ? createPortal(node, document.body) : node
}

// ----- Subcomponents (чтобы импорты не ломались) -----

export const DrawerFrame = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn('flex min-h-0 flex-col bg-background dark:bg-card', className)} {...props} />
  )
}

export const DrawerBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      data-scroll-container="true"
      className={cn(
        'flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y ui-density-page ui-density-py',
        className
      )}
      {...props}
    />
  )
}

export const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 border-b border-border/50 ui-density-page ui-density-py-sm',
        className
      )}
      {...props}
    />
  )
}

type DrawerFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  contentClassName?: string
}

export const DrawerFooter = ({ className, contentClassName, ...props }: DrawerFooterProps) => {
  return (
    <BottomActionBar
      mode="static"
      withBorder
      transparent
      className={cn('mt-auto', className)}
      contentClassName={cn('flex flex-col gap-2', contentClassName)}
      {...props}
    />
  )
}

export const DrawerTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  return <h2 className={cn(MODAL_TITLE_CLASS, className)} {...props} />
}

export const DrawerDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />
}

type DrawerCloseButtonProps = {
  onClick: () => void
  ariaLabel?: string
  className?: string
}

export const DrawerCloseButton = ({ onClick, ariaLabel, className }: DrawerCloseButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'p-1 text-muted-foreground transition-colors',
        'hover:bg-secondary/50 hover:text-foreground',
        className
      )}
    >
      <X className="h-5 w-5 shrink-0" />
    </button>
  )
}
