import { useCallback, useEffect, useLayoutEffect, useRef, memo, useId, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/shared/utils/cn'
import { useReducedVisualEffects } from '@/shared/lib/hooks/useReducedVisualEffects'
import { useBodyScrollLock } from '@/shared/lib/hooks/useBodyScrollLock'
import { useFocusTrap } from '@/shared/lib/hooks/useFocusTrap'
import { OVERLAY_SCRIM_CLASS } from './ui-patterns'
import { Z_INDEX } from '@/shared/ui/zIndex'
import { ModalA11yContext } from './modal-a11y'
import { setupTelegramBackButton } from '@/shared/utils/telegram'

type ModalOverlayProps = {
  reduceVisualEffects?: boolean
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

const ModalOverlay = memo(({ reduceVisualEffects, onClick }: ModalOverlayProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1, pointerEvents: 'auto' }}
    exit={{ opacity: 0, pointerEvents: 'none' }}
    transition={{ duration: 0.18 }}
    className={cn(
      'fixed inset-0',
      OVERLAY_SCRIM_CLASS,
      reduceVisualEffects ? 'backdrop-blur-none' : undefined
    )}
    onClick={onClick}
    aria-hidden="true"
  />
))
ModalOverlay.displayName = 'ModalOverlay'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
  initialFocusSelector?: string
}

export const Modal = memo(function Modal({
  isOpen,
  onClose,
  children,
  className,
  closeOnBackdrop = true,
  closeOnEsc = true,
  initialFocusSelector,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const reduceVisualEffects = useReducedVisualEffects()
  const titleId = useId()
  const descriptionId = useId()
  const onCloseRef = useRef(onClose)
  useLayoutEffect(() => {
    onCloseRef.current = onClose
  })
  const stableClose = useCallback(() => onCloseRef.current(), [])

  useBodyScrollLock(isOpen)

  useEffect(() => {
    if (!isOpen || !closeOnEsc) return
    return setupTelegramBackButton(stableClose)
  }, [closeOnEsc, isOpen, stableClose])

  useFocusTrap({
    active: isOpen,
    containerRef: dialogRef,
    initialFocusSelector,
    onEscape: closeOnEsc ? stableClose : undefined,
  })

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdrop) return
    if (e.target !== e.currentTarget) return
    onClose()
  }

  const a11yValue = useMemo(() => ({ titleId, descriptionId }), [titleId, descriptionId])

  const node = (
    <AnimatePresence>
      {isOpen && (
        <ModalA11yContext.Provider value={a11yValue}>
          <div
            className="fixed inset-0 flex items-center justify-center ui-density-page ui-density-py pointer-events-none"
            style={{ zIndex: Z_INDEX.modal }}
          >
            <ModalOverlay reduceVisualEffects={reduceVisualEffects} onClick={handleBackdropClick} />

            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, pointerEvents: 'auto' }}
              exit={{ opacity: 0, scale: 0.95, y: 20, pointerEvents: 'none' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={cn('relative z-10 w-full max-w-md outline-none', className)}
            >
              {children}
            </motion.div>
          </div>
        </ModalA11yContext.Provider>
      )}
    </AnimatePresence>
  )

  return typeof document !== 'undefined' ? createPortal(node, document.body) : node
})
