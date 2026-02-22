import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useDragControls, useReducedMotion, type PanInfo } from 'motion/react'
import { createPortal } from 'react-dom'
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
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
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
  const didCloseByDragRef = useRef(false)
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

  const handleDrag = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (preventClose) return
      if (didCloseByDragRef.current) return
      if (info.offset.y >= closeThresholdPx) {
        didCloseByDragRef.current = true
        onOpenChange(false)
      }
    },
    [closeThresholdPx, onOpenChange, preventClose]
  )

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (preventClose) return
      if (didCloseByDragRef.current) return
      if (info.offset.y >= closeThresholdPx || info.velocity.y > 800) onOpenChange(false)
    },
    [closeThresholdPx, onOpenChange, preventClose]
  )

  return (
    <div className="fixed inset-0 z-[60]">
      <DrawerOverlay onClick={handleOverlayClick} />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={
          reduceMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 200 }
        }
        drag={preventClose ? false : 'y'}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: dragBottomPx }}
        dragElastic={0.1}
        dragMomentum={false}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className={cn(
          'fixed inset-x-0 z-10 flex flex-col overflow-y-auto overscroll-contain',
          'rounded-t-2xl border-t border-border bg-background shadow-xl',
          className
        )}
        style={{
          bottom: bottomOffsetPx,
          maxHeight: `min(85vh, calc(100vh - ${bottomOffsetPx}px - 20px))`,
        }}
        role="dialog"
        aria-modal="true"
        ref={contentRef}
      >
        <div
          className={cn(
            'flex justify-center pt-4',
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
