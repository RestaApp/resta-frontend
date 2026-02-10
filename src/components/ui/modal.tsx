import { useEffect, useRef, memo, useId, useState, useMemo, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/utils/cn'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'

const ModalA11yContext = createContext<{
  titleId: string
  descriptionId: string
  setHasDescription: (value: boolean) => void
} | null>(null)

export function useModalA11y() {
  return useContext(ModalA11yContext)
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
  initialFocusSelector?: string
}

const getFocusable = (root: HTMLElement) =>
  Array.from(
    root.querySelectorAll<HTMLElement>(
      'a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])'
    )
  ).filter(
    (el) =>
      !el.hasAttribute('disabled') &&
      el.getAttribute('aria-hidden') !== 'true' &&
      el.offsetParent != null
  )

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
  const titleId = useId()
  const descriptionId = useId()
  const [hasDescription, setHasDescription] = useState(false)

  useBodyScrollLock(isOpen)

  useEffect(() => {
    if (isOpen) setHasDescription(false)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return

    const prevActive = document.activeElement as HTMLElement | null

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
      prevActive?.focus?.()
    }
  }, [isOpen, onClose, closeOnEsc, initialFocusSelector])

  const handleBackdropPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!closeOnBackdrop) return
    if (e.target === e.currentTarget) onClose()
  }

  const a11yValue = useMemo(
    () => ({ titleId, descriptionId, setHasDescription }),
    [titleId, descriptionId]
  )

  const node = (
    <AnimatePresence>
      {isOpen && (
        <ModalA11yContext.Provider value={a11yValue}>
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              aria-hidden
              onPointerDown={handleBackdropPointerDown}
            />

            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={hasDescription ? descriptionId : undefined}
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={cn('relative z-[61] w-full max-w-md outline-none', className)}
            >
              {children}
            </motion.div>
          </motion.div>
        </ModalA11yContext.Provider>
      )}
    </AnimatePresence>
  )

  return typeof document !== 'undefined' ? createPortal(node, document.body) : node
})
