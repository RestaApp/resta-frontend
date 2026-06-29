import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  animate,
  motion,
  AnimatePresence,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { BottomActionBar } from '@/components/ui/bottom-action-bar'
import { MODAL_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { useTelegramFullscreenOffset } from '@/app/contexts/telegram/useTelegramFullscreenOffset'
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

// Порог скорости флика (px/s) для закрытия / разворота жестом
const FLICK_VELOCITY = 400
// Резиновое сопротивление при свайпе вниз, когда закрытие запрещено
const RUBBER_MAX_PX = 24
// Базовый верхний зазор полноэкранного состояния (как `- 20px` в maxHeight свёрнутого)
const FULLSCREEN_TOP_GAP_PX = 20
// Высота top-controls Telegram в iOS fullscreen (== `top-20` в useTelegramFullscreenOffset)
const TELEGRAM_TOP_CONTROLS_PX = 80

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
  const { shouldApply: fullscreenOffset, viewportHeight } = useTelegramFullscreenOffset()
  // Отступ сверху для полного экрана: базовый зазор + top-controls Telegram (iOS fullscreen)
  const topInsetPx = FULLSCREEN_TOP_GAP_PX + (fullscreenOffset ? TELEGRAM_TOP_CONTROLS_PX : 0)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const isClosingBySwipeRef = useRef(false)
  const y = useMotionValue(0)
  // min-height панели: 0 — высота по контенту (свёрнуто); растёт вверх до полного экрана
  const minH = useMotionValue(0)
  const minHeightStyle = useTransform(minH, v => `${v}px`)
  const [expanded, setExpanded] = useState(false)

  // Измеренная высота свёрнутого состояния (по контенту) и доступная высота под полный экран
  const collapsedHeightRef = useRef(0)
  const expandedHeightRef = useRef(0)
  const draggingRef = useRef(false)
  const dragStartRef = useRef({ clientY: 0, startHeight: 0 })
  const velocityRef = useRef({ clientY: 0, t: 0, v: 0 })

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

    const measure = () => {
      expandedHeightRef.current = Math.max(0, window.innerHeight - bottomOffsetPx - topInsetPx)
      if (!draggingRef.current && !expanded) {
        collapsedHeightRef.current = el.offsetHeight
      }
      if (!draggingRef.current && expanded) {
        // держим панель на всю доступную высоту при изменении вьюпорта
        minH.set(expandedHeightRef.current)
      }
    }
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
  }, [bottomOffsetPx, expanded, minH, topInsetPx])

  const finishClose = useCallback(() => {
    isClosingBySwipeRef.current = true
    const offscreen =
      (contentRef.current?.offsetHeight ?? expandedHeightRef.current) + bottomOffsetPx + 40
    animate(y, offscreen, {
      duration: reduceMotion ? 0 : 0.22,
      ease: 'easeOut',
      onComplete: () => onOpenChange(false),
    })
  }, [bottomOffsetPx, onOpenChange, reduceMotion, y])

  const snapAnim = useMemo(
    () =>
      reduceMotion ? { duration: 0 } : ({ type: 'spring', damping: 30, stiffness: 300 } as const),
    [reduceMotion]
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isClosingBySwipeRef.current) return
      draggingRef.current = true
      e.currentTarget.setPointerCapture?.(e.pointerId)
      dragStartRef.current = {
        clientY: e.clientY,
        startHeight: expanded ? expandedHeightRef.current : collapsedHeightRef.current,
      }
      velocityRef.current = { clientY: e.clientY, t: performance.now(), v: 0 }
    },
    [expanded]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return
      const { clientY, startHeight } = dragStartRef.current
      const collapsed = collapsedHeightRef.current
      const expandedH = expandedHeightRef.current

      // скорость (px/s), положительная — вниз
      const now = performance.now()
      const dt = now - velocityRef.current.t
      if (dt > 0) {
        velocityRef.current.v = ((e.clientY - velocityRef.current.clientY) / dt) * 1000
        velocityRef.current.clientY = e.clientY
        velocityRef.current.t = now
      }

      const target = startHeight + (clientY - e.clientY) // тянем вверх → выше
      if (target >= collapsed) {
        // растём вверх — низ запинён, увеличиваем min-height
        y.set(0)
        minH.set(Math.min(target, expandedH))
      } else {
        // ниже свёрнутого — это жест закрытия (сдвиг вниз)
        minH.set(0)
        const down = collapsed - target
        y.set(preventClose ? Math.min(down, RUBBER_MAX_PX) : down)
      }
    },
    [minH, preventClose, y]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return
      draggingRef.current = false
      e.currentTarget.releasePointerCapture?.(e.pointerId)

      const collapsed = collapsedHeightRef.current
      const expandedH = expandedHeightRef.current
      const v = velocityRef.current.v

      if (y.get() > 0) {
        // зона закрытия
        const closeThreshold = Math.min(72, Math.max(32, collapsed * 0.1))
        if (!preventClose && (y.get() >= closeThreshold || v > FLICK_VELOCITY)) {
          finishClose()
          return
        }
        setExpanded(false)
        animate(y, 0, snapAnim)
        animate(minH, 0, snapAnim)
        return
      }

      // зона роста — решаем: развернуть на весь экран или вернуть к контенту
      const currentH = contentRef.current?.offsetHeight ?? collapsed
      const midpoint = (collapsed + expandedH) / 2
      const wantExpand = currentH > midpoint || v < -FLICK_VELOCITY
      setExpanded(wantExpand)
      animate(y, 0, snapAnim)
      animate(minH, wantExpand ? expandedH : 0, snapAnim)
    },
    [finishClose, minH, preventClose, snapAnim, y]
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
        className={cn(
          'fixed bottom-0 left-1/2 z-10 flex w-full max-w-2xl -translate-x-1/2 flex-col min-h-0 overflow-hidden overscroll-y-contain',
          'rounded-t-2xl border-t border-border bg-background shadow-[var(--shadow-modal)] dark:shadow-none',
          'dark:bg-card border-t-border',
          className
        )}
        style={{
          y,
          minHeight: minHeightStyle,
          bottom: bottomOffsetPx,
          maxHeight: `min(90vh, calc(${viewportHeight} - ${bottomOffsetPx}px - ${topInsetPx}px))`,
        }}
        role="dialog"
        aria-modal="true"
        ref={contentRef}
      >
        <div
          className="flex shrink-0 cursor-grab touch-none select-none justify-center bg-inherit pt-3 pb-2 active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
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
    if (preventClose && !telegramBackRef.current) return
    return setupTelegramBackButton(stableTelegramBack)
  }, [stableTelegramBack, open, preventClose])

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
