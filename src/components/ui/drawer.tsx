import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  motion,
  AnimatePresence,
  useDragControls,
  useReducedMotion,
  type PanInfo,
} from 'motion/react'
import { createPortal } from 'react-dom'
import { cn } from '@/utils/cn'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'

export type DrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children?: React.ReactNode
  preventClose?: boolean
  bottomOffsetPx?: number

  /** если true — разрешаем “pull-to-close” когда scrollTop=0 */
  enableContentDragToClose?: boolean
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
    className={cn('fixed inset-0 bg-black/50 touch-none', className)}
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
  enableContentDragToClose: boolean
}

const DrawerContent = memo(function DrawerContent({
  className,
  children,
  onOpenChange,
  preventClose,
  bottomOffsetPx,
  enableContentDragToClose,
}: DrawerContentProps) {
  const reduceMotion = useReducedMotion()
  const dragControls = useDragControls()
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const didCloseByDragRef = useRef(false)
  const [sheetHeightPx, setSheetHeightPx] = useState(600)

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return
      if (!preventClose) onOpenChange(false)
    },
    [preventClose, onOpenChange]
  )

  // меряем высоту шита, чтобы адекватно ограничить dragConstraints
  useEffect(() => {
    const el = sheetRef.current
    if (!el) return

    const measure = () => setSheetHeightPx(el.getBoundingClientRect().height)
    measure()

    window.addEventListener('resize', measure)
    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure)
      ro.observe(el)
    }

    return () => {
      window.removeEventListener('resize', measure)
      ro?.disconnect()
    }
  }, [bottomOffsetPx])

  const closeThresholdPx = useMemo(
    () => Math.min(180, sheetHeightPx > 0 ? sheetHeightPx * 0.25 : 140),
    [sheetHeightPx]
  )

  const dragBottomPx = useMemo(
    () => Math.max(0, sheetHeightPx + bottomOffsetPx + 40),
    [sheetHeightPx, bottomOffsetPx]
  )

  const closeByDrag = useCallback(() => {
    if (preventClose) return
    if (didCloseByDragRef.current) return
    didCloseByDragRef.current = true
    onOpenChange(false)
  }, [onOpenChange, preventClose])

  const handleDrag = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (preventClose) return
      if (didCloseByDragRef.current) return
      if (info.offset.y >= closeThresholdPx) closeByDrag()
    },
    [preventClose, closeThresholdPx, closeByDrag]
  )

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (preventClose) return
      if (didCloseByDragRef.current) return
      if (info.offset.y >= closeThresholdPx || info.velocity.y > 800) closeByDrag()
    },
    [preventClose, closeThresholdPx, closeByDrag]
  )

  // Важно: разрешаем старт drag из контента только когда scrollTop === 0
  const onContentPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (preventClose) return
      if (!enableContentDragToClose) return

      const scroller = scrollRef.current
      if (!scroller) return

      // если контент НЕ вверху — пусть это будет обычный скролл
      if (scroller.scrollTop > 0) return

      // если тянут вниз “из верхней позиции” — отдаём управление drag’у
      // (motion сам решит, что это drag, когда будет движение)
      dragControls.start(e)
    },
    [preventClose, enableContentDragToClose, dragControls]
  )

  return (
    <div className="fixed inset-0 z-[60]">
      <DrawerOverlay onClick={handleOverlayClick} />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={
          reduceMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 260 }
        }
        drag={preventClose ? false : 'y'}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: dragBottomPx }}
        dragElastic={0.12}
        dragMomentum={false}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className={cn(
          'fixed inset-x-0 z-10 flex flex-col',
          'rounded-t-2xl border-t border-border bg-background shadow-xl',
          'overscroll-contain',
          className
        )}
        style={{
          bottom: bottomOffsetPx,
          maxHeight: `min(85vh, calc(100vh - ${bottomOffsetPx}px - 20px))`,
        }}
        role="dialog"
        aria-modal="true"
        ref={sheetRef}
      >
        {/* handle */}
        <div
          className={cn(
            'flex justify-center pt-4 select-none',
            preventClose ? undefined : 'cursor-grab active:cursor-grabbing'
          )}
          onPointerDown={e => {
            if (preventClose) return
            e.preventDefault()
            dragControls.start(e)
          }}
        >
          <div className="h-2 w-[100px] shrink-0 rounded-full bg-muted" />
        </div>

        {/* scrollable content */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
          onPointerDown={onContentPointerDown}
        >
          {children}
        </div>
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
  enableContentDragToClose = true,
}: DrawerProps) => {
  const resolvedBottomOffset = typeof bottomOffsetPx === 'number' ? bottomOffsetPx : 0

  // ✅ блокируем фон всегда, пока drawer открыт
  useBodyScrollLock(open)

  // ESC
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
          enableContentDragToClose={enableContentDragToClose}
        >
          {children}
        </DrawerContent>
      )}
    </AnimatePresence>
  )

  return typeof document !== 'undefined' ? createPortal(node, document.body) : node
}

// ---- subcomponents ----

export const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-1.5 p-4', className)} {...props} />
)

export const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-auto flex flex-col gap-2 p-4', className)} {...props} />
)

export const DrawerTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn('text-lg font-semibold text-foreground', className)} {...props} />
)

export const DrawerDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props} />
)