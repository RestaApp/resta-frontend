import { memo, useCallback, useEffect, useRef, useState } from 'react'
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
import { cn } from '@/utils/cn'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'

export type DrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children?: React.ReactNode
  preventClose?: boolean

  /**
   * Новый API: явный отступ снизу (например высота BottomNav)
   */
  bottomOffsetPx?: number
}

type OverlayProps = {
  className?: string
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

const DrawerOverlay = memo(({ className, onClick }: OverlayProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1, pointerEvents: 'auto' }}
    exit={{ opacity: 0, pointerEvents: 'none' }}
    transition={{ duration: 0.18 }}
    className={cn('fixed inset-0 bg-black/50', className)}
    onClick={onClick}
    aria-hidden="true"
  />
))
DrawerOverlay.displayName = 'DrawerOverlay'

type DrawerContentProps = {
  className?: string
  children?: React.ReactNode
  onOpenChange: (open: boolean) => void
  preventClose?: boolean
  bottomOffsetPx: number
}

const DrawerContent = memo(function DrawerContent({
  className,
  children,
  onOpenChange,
  preventClose,
  bottomOffsetPx,
}: DrawerContentProps) {
  const reduceMotion = useReducedMotion()
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

    return () => cleanup.forEach((fn) => fn())
  }, [bottomOffsetPx])

  const closeThresholdPx = Math.min(180, contentHeightPx > 0 ? contentHeightPx * 0.25 : 140)
  const dragBottomPx = Math.max(0, contentHeightPx + bottomOffsetPx + 40)

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (preventClose) return
      if (isClosingBySwipeRef.current) return

      const shouldClose = info.offset.y >= closeThresholdPx || info.velocity.y > 800
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
    <div className="fixed inset-0 z-[60] pointer-events-none">
      <DrawerOverlay onClick={handleOverlayClick} />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0, pointerEvents: 'auto' }}
        exit={{ y: '100%', pointerEvents: 'none' }}
        transition={
          reduceMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 200 }
        }
        drag={preventClose ? false : 'y'}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: dragBottomPx }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        className={cn(
          'fixed inset-x-0 z-10 flex flex-col overflow-y-auto overscroll-contain',
          'rounded-t-2xl border-t border-border bg-background shadow-lg dark:shadow-none',
          'dark:bg-[var(--drawer-surface)] dark:border-t-[rgba(255,255,255,0.06)]',
          className
        )}
        style={{
          y,
          bottom: bottomOffsetPx,
          maxHeight: `min(85vh, calc(100vh - ${bottomOffsetPx}px - 20px))`,
        }}
        role="dialog"
        aria-modal="true"
        ref={contentRef}
      >
        <div
          className={cn(
            'sticky top-0 z-20 flex justify-center pt-4 pb-2',
            'bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-sm',
            preventClose ? undefined : 'cursor-grab active:cursor-grabbing'
          )}
          onPointerDown={(e) => {
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
}: DrawerProps) => {
  const resolvedBottomOffset = typeof bottomOffsetPx === 'number' ? bottomOffsetPx : 0

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventClose) onOpenChange(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, preventClose, onOpenChange])

  const node = (
    <AnimatePresence>
      {open && (
        <DrawerContent
          onOpenChange={onOpenChange}
          preventClose={preventClose}
          bottomOffsetPx={resolvedBottomOffset}
        >
          {children}
        </DrawerContent>
      )}
    </AnimatePresence>
  )

  return typeof document !== 'undefined' ? createPortal(node, document.body) : node
}

// ----- Subcomponents (чтобы импорты не ломались) -----

export const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('flex flex-col gap-1.5 p-4', className)} {...props} />
}

export const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('mt-auto flex flex-col gap-2 p-4', className)} {...props} />
}

export const DrawerTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  return <h2 className={cn('text-lg font-semibold text-foreground', className)} {...props} />
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
        'min-h-[44px] min-w-[44px] rounded-lg p-2 text-muted-foreground transition-colors',
        'hover:bg-muted/50 hover:text-foreground',
        className
      )}
    >
      <X className="h-5 w-5 shrink-0" />
    </button>
  )
}
