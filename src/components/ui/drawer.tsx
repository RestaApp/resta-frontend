import { memo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { cn } from '@/utils/cn'

export type DrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children?: React.ReactNode
  preventClose?: boolean

  /**
   * Новый API: явный отступ снизу (например высота BottomNav)
   */
  bottomOffsetPx?: number

  /**
   * Backward-compat: старый проп.
   * Если true -> отступ снизу (примерно под BottomNav), если false -> 0.
   */
  hasBottomNav?: boolean
}

type OverlayProps = {
  className?: string
  onClick?: () => void
}

const DrawerOverlay = memo(({ className, onClick }: OverlayProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.18 }}
    className={cn('fixed inset-0 z-50 bg-black/50', className)}
    onPointerDown={onClick}
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

  const handleOverlayClick = useCallback(() => {
    if (!preventClose) onOpenChange(false)
  }, [preventClose, onOpenChange])

  return (
    <>
      <DrawerOverlay onClick={handleOverlayClick} />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'fixed inset-x-0 z-50 flex max-h-[85vh] flex-col overflow-y-auto overscroll-contain',
          'rounded-t-2xl border-t border-border bg-background shadow-xl',
          className
        )}
        style={{ bottom: bottomOffsetPx }}
        role="dialog"
        aria-modal="true"
      >
        <div className="mx-auto mt-4 h-2 w-[100px] shrink-0 rounded-full bg-muted" />
        {children}
      </motion.div>
    </>
  )
})

let openDrawerCount = 0

export const Drawer = ({
  open,
  onOpenChange,
  children,
  preventClose,
  bottomOffsetPx,
  hasBottomNav,
}: DrawerProps) => {
  // Backward-compat: если bottomOffsetPx не задан — вычисляем от hasBottomNav
  const resolvedBottomOffset =
    typeof bottomOffsetPx === 'number'
      ? bottomOffsetPx
      : hasBottomNav
        ? 76 // подстрой под реальную высоту BottomNav (например 76/88)
        : 0

  useEffect(() => {
    if (!open || typeof document === 'undefined') return

    const { body } = document

    if (openDrawerCount === 0) {
      body.dataset.drawerOverflow = body.style.overflow
      body.style.overflow = 'hidden'
    }
    openDrawerCount += 1

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventClose) onOpenChange(false)
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      openDrawerCount = Math.max(0, openDrawerCount - 1)

      if (openDrawerCount === 0) {
        body.style.overflow = body.dataset.drawerOverflow ?? ''
        delete body.dataset.drawerOverflow
      }
    }
  }, [open, onOpenChange, preventClose])

  return (
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