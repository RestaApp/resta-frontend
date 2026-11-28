import { memo, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef } from 'react'
import { animate, motion, AnimatePresence, useMotionValue, useReducedMotion } from 'motion/react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { BottomActionBar } from '@/components/ui/bottom-action-bar'
import { MODAL_TITLE_CLASS } from '@/components/ui/ui-patterns'
import { useTelegramFullscreenOffset } from '@/app/contexts/telegram/useTelegramFullscreenOffset'
import { useReducedVisualEffects } from '@/shared/lib/hooks/useReducedVisualEffects'
import { OVERLAY_SCRIM_CLASS } from './ui-patterns'
import { cn } from '@/shared/utils/cn'
import { useBodyScrollLock } from '@/shared/lib/hooks/useBodyScrollLock'
import { useFocusTrap } from '@/shared/lib/hooks/useFocusTrap'
import { Z_INDEX } from '@/shared/ui/zIndex'
import { setupTelegramBackButton } from '@/shared/utils/telegram'
import { DrawerA11yContext, useDrawerA11y } from './drawer-a11y'

export type DrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children?: React.ReactNode
  preventClose?: boolean
  overlayClassName?: string
  onTelegramBack?: () => void
  initialFocusSelector?: string

  /**
   * Новый API: явный отступ снизу (например высота BottomNav)
   */
  bottomOffsetPx?: number

  /**
   * Закрыть без анимации ухода. Нужно, когда шторку сменяет другой экран
   * (переход из уведомления в детали): иначе она ещё полсекунды уезжает вниз
   * уже под новым экраном и видна в полосе нижней навигации.
   */
  instantClose?: boolean
}

/**
 * Варианты ухода получают `instantClose` через `custom` у AnimatePresence —
 * единственный способ передать свежее значение уже удаляемому элементу.
 */
const OVERLAY_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, pointerEvents: 'auto' },
  exit: (instant: boolean) => ({
    opacity: 0,
    pointerEvents: 'none',
    ...(instant ? { transition: { duration: 0 } } : undefined),
  }),
} as const

const PANEL_VARIANTS = {
  hidden: { y: '100%' },
  visible: { y: 0, pointerEvents: 'auto' },
  exit: (instant: boolean) => ({
    y: '100%',
    pointerEvents: 'none',
    ...(instant ? { transition: { duration: 0 } } : undefined),
  }),
} as const

