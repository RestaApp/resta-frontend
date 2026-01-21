import { useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/utils/cn'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
  initialFocusSelector?: string // например: '[data-autofocus]'
}

let openModalCount = 0

const lockBodyScroll = () => {
  const { body } = document
  if (openModalCount === 0) {
    body.dataset.prevOverflow = body.style.overflow
    body.style.overflow = 'hidden'
  }
  openModalCount += 1
}

const unlockBodyScroll = () => {
  const { body } = document
  openModalCount = Math.max(0, openModalCount - 1)
  if (openModalCount === 0) {
    body.style.overflow = body.dataset.prevOverflow ?? ''
    delete body.dataset.prevOverflow
  }
}

const getFocusable = (root: HTMLElement) =>
  Array.from(
    root.querySelectorAll<HTMLElement>(
      'a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])'
    )
  ).filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true')

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

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return

    lockBodyScroll()

    const prevActive = document.activeElement as HTMLElement | null

    // Фокус внутрь
    queueMicrotask(() => {
      const root = dialogRef.current
      if (!root) return

      const target = initialFocusSelector
        ? (root.querySelector(initialFocusSelector) as HTMLElement | null)
        : null

      if (target) {
        target.focus()
        return
      }

      const focusables = getFocusable(root)
      if (focusables[0]) focusables[0].focus()
      else root.focus()
    })

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc) {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key === 'Tab') {
        const root = dialogRef.current
        if (!root) return

        const focusables = getFocusable(root)
        if (focusables.length === 0) {
          e.preventDefault()
          return
        }

        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        const active = document.activeElement

        if (e.shiftKey && active === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      unlockBodyScroll()
      prevActive?.focus?.()
    }
  }, [isOpen, onClose, closeOnEsc, initialFocusSelector])

  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdrop) return
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={handleOverlayMouseDown}
          aria-hidden={false}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn('relative z-[61] w-full max-w-md outline-none', className)}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})