type OverlayProps = {
  className?: string
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

const DrawerOverlay = memo(({ className, onClick }: OverlayProps) => (
  <motion.div
    variants={OVERLAY_VARIANTS}
    initial="hidden"
    animate="visible"
    exit="exit"
    transition={{ duration: 0.18 }}
    // Без backdrop-blur: размытие всего экрана под шторкой во время spring-анимации —
    // главная причина рывков на первом открытии (iOS WebView). Scrim только затемняет.
    className={cn('fixed inset-0 backdrop-blur-none', OVERLAY_SCRIM_CLASS, className)}
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
  titleId: string
  descriptionId: string
  initialFocusSelector?: string
}

// Порог скорости флика вниз (px/s), после которого отпускание закрывает шторку
const FLICK_VELOCITY = 400
// На сколько нужно стянуть шторку вниз, чтобы отпускание её закрыло
const CLOSE_THRESHOLD_PX = 72
// Резиновое сопротивление при свайпе вниз, когда закрытие запрещено
const RUBBER_MAX_PX = 24
// Зазор между верхом шторки и верхом экрана
const TOP_GAP_PX = 20
// Высота top-controls Telegram в iOS fullscreen (== `top-20` в useTelegramFullscreenOffset)
const TELEGRAM_TOP_CONTROLS_PX = 80

const DrawerContent = memo(function DrawerContent({
  className,
  overlayClassName,
  children,
  onOpenChange,
  preventClose,
  bottomOffsetPx,
  titleId,
  descriptionId,
  initialFocusSelector,
}: DrawerContentProps) {
  const reduceMotion = useReducedMotion()
  const reduceVisualEffects = useReducedVisualEffects()
  const { shouldApply: fullscreenOffset } = useTelegramFullscreenOffset()
  // Место, которое панель не занимает: отступ снизу, зазор сверху и top-controls Telegram.
  const reservedPx = bottomOffsetPx + TOP_GAP_PX + (fullscreenOffset ? TELEGRAM_TOP_CONTROLS_PX : 0)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const isClosingBySwipeRef = useRef(false)
  // Сдвиг панели вниз под пальцем — жест закрытия.
  const y = useMotionValue(0)
  const draggingRef = useRef(false)
  const dragStartYRef = useRef(0)
  const velocityRef = useRef({ clientY: 0, t: 0, v: 0 })

  useBodyScrollLock(true)
  useFocusTrap({
    active: true,
    containerRef: contentRef,
    initialFocusSelector,
    onEscape: preventClose ? undefined : () => onOpenChange(false),
  })

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return
      if (!preventClose) onOpenChange(false)
    },
    [preventClose, onOpenChange]
  )

  const finishClose = useCallback(() => {
    isClosingBySwipeRef.current = true
    const offscreen = (contentRef.current?.offsetHeight ?? window.innerHeight) + bottomOffsetPx + 40
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

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isClosingBySwipeRef.current) return
    draggingRef.current = true
    e.currentTarget.setPointerCapture?.(e.pointerId)
    dragStartYRef.current = e.clientY
    velocityRef.current = { clientY: e.clientY, t: performance.now(), v: 0 }
  }, [])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return

      // скорость (px/s), положительная — вниз
      const now = performance.now()
      const dt = now - velocityRef.current.t
      if (dt > 0) {
        velocityRef.current.v = ((e.clientY - velocityRef.current.clientY) / dt) * 1000
        velocityRef.current.clientY = e.clientY
        velocityRef.current.t = now
      }

      const down = Math.max(0, e.clientY - dragStartYRef.current)
      y.set(preventClose ? Math.min(down, RUBBER_MAX_PX) : down)
    },
    [preventClose, y]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return
      draggingRef.current = false
      e.currentTarget.releasePointerCapture?.(e.pointerId)

      const shouldClose = y.get() >= CLOSE_THRESHOLD_PX || velocityRef.current.v > FLICK_VELOCITY
      if (!preventClose && shouldClose) {
        finishClose()
        return
      }
      animate(y, 0, snapAnim)
    },
    [finishClose, preventClose, snapAnim, y]
  )

  return (
    // Рамка шторки. Панель всегда на всю её высоту (за вычетом зазоров), а
    // позиционируется и получает размеры ТОЛЬКО от неё (absolute + проценты) —
    // не от окна напрямую (fixed, vh, innerHeight) и не от
    // `--tg-viewport-stable-height`. При появлении клавиатуры эти источники
    // обновляются в разное время: Telegram сообщает новую высоту раньше, чем
    // сжимается сам WebView. При смешении панель успевала стать короче, пока её
    // низ ещё стоял у старого низа экрана, — шторка «падала» до середины и
    // возвращалась.
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: Z_INDEX.drawer }}>
      <DrawerOverlay className={overlayClassName} onClick={handleOverlayClick} />
      <motion.div
        variants={PANEL_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={
          reduceVisualEffects
            ? { duration: reduceMotion ? 0 : 0.22, ease: 'easeOut' }
            : { type: 'spring', damping: 25, stiffness: 200 }
        }
        className={cn(
          'absolute bottom-0 left-1/2 z-10 flex w-full max-w-2xl -translate-x-1/2 flex-col min-h-0 overflow-hidden overscroll-y-contain',
          'rounded-t-2xl border-t border-border bg-background shadow-[var(--shadow-modal)] dark:shadow-none',
          'dark:bg-card border-t-border',
          className
        )}
        style={{
          y,
          bottom: bottomOffsetPx,
          height: `calc(100% - ${reservedPx}px)`,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
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
  instantClose = false,
  overlayClassName,
  onTelegramBack,
  initialFocusSelector,
}: DrawerProps) => {
  const resolvedBottomOffset = typeof bottomOffsetPx === 'number' ? bottomOffsetPx : 0
  const telegramBackRef = useRef(onTelegramBack)
  const onOpenChangeRef = useRef(onOpenChange)
  const preventCloseRef = useRef(preventClose)
  const titleId = useId()
  const descriptionId = useId()
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
    if (preventClose && !telegramBackRef.current) return
    return setupTelegramBackButton(stableTelegramBack)
  }, [stableTelegramBack, open, preventClose])

  const a11yValue = useMemo(() => ({ titleId, descriptionId }), [descriptionId, titleId])

  const node = (
    <AnimatePresence custom={instantClose}>
      {open && (
        <DrawerA11yContext.Provider value={a11yValue}>
          <DrawerContent
            onOpenChange={onOpenChange}
            preventClose={preventClose}
            bottomOffsetPx={resolvedBottomOffset}
            overlayClassName={overlayClassName}
            titleId={titleId}
            descriptionId={descriptionId}
            initialFocusSelector={initialFocusSelector}
          >
            {children}
          </DrawerContent>
        </DrawerA11yContext.Provider>
      )}
    </AnimatePresence>
  )

  return typeof document !== 'undefined' ? createPortal(node, document.body) : node
}

// ----- Subcomponents (чтобы импорты не ломались) -----

export const DrawerFrame = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('flex min-h-0 flex-1 flex-col bg-background dark:bg-card', className)}
      {...props}
    />
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
  const a11y = useDrawerA11y()
  const fallbackId = useId()
  const titleId = props.id ?? a11y?.titleId ?? fallbackId

  return <h2 id={titleId} className={cn(MODAL_TITLE_CLASS, className)} {...props} />
}

export const DrawerDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
  const a11y = useDrawerA11y()
  const fallbackId = useId()
  const descriptionId = props.id ?? a11y?.descriptionId ?? fallbackId

  return (
    <p id={descriptionId} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
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
